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
import User from '#models/user' // IMPORTANTE: Importação do Model User

@inject()
export default class AtendimentosController {
  constructor(
    protected atendimentoService: AtendimentoService,
    protected pagamentoService: PagamentoService,
    protected transacaoService: TransacaoService
  ) {}

  public async index({ auth, request }: HttpContext) {
    // Cast duplo para o TypeScript reconhecer as propriedades do seu Model
    const user = auth.user as unknown as User
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
        .orderBy('dataHoraInicio', 'asc')

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

  public async store({ request, response, auth }: HttpContext) {
    try {
      const dados = await request.validateUsing(storeAtendimentoValidator)
      const dataHoraInicioLuxon = dados.dataHoraInicio.setZone('America/Sao_Paulo')
      const userLogado = auth.user as unknown as User // Cast aplicado

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

      if (disponibilidade.status === 'OCUPADO' || disponibilidade.status === 'BLOQUEADO') {
        throw new Error('O horário solicitado não está disponível.')
      }
      
      const salaReservada = await Reserva.query()
        .where('profissionalId', dados.profissionalId)
        .first()
        
      if (!salaReservada) {
        throw new Error('O profissional escolhido para consulta não tem nenhum sala reservada.')
      }

      // Passando o usuário tipado corretamente para o service
      await this.atendimentoService.criarAtendimento(
        dados,
        dataHoraInicioLuxon,
        disponibilidade,
        userLogado
      )

      return response.status(201).send('Agendamento realizado com sucesso.')
    } catch (error: any) {
      return response.status(400).send({ message: error.message })
    }
  }

  public async update({ request, response, params, auth }: HttpContext) {
    try {
      const atendimento = await Atendimento.findOrFail(params.id)
      const dados = await request.validateUsing(updateAtendimentoValidator)
      const usuarioLogado = auth.user as unknown as User // Cast aplicado

      if (atendimento.status === 'CANCELADO' || atendimento.status === 'CONCLUIDO') {
        throw new Error('Não é possível atualizar um atendimento finalizado.')
      }

      this.atendimentoService.atualizarAtendimento(dados, atendimento, usuarioLogado)

      return response.status(200).send('Agendamento atualizado com sucesso.')
    } catch (error: any) {
      return response.status(400).send({ message: error.message })
    }
  }

  public async cancelar({ params, response, auth, request }: HttpContext) {
    const usuarioLogado = auth.user as unknown as User // Cast aplicado
    if (!usuarioLogado) {
      return response.unauthorized({ message: 'Usuário não autenticado' })
    }

    const profissionalLogado = usuarioLogado.perfilTipo === 'profissional'
    const clienteLogado = usuarioLogado.perfilTipo === 'cliente'

    try {
      const atendimento = await Atendimento.findOrFail(params.id)

      if (atendimento.status !== 'CONFIRMADO' && atendimento.status !== 'PENDENTE') {
        return response.badRequest({ message: 'Status inválido para cancelamento.' })
      }

      if (clienteLogado) {
        const limiteMinimo = DateTime.now().plus({ hours: 24 })
        if (atendimento.dataHoraInicio <= limiteMinimo) {
          return response.badRequest({ message: 'O cancelamento precisa ser feito com 24h de antecedência.' })
        }
      }

      const slotDisponibilidade = await Disponibilidade.findOrFail(atendimento.disponibilidadeId)

      await db.transaction(async (trx) => {
        atendimento.useTransaction(trx)
        slotDisponibilidade.useTransaction(trx)

        slotDisponibilidade.status = profissionalLogado ? 'BLOQUEADO' : 'LIVRE'
        await slotDisponibilidade.save()

        atendimento.status = 'CANCELADO'
        if (profissionalLogado) {
            atendimento.justificativaFalta = request.input('justificativa_falta') || ''
        }
        await atendimento.save()
      })

      return response.ok({ message: 'Cancelamento realizado com sucesso.' })

    } catch (error: any) {
      return response.status(500).send({ message: 'Erro ao processar cancelamento.' })
    }
  }

  public async aprovar({ params, request, response, auth }: HttpContext) {
    const profissionalLogado = auth.user as unknown as User // Cast aplicado

    try {
      const atendimento = await Atendimento.findOrFail(params.id)

      if (atendimento.profissionalId !== profissionalLogado.id) {
        return response.forbidden({ message: 'Acesso negado.' })
      }

      const salaEscolhida = Number(request.input('sala_id'))
      const valorSolicitado = Number(request.input('valor'))

      await db.transaction(async (trx) => {
        atendimento.useTransaction(trx)
        atendimento.status = 'CONFIRMADO'
        atendimento.salaId = salaEscolhida
        atendimento.valor = valorSolicitado
        await atendimento.save()

        await Disponibilidade.query({ client: trx })
          .where('id', atendimento.disponibilidadeId)
          .update({ status: 'OCUPADO' })
      })

      return response.ok({ message: 'Atendimento aprovado.' })
    } catch (error) {
      return response.badRequest({ message: 'Erro ao aprovar atendimento.' })
    }
  }

  public async concluir({ auth, params, response }: HttpContext) {
    const profissionalLogado = auth.user as unknown as User // Cast aplicado

    try {
      await db.transaction(async (trx) => {
        const atendimento = await Atendimento.query({ client: trx })
          .where('id', params.id)
          .where('profissionalId', profissionalLogado.id) 
          .firstOrFail()

        atendimento.status = 'CONCLUIDO'
        await atendimento.useTransaction(trx).save()

        await Disponibilidade.query({ client: trx })
          .where('id', atendimento.disponibilidadeId)
          .update({ status: 'FINALIZADO' })
      })

      return response.ok({ message: 'Atendimento concluído!' })
    } catch (error: any) {
      return response.badRequest({ message: 'Erro ao concluir atendimento.' })
    }
  }
}