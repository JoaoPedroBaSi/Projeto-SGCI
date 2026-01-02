import type { HttpContext } from '@adonisjs/core/http'
import Reserva from '#models/reserva'
import Profissional from '#models/profissional'
import { storeReservaValidator, updateReservaFormaPagamento, updateReservaStatusValidator } from '#validators/validator_reserva'
import { PagamentoService } from '#services/pagamento_service'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import Sala from '#models/sala'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class ReservasController {
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

  public async store({ request, response, auth }: HttpContext) {
    try {
      const dados = await request.validateUsing(storeReservaValidator)
      //const user = await auth.authenticate()
      const profissional = await Profissional.findByOrFail('id', dados.profissionalId)

      // Verifica as datas antes de prosseguir
      const inicio = new Date(dados.dataHoraInicio)
      const fim = new Date(dados.dataHoraFim)

      if (fim <= inicio) {
        return response.status(422).send({
          errors: [
            {
              field: 'dataHoraFim',
              message: 'A data de término deve ser posterior à data de início',
            },
          ],
        })
      }

      // Verifica se há conflito de horários antes de solicitar uma reserva
      const conflito = await Reserva.query()
        .where('sala_id', dados.salaId)
        .where('status', 'APROVADA') // Verifica apenas as reservas já aprovadas
        .where((query) => {
          query
            .whereBetween('data_hora_inicio', [dados.dataHoraInicio, dados.dataHoraFim])
            .orWhereBetween('data_hora_fim', [dados.dataHoraInicio, dados.dataHoraFim])
            .orWhere((subQuery) => {
              subQuery
                .where('data_hora_inicio', '<=', dados.dataHoraInicio)
                .andWhere('data_hora_fim', '>=', dados.dataHoraFim)
            })
        })
        .first()

      if (conflito) {
        return response.status(409).send({
          message:
            'Horário indisponível. Já existe uma reserva aprovada neste mesmo horário para essa sala.',
        })
      }

      // Cria a solicitação da reserva
      const reserva = await Reserva.create({
        salaId: dados.salaId,
        profissionalId: profissional.id,
        dataHoraInicio: DateTime.fromISO(dados.dataHoraInicio),
        dataHoraFim: DateTime.fromISO(dados.dataHoraFim),
        status: 'PENDENTE',
      })

      // retorna também os relacionamentos
      await reserva.load((loader) => {
        loader.load('sala')
        loader.load('profissional')
      })

      return response.status(201).send(reserva)
    } catch (error) {
      console.error('ERRO AO CRIAR RESERVA:', error)
      return response.status(500).send({ message: 'Erro interno ao criar a reserva.', error })
    }
  }

  //
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
  public async pagar({ params, request, response } : HttpContext) {
    try {
      const resultado = await db.transaction(async (trx: TransactionClientContract) => {

      const reserva = await Reserva.query({client: trx}).where('id', params.id).firstOrFail()

      if (reserva.status !== 'APROVADA') {
        throw new Error('Aguarde a aprovação da sua solicitação')
      }

      if (reserva.pagamentoEfetuado) {
        throw new Error('O pagamento já foi realizado.')
      }

      //Solicitar a forma de pagamento
      const { formaPagamento } = await request.validateUsing(updateReservaFormaPagamento)

      reserva.useTransaction(trx)
      reserva.formaPagamento = formaPagamento
      await reserva.save()

      //Buscar sala e preço
      const sala = await Sala.query({client: trx}).where('id', reserva.salaId).firstOrFail()

      if (!sala.precoAluguel) {
        throw new Error('O preço de aluguel da sala correspondente não foi informado.')
      }

      //Iniciar cobrança no Service
      const respostaPagamento = await this.pagamentoService.iniciarCobrancaReserva(
        reserva,
        Number(sala.precoAluguel)
      )

      //Verificar status (Se for PIX, ele nascerá como 'PENDING' no Asaas)
      if (respostaPagamento.transacao.status === 'CONCLUIDA' || respostaPagamento.gateway.status === 'RECEIVED') {
        reserva.pagamentoEfetuado = true
        await reserva.save()
      }

      return { reserva, pagamento: respostaPagamento }
    })

    return response.status(200).send(resultado)
    } catch (error) {
      let message = 'Aconteceu um erro desconhecido'
      let status = 500
      if(error instanceof Error) {
        if (error.message === 'Aguarde a aprovação da sua solicitação') {
          message = 'A sua solicitação de reserva ainda não foi respondida.'
          status = 400
      } else if (error.message === 'O pagamento já foi realizado.') {
        message = 'Você já realizou o pagamento.'
        status = 400
      } else if (error.message === 'O preço de aluguel da sala correspondente não foi informado.') {
        message = 'Houve uma falha interna. O preço de aluguel da sala correspondente não foi informado.'
        status = 400
      }
      return response.status(status).send({message})
      }
    }
  }
}
