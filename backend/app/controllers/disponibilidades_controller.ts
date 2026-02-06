import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Disponibilidade from '#models/disponibilidade'
import { storeDisponibilidadeValidator, updateDisponibilidadeValidator } from '#validators/validator_disponibilidade'
import { DateTime } from 'luxon'

export default class DisponibilidadesController {
  
  public async index({ response }: HttpContext) {
    const disponibilidades = await Disponibilidade.all()
    return response.ok(disponibilidades)
  }

  public async show({ params, response }: HttpContext) {
    const disponibilidade = await Disponibilidade.query().where('id', params.id).first()
    
    if (!disponibilidade) {
      return response.notFound({ message: 'Disponibilidade não encontrada' })
    }
    
    return response.ok(disponibilidade)
  }

  public async store({ request, response }: HttpContext) {
    const DURACAO_SLOT_MINUTOS = 30

    try {
      const dados = await request.validateUsing(storeDisponibilidadeValidator)

      // CORREÇÃO: dados agora usa camelCase e já vem como DateTime
      const inicioSolicitado = dados.dataHoraInicio.setZone('America/Sao_Paulo')
      const fimSolicitado = dados.dataHoraFim.setZone('America/Sao_Paulo')
      const agoraBrasil = DateTime.now().setZone('America/Sao_Paulo')

      const limiteAbertura = inicioSolicitado.set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
      const limiteFechamento = inicioSolicitado.set({ hour: 21, minute: 0, second: 0, millisecond: 0 })

      if (inicioSolicitado < limiteAbertura || fimSolicitado > limiteFechamento) {
        return response.badRequest({
          message: `A clínica só funciona das 07:00 às 21:00.`
        })
      }

      if (inicioSolicitado <= agoraBrasil) {
        return response.badRequest({ message: 'Não é possível criar horários no passado.' })
      }

      const sobreposicao = await Disponibilidade.query()
        .where('profissionalId', dados.profissionalId) // CORREÇÃO: profissionalId
        .where((q) => {
          q.where('dataHoraInicio', '<', fimSolicitado.toSQL()!) // CORREÇÃO: dataHoraInicio
           .andWhere('dataHoraFim', '>', inicioSolicitado.toSQL()!)
        })
        .first()

      if (sobreposicao) {
        return response.conflict({ message: 'Já existem horários criados neste intervalo.' })
      }

      const novosSlots: any[] = []
      let ponteiroSlot = inicioSolicitado

      while (ponteiroSlot < fimSolicitado) {
        const fimSlot = ponteiroSlot.plus({ minutes: DURACAO_SLOT_MINUTOS })
        if (fimSlot > fimSolicitado) break

        novosSlots.push({
          profissionalId: dados.profissionalId,
          dataHoraInicio: ponteiroSlot, // O Lucid lida com DateTime direto
          dataHoraFim: fimSlot,
          status: 'LIVRE',
        })
        ponteiroSlot = fimSlot
      }

      await Disponibilidade.createMany(novosSlots)
      return response.created({ message: 'Disponibilidade criada com sucesso!' })

    } catch (error: any) {
      return response.badRequest({ message: error.message || 'Erro ao criar disponibilidade' })
    }
  }

  public async update({ request, response }: HttpContext) {
    const PRIMEIRO_ATENDIMENTO = '07:00'
    const ULTIMO_ATENDIMENTO = '21:00'
    const DURACAO_SLOT_MINUTOS = 30

    try {
      const dados = await request.validateUsing(updateDisponibilidadeValidator)

      let inicioSlot = dados.dataHoraInicio.setZone('America/Sao_Paulo')
      const dataHoraFimTotal = dados.dataHoraFim.setZone('America/Sao_Paulo')

      if (inicioSlot <= DateTime.now().setZone('America/Sao_Paulo')) {
        return response.badRequest({ message: 'O horário informado é retroativo.' })
      }

      const inicioFormatado = inicioSlot.toFormat('HH:mm')
      const fimFormatado = dataHoraFimTotal.toFormat('HH:mm')

      if (inicioFormatado < PRIMEIRO_ATENDIMENTO || fimFormatado > ULTIMO_ATENDIMENTO) {
         return response.badRequest({ message: 'Horário fora do funcionamento da clínica.' })
      }

      const novosSlots: any[] = []
      
      const almocoInicio = inicioSlot.set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
      const almocoFim = inicioSlot.set({ hour: 13, minute: 0, second: 0, millisecond: 0 })

      while (inicioSlot < dataHoraFimTotal) {
        const fimSlot = inicioSlot.plus({ minutes: DURACAO_SLOT_MINUTOS })

        if (inicioSlot >= almocoInicio && inicioSlot < almocoFim) {
          inicioSlot = almocoFim
          continue
        }

        if (fimSlot > dataHoraFimTotal) break

        novosSlots.push({
          profissionalId: dados.profissionalId,
          dataHoraInicio: inicioSlot,
          dataHoraFim: fimSlot,
          status: 'LIVRE',
        })

        inicioSlot = fimSlot
      }

      if (novosSlots.length > 0) {
        const dataAlvo = novosSlots[0].dataHoraInicio.toISODate()!

        await db.transaction(async (trx) => {
          const slotsExistentes = await Disponibilidade.query({ client: trx })
            .where('profissionalId', dados.profissionalId!) // CORREÇÃO: profissionalId
            .whereRaw('DATE(data_hora_inicio) = ?', [dataAlvo])
            .select('data_hora_inicio', 'status')

          const ocupadosSet = new Set(
            slotsExistentes
              .filter(s => s.status === 'OCUPADO')
              .map(s => s.dataHoraInicio.toSQL())
          )

          const payloadFinal = novosSlots.map(novo => {
            const inicioSQL = novo.dataHoraInicio.toSQL()
            const slotData: any = {
              profissionalId: novo.profissionalId,
              dataHoraInicio: novo.dataHoraInicio,
              dataHoraFim: novo.dataHoraFim,
              status: novo.status
            }

            if (ocupadosSet.has(inicioSQL)) {
              delete slotData.status
            }

            return slotData
          })

          await Disponibilidade.updateOrCreateMany(
            ['profissionalId', 'dataHoraInicio'],
            payloadFinal,
            { client: trx }
          )

          const datasNovosSlots = novosSlots.map(s => s.dataHoraInicio.toISO()!)
          
          await Disponibilidade.query({ client: trx })
            .where('profissionalId', dados.profissionalId!)
            .whereRaw('DATE(data_hora_inicio) = ?', [dataAlvo])
            .whereNotIn('data_hora_inicio', datasNovosSlots)
            .whereNot('status', 'OCUPADO') 
            .delete()
        })
      }

      return response.ok({ message: 'Disponibilidade atualizada e sincronizada com sucesso.' })

    } catch (error: any) {
      return response.badRequest({ 
        message: 'Erro ao atualizar disponibilidade.', 
        error: error.message || error 
      })
    }
  }
}