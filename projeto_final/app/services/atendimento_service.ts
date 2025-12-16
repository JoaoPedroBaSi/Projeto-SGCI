import Disponibilidade from "#models/disponibilidade"
import Atendimento from "#models/atendimento"
import db from "@adonisjs/lucid/services/db"
import { TransactionClientContract } from "@adonisjs/lucid/types/database"
import { DateTime } from 'luxon'
import Sala from "#models/sala"
import User from "#models/user"
import { TransacaoService } from "./transacao_service.js"
import { inject } from "@adonisjs/core"

@inject()
export class AtendimentoService {
  constructor(protected transacaoService: TransacaoService
) {}
  public async criarAtendimento(dados: any, salaReservadaId: number, dataHoraInicioLuxon: DateTime, disponibilidade: Disponibilidade) {
    await db.transaction(async (trx: TransactionClientContract) => {
      // Criando uma variável/objeto, responsável por armazenar os valores criados para o atendimento
      const atendimentoData = {
        profissionalId: dados.profissional_id,
        clienteId: dados.cliente_id,
        salaId: salaReservadaId,
        disponibilidadeId: disponibilidade.id,
        observacoes: dados.observacoes,
        formaPagamento: dados.forma_pagamento,
        dataHoraInicio: dataHoraInicioLuxon,
        //Se tem disponibilidade nesse horário, é definido que o final do atendimento será
        //Igual ao final do slot
        dataHoraFim: disponibilidade.dataHoraFim,
      }

      await Atendimento.create(atendimentoData, { client: trx })

      //Salva o novo status do slot da disponibilidade
      //O Model.query() ou db.query() deve receber o { client: trx } para usar a transação
      await Disponibilidade.query({ client: trx })
          .where('id', disponibilidade.id) // Usa o ID do slot
          .update({ status: 'OCUPADO' })
  })
}

