/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Atendimento from '#models/atendimento'
import { storeAtendimentoValidator } from '#validators/validator_atendimento'
import { updateAtendimentoValidator } from '#validators/validator_atendimento'
import { inject } from '@adonisjs/core'
import { AtendimentoService } from '#services/atendimento_service'
import { PagamentoService } from '#services/pagamento_service'
import { TransacaoService } from '#services/transacao_service'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Disponibilidade from '#models/disponibilidade'
import Reserva from '#models/reserva'

@inject()
export default class AtendimentosController {
  constructor(
    protected atendimentoService: AtendimentoService,
    protected pagamentoService: PagamentoService,
    protected transacaoService: TransacaoService
  ) {}
  //Mostra todos os atendimentos

  public async index({ auth, request }: HttpContext) {
  const user = await auth.authenticate()

  // Pega o status da URL (ex: /atendimento?status=PENDENTE)
  const statusFiltrado = request.input('status')

  const query = Atendimento.query()
    .preload('cliente', (q) => q.select('id', 'nome'))
    .preload('profissional', (q) => {
      q.select('id', 'nome')
      q.preload('disponibilidades') // Mantendo sua regra de disponibilidade
    })

    // Aplicamos filtros baseados no perfil
    // Assumindo que seu Model User tem um campo 'tipo' ou 'role'
    if (user.perfil_tipo === 'cliente') {
      query.where('cliente_id', user.id)
    } else if (user.perfil_tipo === 'profissional') {
      query.where('profissional_id', user.id)
    }
    if (statusFiltrado) {
      query.where('status', statusFiltrado)
    }
    // Se for 'admin', não entra em nenhum IF e traz todos os registros (.all)
    return await query.orderBy('id', 'desc')
  }

  //Mostra atendimentos individualmente
  //Usa o select para traz apenas os dados importantes, e oculta dados sensíveis
  public async show({ params }: HttpContext) {
    return await Atendimento.query()
      .where('id', params.id)
      .preload('cliente', (query) => query.select('id', 'nome'))
      .preload('profissional', (query) => query.select('id', 'nome'))
      // removi email dos preloads porque eles só exixsrtem na tabela User
  }

  // Função para a tela de aprovação de agendamentos
  //Busca solicitações de atendimento (status PENDENTE)
  public async buscarSolicitacoes({ request, response }: HttpContext) {
    try {
      // Pega o status da URL (ex: ?status=PENDENTE)
      const { status } = request.qs()

      const query = Atendimento.query()
        // Traz apenas ID e Nome, nada de fotos ou dados pesados
        .preload('cliente', (q) => q.select('id', 'nome'))
        .preload('profissional', (q) => q.select('id', 'nome'))
        .orderBy('data_hora_inicio', 'asc')

      // Se foi passado um status, filtra. Se não, traz tudo.
      if (status) {
        query.where('status', status)
      } else {
        // Se não mandar nada, assume que quer os PENDENTES por padrão
        query.where('status', 'PENDENTE')
      }

      const resultados = await query
      return response.ok(resultados)
    } catch (error) {
      return response.internalServerError({
        message: 'Erro ao buscar lista de solicitações.',
        error
      })
    }
  }

