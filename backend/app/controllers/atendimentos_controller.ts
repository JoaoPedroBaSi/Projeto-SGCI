import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Atendimento from '#models/atendimento'
import { storeAtendimentoValidator, updateAtendimentoValidator } from '#validators/validator_atendimento'
import { inject } from '@adonisjs/core'
import { AtendimentoService } from '#services/atendimento_service'
import { PagamentoService } from '#services/pagamento_service'
import { TransacaoService } from '#services/transacao_service'
import db from '@adonisjs/lucid/services/db'
import Disponibilidade from '#models/disponibilidade'
import Reserva from '#models/reserva'
import Transacao from '#models/transacao'

@inject()
export default class AtendimentosController {
  constructor(
    protected atendimentoService: AtendimentoService,
    protected pagamentoService: PagamentoService,
    protected transacaoService: TransacaoService
  ) {}

  public async index({ auth, request }: HttpContext) {
    const user = await auth.authenticate()
    const statusFiltrado = request.input('status')

    const query = Atendimento.query()
      .preload('cliente', (q) => q.select('id', 'nome'))
      .preload('profissional', (q) => {
        q.select('id', 'nome')
        q.preload('disponibilidades')
      })

    if (user.perfilTipo === 'cliente') {
      query.where('clienteId', user.id)
    } else if (user.perfilTipo === 'profissional') {
      query.where('profissionalId', user.id)
    }
    
    if (statusFiltrado) {
      query.where('status', statusFiltrado)
    }

    return await query.orderBy('id', 'desc')
  }

  public async show({ params }: HttpContext) {
    const atendimento = await Atendimento.query()
      .where('id', params.id)
      .preload('cliente', (query) => {
        query.select('id', 'nome', 'dataNascimento') 
      })
      .preload('profissional', (query) => query.select('id', 'nome'))
      .preload('prontuario')
      .firstOrFail()

    return atendimento
  }

