import Disponibilidade from '#models/disponibilidade'
import Atendimento from '#models/atendimento'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import Sala from '#models/sala'
import User from '#models/user'
import { TransacaoService } from './transacao_service.js'
import { inject } from '@adonisjs/core'

@inject()
export class AtendimentoService {
  constructor(protected transacaoService: TransacaoService) {}
  public async criarAtendimento(
    dados: any,
    dataHoraInicioLuxon: DateTime,
    disponibilidade: Disponibilidade
  ) {
    await db.transaction(async (trx: TransactionClientContract) => {
      // Criando uma variável/objeto, responsável por armazenar os valores criados para o atendimento
      const atendimentoData = {
        profissionalId: dados.profissional_id,
        clienteId: dados.cliente_id,
        disponibilidadeId: disponibilidade.id,
        observacoes: dados.observacoes,
        formaPagamento: dados.forma_pagamento,
        dataHoraInicio: dataHoraInicioLuxon,
        //Se tem disponibilidade nesse horário, é definido que o final do atendimento será
        //Igual ao final do slot
        dataHoraFim: disponibilidade.dataHoraFim,
      }

      // O status da disponibilidade muda para RESERVADO para evitar que outras solicitações sejam feitas para o mesmo horário
      disponibilidade.status = 'RESERVADO'
      disponibilidade.useTransaction(trx)
      await disponibilidade.save()

      await Atendimento.create(atendimentoData, { client: trx })
    })
  }

  public async atualizarAtendimento(dados: any, atendimento: Atendimento, usuarioLogado: User) {
    // Obter os dados atuais do slot antigo para eventual liberação
    const slotAntigo = await this.temDisponibilidade(
      atendimento.profissionalId,
      atendimento.dataHoraInicio
    )

    let disponibilidadeSlotNovo = null
    let dadosParaUpdate = { ...dados } as any

    //Verifica se o usuário informou uma nova data hora para começar o atendimento
    const horarioMudou =
      dados.data_hora_inicio &&
      DateTime.fromJSDate(dados.data_hora_inicio).toSeconds() !==
        atendimento.dataHoraInicio.toSeconds()

    // Se o horário ou profissional mudou, precisamos validar o novo slot
    if (horarioMudou) {
      const dataHoraInicioLuxon = DateTime.fromJSDate(
        dados.data_hora_inicio || atendimento.dataHoraInicio.toJSDate()
      )

      disponibilidadeSlotNovo = await this.temDisponibilidade(
        atendimento.id,
        dataHoraInicioLuxon
      )

      if (!disponibilidadeSlotNovo)
        throw new Error('O novo horário solicitado não está na disponibilidade do profissional.')
      if (disponibilidadeSlotNovo.status === 'OCUPADO')
        throw new Error('O horário solicitado já está marcado para outro atendimento.')
      if (disponibilidadeSlotNovo.status === 'BLOQUEADO')
        throw new Error('O profissional se encontra indisponível para este horário.')

      const salaReservada = await Sala.query().where('profissional_id', atendimento.profissionalId).first()
      if (!salaReservada) throw new Error('Este profissional não tem nenhum sala reservada.')

      //Adiciona informações do novo slot ao update
      dadosParaUpdate.salaId = salaReservada.id
      dadosParaUpdate.dataHoraInicio = dataHoraInicioLuxon
      dadosParaUpdate.dataHoraFim = disponibilidadeSlotNovo.dataHoraFim
      dadosParaUpdate.disponibilidadeId = disponibilidadeSlotNovo.id
    }

    await db.transaction(async (trx: TransactionClientContract) => {
      const precisaManipularSlots = horarioMudou
      //Libera o Slot Antigo (Se houve mudança de tempo)
      if (slotAntigo && precisaManipularSlots) {
        //Apenas liberamos se ele estava ocupado
        if (slotAntigo?.status === 'OCUPADO') {
          await Disponibilidade.query({ client: trx })
            .where('id', slotAntigo.id)
            .update({ status: 'LIVRE' })
        }
      }
      //Ocupa o Slot Novo (Se houve mudança de tempo)
      if (disponibilidadeSlotNovo && precisaManipularSlots) {
        await Disponibilidade.query({ client: trx })
          .where('id', disponibilidadeSlotNovo.id)
          .update({ status: 'RESERVADO' })
      }

      atendimento.status = 'PENDENTE'
      //Salvando o atendimento
      atendimento.merge(dadosParaUpdate)
      atendimento.useTransaction(trx)
      await atendimento.save()
    })
  }
  public async temDisponibilidade(
    profissional_id: number,
    data_hora_inicio: DateTime
  ): Promise<Disponibilidade | null> {
    //Faz a procura pelas informações da disponibilidade
    //Traz as disponibilidades de um profissional específico, a partir da tentativa de inserção
    //Na tabela de Atendimento. Depois disso, com os dados da disponibilidade do profissional
    //Da qual o cliente tá querendo se relacionar via atendimento, verifica a disponibilidade
    const horaConvertidaSql = data_hora_inicio.toSQL()

    if (!horaConvertidaSql) {
      console.error(
        'Data hora de início é inválida após validação:',
        data_hora_inicio.invalidExplanation
      )
      return null
    }

    const disponibilidade = await Disponibilidade.query()
      .where('profissional_id', profissional_id)
      .where('data_hora_inicio', horaConvertidaSql)
      .first()

    return disponibilidade
  }
  //Obs: o parametro "ignorarId" é opcional, já que somente é necessário para a operação de update
  public async temConflito(
    profissional_id: number,
    data_hora_inicio: DateTime,
    data_hora_fim: DateTime,
    ignorarId?: number
  ) {
    //Verifca se os valores passados (DateTime), são válidos
    if (!data_hora_inicio.isValid || !data_hora_fim.isValid) {
      console.error('Data(s) inválida(s) no Service. Abortando consulta.')
      return null
    }

    //Converte para SQL para garantir que o query ocorra bem
    const inicioSQL = data_hora_inicio.toSQL()
    const fimSQL = data_hora_fim.toSQL()

    if (!inicioSQL || !fimSQL) {
      return null
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
        query.where('data_hora_inicio', '<', fimSQL).andWhere('data_hora_fim', '>', inicioSQL)
      })
      .first()

    return conflito
  }
}