  //Finalizado
  public async store({ request, response }: HttpContext) {
    try {
      const dados = await request.validateUsing(storeAtendimentoValidator)

      //Converte o Date nativo do JS para o Luxon DateTime
      const dataHoraInicioLuxon = DateTime.fromISO(dados.data_hora_inicio, { zone: 'utc' })
      //Verifica se a solicitação é para uma data/hora que já passou
      const horarioExpirado = dataHoraInicioLuxon < DateTime.now().setZone('utc')
      if (horarioExpirado) {
        throw new Error('A solicitação de atendimento tem uma data inválida.')
      }

      // Falta quanto tempo de agora (momento da requisição) para o atendimento?
      // Se a resposta for menos de 24 horas, a ação é barrada.
      // Verifica se o horário solicitado tem ao menos 24 horas de antecedência
      // Define o limite mínimo que a data de agendamento deve ter (Agora + 24 horas)
      const limiteMinimoMillis = DateTime.now().plus({ hours: 24 }).toMillis()
      const dataHoraInicioMillis = dataHoraInicioLuxon.toMillis()
      if (dataHoraInicioMillis < limiteMinimoMillis) {
        throw new Error(
          'A solicitação de atendimento precisa ser feita com ao menos 24 horas de antecedência.'
        )
      }

      // Chama a função "temDisponibilidade" para verificar se o profissional tem disponibilidade
      const disponibilidade = await this.atendimentoService.temDisponibilidade(
        dados.profissional_id,
        dataHoraInicioLuxon
      )
      if (!disponibilidade) {
        throw new Error('A solicitação de atendimento não está na disponibilidade do profissional.')
      }

      // Indica conflitos. Se o horário solicitado já tem outro acontecimento
      const slotOcupado = disponibilidade.status === 'OCUPADO'
      if (slotOcupado) {
        throw new Error('O horário solicitado já está marcado para outro atendimento.')
      }
      const slotBloqueado = disponibilidade.status === 'BLOQUEADO'
      if (slotBloqueado) {
        throw new Error('O profissional se encontra indisponível para este horário.')
      }

      // Procura pela sala em que o profissional atende
      const salaReservada = await Reserva.query()
        .where('profissional_id', dados.profissional_id)
        .first() //.andWhere('status', 'APROVADA').andWhere('pagamento_efetuado', true).first()
      if (!salaReservada) {
        throw new Error('O profissional escolhido para consulta não tem nenhum sala reservada.')
      }

      await this.atendimentoService.criarAtendimento(
        dados,
        salaReservada.salaId,
        dataHoraInicioLuxon,
        disponibilidade
      )

      return response.status(201).send('Agendamento realizado com sucesso.')
    } catch (error) {
      let message = 'Ocorreu um erro desconhecido.'
      let status = 500
      if (error instanceof Error) {
        if (error.message === 'A solicitação de atendimento tem uma data inválida.') {
          message = 'Tente informar uma data válida.'
          status = 400
        } else if (
          error.message ===
          'A solicitação de atendimento precisa ser feita com ao menos 24 horas de antecedência.'
        ) {
          message = 'Só é possível agendar atendimentos com ao menos 24 horas de antecedência.'
        } else if (
          error.message ===
          'A solicitação de atendimento não está na disponibilidade do profissional.'
        ) {
          message = 'Verifique em quais horários o profissional está disponível.'
          status = 400
        } else if (
          error.message === 'O horário solicitado já está marcado para outro atendimento.'
        ) {
          message = 'O horário solicitado entra em conflito com outro atendimento.'
          status = 400
        } else if (error.message === 'O profissional se encontra indisponível para este horário.') {
          message = 'O profissional se encontra indisponível no horário solicitado.'
          status = 400
        } else if (
          error.message === 'O profissional escolhido para consulta não tem nenhum sala reservada.'
        ) {
          message =
            'O profissional não tem uma sala para consulta, portanto não é possível realizar a consulta.'
          status = 400
        }
        return response.status(status).send({ message })
      }
    }
  }

  public async update({ request, response, params, auth }: HttpContext) {
    try {
      const atendimento = await Atendimento.findOrFail(params.id)
      const dados = await request.validateUsing(updateAtendimentoValidator)
      const usuarioLogado = auth.user!

      if (atendimento.status === 'CANCELADO' || atendimento.status === 'CONCLUIDO') {
        throw new Error('Não é possível atualizar um atendimento que está cancelado ou concluido.')
      }

      const horarioAtendimento = atendimento.dataHoraInicio
      const horarioExpirado = horarioAtendimento < DateTime.now()
      if (horarioExpirado) {
        throw new Error('A solicitação de atendimento tem uma data inválida.')
      }

      const limiteMinimo = DateTime.now().plus({ hours: 24 })
      if (horarioAtendimento < limiteMinimo) {
        throw new Error(
          'A modificação do atendimento tem que ser feita com ao menos 24 horas de antecedência.'
        )
      }

      this.atendimentoService.atualizarAtendimento(dados, atendimento, usuarioLogado)

      return response.status(200).send('Agendamento atualizado com sucesso.')
    } catch (error) {
      let message = 'Ocorreu um erro desconhecido.'
      let status = 500

      if (error.messages && error.messages.errors) {
        message = error.messages.errors[0].message
        status = 400
      } else if (error instanceof Error) {
        message = error.message
        status = 400
      }
      return response.status(status).send({ message: message })
    }
  }