  public async buscarSolicitacoes({ request, response }: HttpContext) {
    try {
      const { status } = request.qs()

      const query = Atendimento.query()
        .preload('cliente', (q) => q.select('id', 'nome'))
        .preload('profissional', (q) => q.select('id', 'nome'))
        .orderBy('dataHoraInicio', 'asc') // CORREÇÃO: dataHoraInicio

      if (status) {
        query.where('status', status)
      } else {
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

  public async store({ request, response }: HttpContext) {
    try {
      const dados = await request.validateUsing(storeAtendimentoValidator)
      
      // CORREÇÃO: dados.dataHoraInicio (o Validator também deve estar em CamelCase)
      const dataHoraInicioLuxon = dados.dataHoraInicio.setZone('America/Sao_Paulo')

      const agoraBrasil = DateTime.now().setZone('America/Sao_Paulo')
      if (dataHoraInicioLuxon < agoraBrasil) {
        throw new Error('A solicitação de atendimento tem uma data inválida.')
      }

      const disponibilidade = await this.atendimentoService.temDisponibilidade(
        dados.profissionalId,
        dataHoraInicioLuxon
      )

      if (!disponibilidade) {
        throw new Error('A solicitação de atendimento não está na disponibilidade do profissional.')
      }

      if (disponibilidade.status === 'OCUPADO') {
        throw new Error('O horário solicitado já está marcado para outro atendimento.')
      }
      
      if (disponibilidade.status === 'BLOQUEADO') {
        throw new Error('O profissional se encontra indisponível para este horário.')
      }

      const salaReservada = await Reserva.query()
        .where('profissionalId', dados.profissionalId)
        .first()
        
      if (!salaReservada) {
        throw new Error('O profissional escolhido para consulta não tem nenhum sala reservada.')
      }

      await this.atendimentoService.criarAtendimento(
        dados,
        dataHoraInicioLuxon,
        disponibilidade
      )

      return response.status(201).send('Agendamento realizado com sucesso.')
    } catch (error: any) {
      console.error(error)

      if (error.status === 422) {
        return response.status(422).send({
          message: 'Dados inválidos',
          errors: error.messages
        })
      }

      const mensagens: Record<string, string> = {
        'A solicitação de atendimento tem uma data inválida.': 'Tente informar uma data válida.',
        'A solicitação de atendimento não está na disponibilidade do profissional.': 'Verifique os horários disponíveis do profissional.',
        'O horário solicitado já está marcado para outro atendimento.': 'Este horário já está ocupado.',
        'O profissional se encontra indisponível para este horário.': 'O profissional está indisponível neste momento.',
        'O profissional escolhido para consulta não tem nenhum sala reservada.': 'O profissional não possui sala vinculada.'
      }

      if (mensagens[error.message]) {
        return response.status(400).send({ message: mensagens[error.message] })
      }

      return response.status(error.status || 500).send({
        message: error.message || 'Ocorreu um erro interno no servidor.'
      })
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
      if (horarioAtendimento < DateTime.now())
        throw new Error('A solicitação de atendimento tem uma data inválida.')

      const limiteMinimo = DateTime.now().plus({ hours: 24 })
      if (horarioAtendimento < limiteMinimo)
        throw new Error('A modificação do atendimento tem que ser feita com ao menos 24 horas de antecedência.')

      this.atendimentoService.atualizarAtendimento(dados, atendimento, usuarioLogado)

      return response.status(200).send('Agendamento atualizado com sucesso.')
    } catch (error: any) {
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

  public async cancelar({ params, response, auth, request }: HttpContext) {
    const usuarioLogado = auth.user
    if (!usuarioLogado) {
      return response.unauthorized({ message: 'Usuário não autenticado' })
    }

    let justificativa = ''
    let statusDisponibilidade: 'LIVRE' | 'OCUPADO' | 'BLOQUEADO' | 'FINALIZADO' | 'RESERVADO' = 'LIVRE'

    // CORREÇÃO: perfilTipo
    const profissionalLogado = usuarioLogado.perfilTipo === 'profissional'
    const clienteLogado = usuarioLogado.perfilTipo === 'cliente'

    try {
      const atendimento = await Atendimento.findOrFail(params.id)

      if (atendimento.status !== 'CONFIRMADO') {
        return response.badRequest({ message: 'Não é possível cancelar um atendimento finalizado ou já cancelado.' })
      }

      if (clienteLogado) {
        const limiteMinimo = DateTime.now().plus({ hours: 24 })
        if (atendimento.dataHoraInicio <= limiteMinimo) {
          return response.badRequest({ message: 'O cancelamento precisa ser feito com ao menos 24 horas de antecedência.' })
        }
      }

      if (profissionalLogado) {
        justificativa = request.input('justificativa_falta') || ''
        statusDisponibilidade = 'BLOQUEADO'
      }

      const slotDisponibilidade = await Disponibilidade.find(atendimento.disponibilidadeId)

      if (!slotDisponibilidade) {
        return response.notFound({ message: 'Slot de disponibilidade não encontrado' })
      }

      if (atendimento.formaPagamento !== 'DINHEIRO') {
        try {
          await this.pagamentoService.estornarCobranca(atendimento.id)
        } catch (e) {
          throw new Error('Falha na operação de estorno.')
        }
      }

      await db.transaction(async (trx) => {
        atendimento.useTransaction(trx)
        slotDisponibilidade.useTransaction(trx)

        slotDisponibilidade.status = statusDisponibilidade
        await slotDisponibilidade.save()

        atendimento.status = 'CANCELADO'
        atendimento.justificativaFalta = justificativa
        await atendimento.save()

        if (atendimento.formaPagamento !== 'DINHEIRO') {
          await Transacao.query({ client: trx })
            .where('atendimentoId', atendimento.id) 
            .update({ status: 'ESTORNADO' })
        }
      })

      return response.ok({ message: 'Cancelamento realizado com sucesso.' })

    } catch (error: any) {
      console.error(error)
      return response.status(500).send({
        message: 'Erro interno ao processar cancelamento.',
        debug: error.message
      })
    }
  }

  public async aprovar({ params, request, response, auth }: HttpContext) {
    const profissionalLogado = auth.user!

    try {
      const atendimento = await Atendimento.findOrFail(params.id)

      if (atendimento.profissionalId !== profissionalLogado.id) {
        return response.forbidden({ message: 'Você não tem permissão para aprovar este atendimento.' })
      }

      if (atendimento.status !== 'PENDENTE') {
        return response.badRequest({ message: 'Somente atendimentos pendentes podem ser aprovados.' })
      }

      const salaEscolhida = Number(request.input('sala_id'))

      if (!salaEscolhida) {
        return response.badRequest({ message: 'A sala é obrigatória.' })
      }

      const temReserva = await Reserva.query()
        .where('profissionalId', Number(profissionalLogado.id)) 
        .where('salaId', Number(salaEscolhida)) 
        .first()

      if (!temReserva) {
        return response.forbidden({
          message: 'Você não possui uma reserva ativa para esta sala. Selecione uma sala vinculada ao seu perfil.'
        })
      }

      const valorSolicitado = Number(request.input('valor'))

      await db.transaction(async (trx) => {
        await Disponibilidade.query({ client: trx })
          .where('id', atendimento.disponibilidadeId)
          .where('profissionalId', profissionalLogado.id)
          .update({ status: 'OCUPADO' })

        if (atendimento.formaPagamento !== 'DINHEIRO') {
          try {
            const resultadoCobrancao = await this.pagamentoService.iniciarCobranca(
              atendimento.profissionalId,
              atendimento.clienteId,
              valorSolicitado,
              atendimento.formaPagamento,
              atendimento.id
            )

            atendimento.status = 'CONFIRMADO'
            atendimento.statusPagamento = resultadoCobrancao.gateway.status === 'RECEIVED' ? 'PAGO' : 'PENDENTE'
          } catch (error) {
            throw new Error('FALHA_GATEWAY')
          }
        } else {
          atendimento.status = 'CONFIRMADO'
        }

        atendimento.salaId = salaEscolhida
        atendimento.valor = valorSolicitado
        atendimento.useTransaction(trx)
        await atendimento.save()
      })

      return response.ok({ message: 'Atendimento aprovado e agenda atualizada.' })

    } catch (error: any) {
      if (error.message === 'FALHA_GATEWAY') {
        return response.badRequest({ message: 'Erro ao processar gateway de pagamento.' })
      }
      return response.notFound({ message: 'Atendimento não encontrado ou erro interno.' })
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

      atendimento.status = 'CANCELADO'
      await atendimento.save()

      const disponibilidade = await Disponibilidade.findOrFail(atendimento.disponibilidadeId)
      disponibilidade.status = 'LIVRE'
      await disponibilidade.save()

      return response.ok({
        message: 'Atendimento recusado com sucesso.',
      })
    } catch {
      return response.notFound({
        message: 'Atendimento não encontrado.',
      })
    }
  }

  public async concluir({ auth, params, response }: HttpContext) {
    const profissionalLogado = auth.user!

    try {
      const mensagem = await db.transaction(async (trx) => {
        const atendimento = await Atendimento.query({ client: trx })
          .where('id', params.id)
          .where('profissionalId', profissionalLogado.id) 
          .firstOrFail()

        if (atendimento.status === 'CONCLUIDO') {
          throw new Error('Este atendimento já foi concluído.')
        }

        if (atendimento.formaPagamento === 'DINHEIRO') {
          await Transacao.create({
            userId: atendimento.clienteId,
            atendimentoId: atendimento.id,
            entidadeOrigem: 'clientes',
            entidadeId: atendimento.clienteId,
            destinatarioTipo: 'profissionais',
            destinatarioId: atendimento.profissionalId,
            valor: atendimento.valor,
            tipo: 'ENTRADA',
            finalidade: `Pagamento em dinheiro (Presencial)`,
            status: 'CONCLUIDA',
            referenciaExterna: 'Lançamento Manual Profissional'
          }, { client: trx })

          atendimento.statusPagamento = 'PAGO'
        }

        if (atendimento.formaPagamento !== 'DINHEIRO' && atendimento.statusPagamento !== 'PAGO') {
          throw new Error('O pagamento deste atendimento ainda não foi confirmado.')
        }

        atendimento.status = 'CONCLUIDO'
        await atendimento.useTransaction(trx).save()

        await Disponibilidade.query({ client: trx })
          .where('id', atendimento.disponibilidadeId)
          .update({ status: 'FINALIZADO' })

        return 'Atendimento finalizado com sucesso!'
      })

      return response.ok({ message: mensagem })
    } catch (error: any) {
      return response.badRequest({
        message: error.message || 'Erro ao concluir atendimento.'
      })
    }
  }
}