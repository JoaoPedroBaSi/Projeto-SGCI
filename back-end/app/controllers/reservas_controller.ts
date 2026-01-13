import type { HttpContext } from '@adonisjs/core/http'
import Reserva from '#models/reserva'
import Profissional from '#models/profissional'
import { storeReservaValidator, updateReservaStatusValidator } from '#validators/validator_reserva'
import { DateTime } from 'luxon'

export default class ReservasController {
  
  // --- AQUI ESTÁ O LOG PARA DEBUGAR ---
  public async index({ response }: HttpContext) {
    try {
      console.log('🔍 Iniciando busca de reservas...') // Log 1

      const reserva = await Reserva.query()
        .preload('sala')
        .preload('profissional')
        .orderBy('created_at', 'desc')

      console.log(`✅ Sucesso! Foram encontradas ${reserva.length} reservas.`) // Log 2
      
      // Se quiser ver os dados brutos no terminal, descomente a linha abaixo:
      // console.log(JSON.stringify(reserva, null, 2))

      return response.status(200).send(reserva)
    } catch (error) {
      // ESTE É O LOG MAIS IMPORTANTE:
      console.log('🔥 ERRO FATAL NO INDEX (RESERVAS):', error)
      
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
      const user = await auth.authenticate()
      const profissional = await Profissional.findOrFail(user.id)

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

      // Verifica se há conflito de horários
      const conflito = await Reserva.query()
        .where('sala_id', dados.salaId)
        .where('status', 'APROVADA')
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
      await reserva.load('sala')
      await reserva.load('profissional')

      return response.status(201).send(reserva)
    } catch (error) {
      console.log('🔥 ERRO AO CRIAR RESERVA:', error)
      return response.status(500).send({ message: 'Erro interno ao criar a reserva.', error })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const { status } = await request.validateUsing(updateReservaStatusValidator)

      const reserva = await Reserva.findOrFail(params.id)
      
      // Correção de tipagem para TypeScript
      reserva.status = status as 'PENDENTE' | 'APROVADA' | 'REJEITADO'
      
      await reserva.save()

      await reserva.load('sala')
      await reserva.load('profissional')

      return response.status(200).send(reserva)
    } catch (error) {
      console.log('🔥 ERRO AO ATUALIZAR STATUS:', error)
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
}