  //Cancelar Atendimento
  public async patch({ params, response }: HttpContext) {
    //Try catch para garantir que ao acontecer um erro, (ex: nao encontrar o objeto com o id),
    //uma mensagem amigável seja levantada.
    try {
      const atendimento = await Atendimento.findOrFail(params.id)

      const horarioAtendimento = atendimento.dataHoraInicio

      if (atendimento.status !== 'CONFIRMADO') {
        throw new Error('Não é possível cancelar um atendimento finalizado ou já cancelado.')
      }

      // Limite mínimo no futuro (agora + 24 horas)
      const limiteMinimoMillis = DateTime.now().plus({ hours: 24 }).toMillis()
      const horarioAtendimentoMillis = horarioAtendimento.toMillis()
      const antecedenciaInsuficiente = horarioAtendimentoMillis <= limiteMinimoMillis
      if (antecedenciaInsuficiente) {
        throw new Error(
          'A solicitação de atendimento precisa ser feita com ao menos 24 horas de antecedência.'
        )
      }

      //Busca o slot da disponibilidade
      const slotDisponibilidade = await Disponibilidade.query()
        .where('profissional_id', atendimento.profissionalId)
        .andWhere('data_hora_inicio', atendimento.dataHoraInicio.toJSDate())
        .andWhere('data_hora_fim', atendimento.dataHoraFim.toJSDate())
        .andWhere('status', 'OCUPADO')
        .first()

      if (!slotDisponibilidade) {
        throw new Error('Slot de disponibilidade não encontrado')
      }

      await db.transaction(async (trx: TransactionClientContract) => {
        //Atualiza o status da disponibilidade para 'LIVRE'
        await Disponibilidade.query({ client: trx })
          .where('id', slotDisponibilidade.id)
          .update({ status: 'LIVRE' })

        //Atualiza o status do atendimento para 'CANCELADO'
        await Atendimento.query({ client: trx })
          .where('id', atendimento.id)
          .update({ status: 'CANCELADO' })
      })

      return response.status(204).send('Cancelamento realizado com sucesso.')
    } catch (error) {
      let message = 'Ocorreu um erro desconhecido.'
      let status = 500
      if (error instanceof Error) {
        if (
          error.message ===
          'A solicitação de cancelamento precisa ser feito com pelo menos 24 horas de antecedência.'
        ) {
          message = 'Perdão, não é possível fazer o cancelamento desta consulta.'
          status = 400
        } else if (
          error.message === 'Não é possível cancelar um atendimento finalizado ou já cancelado.'
        ) {
          message = 'O atendimento correspondente já foi finalizado ou cancelado. Tente novamente.'
          status = 400
        }
        return response.status(status).send({ message })
      }
    }
  }

  public async aprovar({ params, response }: HttpContext) {
    try {
      const atendimento = await Atendimento.findOrFail(params.id)

      if (atendimento.status !== 'PENDENTE') {
        return response.badRequest({
          message: 'Somente atendimentos pendentes podem ser aprovados.',
        })
      }

      // Inicia transação para garantir que o atendimento seja confirmado e a disponibilidade ocupada
      await db.transaction(async (trx) => {
        // Ocupa o slot da disponibilidade no momento da aprovação
        await Disponibilidade.query({ client: trx })
          .where('id', atendimento.disponibilidadeId)
          .update({ status: 'OCUPADO' })

        // Atualiza o status do atendimento
        atendimento.status = 'CONFIRMADO'
        atendimento.useTransaction(trx)
        await atendimento.save()
      })

      return response.ok({ message: 'Atendimento aprovado com sucesso.' })
    } catch {
      return response.notFound({ message: 'Atendimento não encontrado.' })
    }
  }

  public async recusar({ params, response }: HttpContext) {
    try {
      const atendimento = await Atendimento.findOrFail(params.id)

      if (atendimento.status !== 'PENDENTE') {
        return response.badRequest({
          message: 'Somente atendimentos pendentes podem ser recusados.',
        })
      }

      // Atualiza a a solicitação para CANCELADO
      atendimento.status = 'CANCELADO'
      await atendimento.save()

      return response.ok({
        message: 'Atendimento recusado com sucesso.',
      })
    } catch {
      return response.notFound({
        message: 'Atendimento não encontrado.',
      })
    }
  }
}