  public async atualizarAtendimento(dados: any, atendimento: Atendimento, usuarioLogado: User) {
    // Obter os dados atuais do slot antigo para eventual liberação
    const slotAntigo = await this.temDisponibilidade(
      atendimento.profissionalId,
      atendimento.dataHoraInicio
    )

    let disponibilidadeSlotNovo = null
    let dadosParaUpdate = { ...dados } as any;

    //Verifica se o profissional mudou
    const profissionalMudou = dados.profissional_id && dados.profissional_id !== atendimento.profissionalId
    //Verifica se o usuário informou uma nova data hora para começar o atendimento
    const horarioMudou = dados.data_hora_inicio && DateTime.fromJSDate(dados.data_hora_inicio).toSeconds() !== atendimento.dataHoraInicio.toSeconds()

    // Se o horário ou profissional mudou, precisamos validar o novo slot
    if (horarioMudou || profissionalMudou) {
      const dataHoraInicioLuxon = DateTime.fromJSDate(dados.data_hora_inicio || atendimento.dataHoraInicio.toJSDate())
      const profissionalIdNovo = dados.profissional_id || atendimento.profissionalId

      disponibilidadeSlotNovo = await this.temDisponibilidade(
        profissionalIdNovo,
        dataHoraInicioLuxon
      )

      if (!disponibilidadeSlotNovo)
        throw new Error('O novo horário solicitado não está na disponibilidade do profissional.')
      if (disponibilidadeSlotNovo.status === 'OCUPADO')
        throw new Error('O horário solicitado já está marcado para outro atendimento.')
      if (disponibilidadeSlotNovo.status === 'BLOQUEADO')
        throw new Error('O profissional se encontra indisponível para este horário.')
      if (disponibilidadeSlotNovo.status === 'FINALIZADO')
        throw new Error('O profissional já finalizou seus trabalhos nesse horário.')

      const salaReservada = await Sala.query().where('profissional_id', profissionalIdNovo).first()
      if (!salaReservada)
        throw new Error('Este profissional não tem nenhum sala reservada.')

      //Adiciona informações do novo slot ao update
      dadosParaUpdate.salaId = salaReservada.id;
      dadosParaUpdate.dataHoraInicio = dataHoraInicioLuxon;
      dadosParaUpdate.dataHoraFim = disponibilidadeSlotNovo.dataHoraFim;
      dadosParaUpdate.disponibilidadeId = disponibilidadeSlotNovo.id;
    }

    const usuarioValido = usuarioLogado.perfil_tipo === 'profissional' || usuarioLogado.perfil_tipo === 'admin'
    if (!usuarioValido) { //Se for cliente, remove campos restritos
        const camposRestritos = ['valor', 'status_pagamento', 'status'];
        for (const campo of camposRestritos) {
          delete dadosParaUpdate[campo];
        }
    }
    const statusFinal = dadosParaUpdate.status ?? atendimento.status
    const statusConcluido = statusFinal === 'CONCLUIDO'
    dadosParaUpdate.status = statusFinal // Garante que o status correto será salvo no final

    const valorPagamento = dadosParaUpdate.valor ?? atendimento.valor
    dadosParaUpdate.valor = valorPagamento // Garante que o valor correto será salvo no final

    //Processa se estiver 'CONCLUIDO' E o valor for > 0.
    const valorPositivo = typeof valorPagamento === 'number' && valorPagamento > 0
    const deveProcessarPagamento = statusConcluido && valorPositivo

    if (deveProcessarPagamento) {
      dadosParaUpdate.status_pagamento = 'PENDENTE'
      try {
        // CHAMA O SERVICE e obtém o status final do pagamento
        const novoStatusPagamento = await this.transacaoService.processarConclusaoAtendimento(
          atendimento,
          usuarioLogado, // Passa o usuário logado para o Service
          valorPagamento
        )
        // O Service deu sucesso: usa o status retornado (CONCLUIDO)
        dadosParaUpdate.status_pagamento = novoStatusPagamento
      } catch (error) {
        // O Service lançou uma exceção (Falha na transação, erro de lógica, etc.)
        console.error('Falha no processamento financeiro:', error)
        // O Controller define o status de falha e lança o erro para o usuário
        dadosParaUpdate.status_pagamento = 'NEGADO'
        // Relança o erro para a transação do DB ser cancelada e retornar 400
        throw new Error('A transação falhou. Tente novamente mais tarde.')
      }
    }

    await db.transaction(async (trx: TransactionClientContract) => {
      const precisaManipularSlots = horarioMudou || profissionalMudou;
      //Libera o Slot Antigo (Se houve mudança de tempo ou profissional)
      if (slotAntigo && precisaManipularSlots) {
        //Apenas liberamos se ele estava ocupado
        if (slotAntigo?.status === 'OCUPADO') {
          await Disponibilidade.query({ client: trx }).where('id', slotAntigo.id).update({ status: 'LIVRE' })
        }
      }
      //Ocupa o Slot Novo (Se houve mudança de tempo ou profissional)
      if (disponibilidadeSlotNovo && precisaManipularSlots) {
        await Disponibilidade.query({ client: trx }).where('id', disponibilidadeSlotNovo.id).update({ status: 'OCUPADO' })
      }

      //Salvando o atendimento
      atendimento.merge(dadosParaUpdate)
      atendimento.useTransaction(trx)
      await atendimento.save()

      if (atendimento.status === 'CONCLUIDO') {
        await Disponibilidade.query({ client: trx }).where('id', atendimento.disponibilidadeId).update({ status: 'FINALIZADO' })
      }
    })
  }
  public async temDisponibilidade(profissional_id: number, data_hora_inicio: DateTime): Promise<Disponibilidade | null> {
    //Faz a procura pelas informações da disponibilidade
    //Traz as disponibilidades de um profissional específico, a partir da tentativa de inserção
    //Na tabela de Atendimento. Depois disso, com os dados da disponibilidade do profissional
    //Da qual o cliente tá querendo se relacionar via atendimento, verifica a disponibilidade
    const horaConvertidaSql = data_hora_inicio.toSQL()

    if (!horaConvertidaSql) {
      console.error('Data hora de início é inválida após validação:', data_hora_inicio.invalidExplanation);
      return null;
    }

    const disponibilidade = await Disponibilidade
      .query()
      .where('profissional_id', profissional_id)
      .where('data_hora_inicio', horaConvertidaSql)
      .first()

    return disponibilidade
  }
  //Obs: o parametro "ignorarId" é opcional, já que somente é necessário para a operação de update
  public async temConflito(profissional_id: number, data_hora_inicio: DateTime, data_hora_fim: DateTime, ignorarId?: number){
    //Verifca se os valores passados (DateTime), são válidos
    if (!data_hora_inicio.isValid || !data_hora_fim.isValid) {
      console.error('Data(s) inválida(s) no Service. Abortando consulta.');
      return null;
    }

    //Converte para SQL para garantir que o query ocorra bem
    const inicioSQL = data_hora_inicio.toSQL()
    const fimSQL = data_hora_fim.toSQL()

    if (!inicioSQL || !fimSQL) {
      return null;
    }

    //Busca atendimentos que estão no mesmo dia, com o mesmo profissional e que tem conflito de horário.
    const conflito = await Atendimento.query()
      .where('profissional_id', profissional_id)
      //Esse trecho só é executado se encontrar o "ignorarId"
      .if(ignorarId, (query) => {
      query.whereNot('id', ignorarId!)
      })
      .where((query) => {
          //Nessa parte, verifica se o horário de começo e fim e do atendimento entra
          //em interseção com outra consulta.
          query.where('data_hora_inicio', '<', fimSQL)
              .andWhere('data_hora_fim', '>', inicioSQL)
      })
      .first()

    return conflito
  }
}
