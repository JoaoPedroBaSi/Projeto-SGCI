import type { HttpContext } from '@adonisjs/core/http'
import Reserva from '#models/reserva'
// import Profissional from '#models/profissional' <--- Desnecessário devido ao service
import {
  storeReservaLoteValidator,
  storeReservaValidator,
  updateReservaFormaPagamento,
  updateReservaStatusValidator,
} from '#validators/validator_reserva'
import { PagamentoService } from '#services/pagamento_service'
import ReservaService from '#services/reserva_service'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import Sala from '#models/sala'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class ReservasController {
  // Instancia o service
  private reservaService = new ReservaService()

  constructor(protected pagamentoService: PagamentoService) {}

  public async index({ response }: HttpContext) {
    try {
      const reserva = await Reserva.query().preload('sala').preload('profissional')
      return response.status(200).send(reserva)
    } catch (error) {
      return response.status(500).send({ message: 'Erro ao listar as reservas de sala', error })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const reserva = await Reserva.query()
        .where('id', params.id)
        .preload('sala')
        .preload('profissional')
        .firstOrFail()
      return response.status(200).send(reserva)
    } catch (error) {
      return response.status(404).send({ message: 'Reserva de sala não encontrada', error })
    }
  }

  // Busca reservas ocupadas para uma sala em uma data específica
  public async buscarOcupados({ request, response }: HttpContext) {
    try {
      const { salaId, data } = request.qs()

      if (!salaId || !data) {
        return response.badRequest({ message: 'Sala ID e Data são obrigatórios.' })
      }

      // Busca apenas o Horário de Início
      const reservas = await Reserva.query()
        .where('sala_id', salaId)
        .whereRaw('CAST(data_hora_inicio AS DATE) = ?', [data])
        .where('status', '!=', 'REJEITADO')
        .select('data_hora_inicio')

      return response.ok(reservas)
    } catch (error) {
      return response.internalServerError({ message: 'Erro ao buscar disponibilidade', error })
    }
  }

  public async store({ request, response, auth }: HttpContext) {
    try {
      // Validação o VineJS substitui o request.all
      // O que garante que 'dados.horarios' seja um array válido
      const dados = await request.validateUsing(storeReservaLoteValidator)

      // Pega o usuário logado para vincular na transação
      const user = auth.user!

      // Chama o serviço de lote de reservas
      const transacao = await this.reservaService.criarEmLote({
        salaId: dados.salaId,
        profissionalId: dados.profissionalId,
        userId: user.id,
        horarios: dados.horarios,
      })

      return response.status(201).send({
        message: 'Solicitação criada com sucesso',
        transacaoId: transacao.id,
        valorTotal: transacao.valor,
      })
    } catch (error: any) {
      if (error.status === 409) {
        return response.status(409).send({ message: error.message })
      }
      // Captura erros de validação do VineJS
      if (error.messages) {
        return response.status(422).send({ errors: error.messages })
      }
      console.error('ERRO AO CRIAR LOTE:', error)
      return response.status(500).send({ message: 'Erro interno', error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const { status } = await request.validateUsing(updateReservaStatusValidator)

      const reserva = await Reserva.findOrFail(params.id)
      reserva.status = status
      await reserva.save()

      await reserva.load('sala')
      await reserva.load('profissional')

      return response.status(200).send(reserva)
    } catch (error) {
      return response.status(404).send({ message: 'Erro ao atualizar o status da reserva.' })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const reserva = await Reserva.findOrFail(params.id)
      await reserva.delete()
      return response.status(200).send(reserva)
    } catch {
      return response.status(404).send({ message: 'Reserva não encontrada' })
    }
  }

  public async pagar({ params, request, response }: HttpContext) {
    try {
      const resultado = await db.transaction(async (trx: TransactionClientContract) => {
        const reserva = await Reserva.query({ client: trx }).where('id', params.id).firstOrFail()

        if (reserva.status !== 'APROVADA') {
          throw new Error('Aguarde a aprovação da sua solicitação')
        }

        if (reserva.pagamentoEfetuado) {
          throw new Error('O pagamento já foi realizado.')
        }

        const { formaPagamento } = await request.validateUsing(updateReservaFormaPagamento)

        reserva.useTransaction(trx)
        reserva.formaPagamento = formaPagamento
        await reserva.save()

        // Pega o valor salvo na reserva
        let valorCobranca = Number(reserva.valorTotal)

        // Fallback para reservas antigas (sem valorTotal salvo)
        if (!valorCobranca || valorCobranca <= 0) {
          const sala = await Sala.query({ client: trx }).where('id', reserva.salaId).firstOrFail()

          if (!sala.precoAluguel) {
            throw new Error(
              'O preço de aluguel da sala correspondente não foi informado e a reserva não possui valor gravado.'
            )
          }

          // Recalcula a duração em horas para multiplicar pelo preço da sala
          const inicio = DateTime.fromISO(reserva.dataHoraInicio.toString())
          const fim = DateTime.fromISO(reserva.dataHoraFim.toString())
          const duracaoHoras = fim.diff(inicio, 'hours').hours

          valorCobranca = Number(sala.precoAluguel) * duracaoHoras
        }

        //Iniciar cobrança no Service com o valor correto
        const respostaPagamento = await this.pagamentoService.iniciarCobrancaReserva(
          reserva,
          valorCobranca
        )

        if (
          respostaPagamento.transacao.status === 'CONCLUIDA' ||
          respostaPagamento.gateway.status === 'RECEIVED'
        ) {
          reserva.pagamentoEfetuado = true
          await reserva.save()
        }

        return { reserva, pagamento: respostaPagamento }
      })

      return response.status(200).send(resultado)
    } catch (error) {
      let message = 'Aconteceu um erro desconhecido'
      let status = 500
      if (error instanceof Error) {
        if (error.message === 'Aguarde a aprovação da sua solicitação') {
          message = 'A sua solicitação de reserva ainda não foi respondida.'
          status = 400
        } else if (error.message === 'O pagamento já foi realizado.') {
          message = 'Você já realizou o pagamento.'
          status = 400
        } else if (error.message.includes('preço de aluguel')) {
          message = 'Houve uma falha interna. O valor da reserva não foi encontrado.'
          status = 400
        }
        return response.status(status).send({ message })
      }
    }
  }
}
