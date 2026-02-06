import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Reserva from '#models/reserva'
import Sala from '#models/sala'
import User from '#models/user' // Certifique-se de que o import do Model User está aqui
import {
  storeReservaLoteValidator,
  updateReservaFormaPagamento,
  updateReservaStatusValidator,
} from '#validators/validator_reserva'
import { PagamentoService } from '#services/pagamento_service'
import ReservaService from '#services/reserva_service'

@inject()
export default class ReservasController {
  
  constructor(
    protected pagamentoService: PagamentoService,
    protected reservaService: ReservaService
  ) {}

  public async index({ response }: HttpContext) {
    const reservas = await Reserva.query()
      .preload('sala')
      .preload('profissional')
      
    return response.ok(reservas)
  }

  public async show({ params, response }: HttpContext) {
    try {
      const reserva = await Reserva.query()
        .where('id', params.id)
        .preload('sala')
        .preload('profissional')
        .firstOrFail()

      return response.ok(reserva)
    } catch {
      return response.notFound({ message: 'Reserva não encontrada.' })
    }
  }

  public async buscarOcupados({ request, response }: HttpContext) {
    try {
      const { salaId, data } = request.qs()

      if (!salaId || !data) {
        return response.badRequest({ message: 'Sala ID e Data são obrigatórios.' })
      }

      const reservas = await Reserva.query()
        .where('salaId', salaId)
        .whereRaw('CAST(data_hora_inicio AS DATE) = ?', [data])
        .where('status', '!=', 'REJEITADO')
        .select('dataHoraInicio')

      return response.ok(reservas)
    } catch (error) {
      return response.internalServerError({ message: 'Erro ao buscar disponibilidade.', error })
    }
  }

  public async store({ request, response, auth }: HttpContext) {
    try {
      const dados = await request.validateUsing(storeReservaLoteValidator)
      
      /**
       * CORREÇÃO DE TIPO:
       * O auth.user é LucidRow por padrão. O cast duplo 'as unknown as User'
       * garante o acesso à propriedade 'id' sem erro de compilação.
       */
      const user = auth.user as unknown as User

      const transacao = await this.reservaService.criarEmLote({
        salaId: dados.salaId,
        profissionalId: dados.profissionalId,
        userId: user.id, 
        horarios: dados.horarios,
      })

      return response.created({
        message: 'Solicitação criada com sucesso',
        transacaoId: transacao.id,
        valorTotal: transacao.valor,
      })
    } catch (error: any) {
      if (error.status === 409) {
        return response.conflict({ message: error.message })
      }
      return response.badRequest({ message: 'Erro ao processar reserva.', error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const { status } = await request.validateUsing(updateReservaStatusValidator)

      const reserva = await Reserva.findOrFail(params.id)
      
      // Cast de string para os valores literais do Enum do Model
      reserva.status = status as 'PENDENTE' | 'APROVADA' | 'REJEITADO'
      
      await reserva.save()
      
      // Cast 'as any' nas relações evita erros de sobrecarga do .load()
      await reserva.load('sala' as any)
      await reserva.load('profissional' as any)

      return response.ok(reserva)
    } catch (error) {
      return response.badRequest({ message: 'Erro ao atualizar o status da reserva.' })
    }
  }

  public async pagar({ params, request, response }: HttpContext) {
    try {
      const resultado = await db.transaction(async (trx) => {
        const reserva = await Reserva.query({ client: trx })
            .where('id', params.id)
            .firstOrFail()

        if (reserva.status !== 'APROVADA') {
          throw new Error('Aguarde a aprovação da sua solicitação.')
        }

        if (reserva.pagamentoEfetuado) {
          throw new Error('O pagamento já foi realizado.')
        }

        const { formaPagamento } = await request.validateUsing(updateReservaFormaPagamento)

        reserva.useTransaction(trx)
        
        // Cast necessário para garantir compatibilidade com o tipo do Model
        reserva.formaPagamento = formaPagamento as 'PIX' | 'CREDITO' | 'DEBITO'
        
        await reserva.save()

        let valorCobranca = Number(reserva.valorTotal)

        if (!valorCobranca || valorCobranca <= 0) {
          const sala = await Sala.query({ client: trx })
            .where('id', reserva.salaId)
            .firstOrFail()

          const inicio = reserva.dataHoraInicio
          const fim = reserva.dataHoraFim
          const duracaoHoras = fim.diff(inicio, 'hours').hours

          valorCobranca = Number(sala.precoAluguel) * duracaoHoras
        }

        const respostaPagamento = await this.pagamentoService.iniciarCobrancaReserva(
          reserva,
          valorCobranca
        )

        if (respostaPagamento.gateway.status === 'RECEIVED') {
          reserva.pagamentoEfetuado = true
          await reserva.save()
        }

        return { reserva, pagamento: respostaPagamento }
      })

      return response.ok(resultado)

    } catch (error: any) {
      return response.badRequest({ message: error.message || 'Erro no pagamento' })
    }
  }
}