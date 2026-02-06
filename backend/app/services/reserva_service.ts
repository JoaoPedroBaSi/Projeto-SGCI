import Sala from '#models/sala'
import Reserva from '#models/reserva'
import Transacao from '#models/transacao'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { inject } from '@adonisjs/core'

interface HorarioDTO {
  inicio: string
  fim: string
}

interface CriarReservaLoteDTO {
  salaId: number
  profissionalId: number
  userId: number
  horarios: HorarioDTO[]
}

@inject()
export default class ReservaService {
  
  private readonly ENTIDADE_SISTEMA_ID = 1
  private readonly DESTINATARIO_ADMIN_ID = 1 

  public async criarEmLote({ salaId, profissionalId, userId, horarios }: CriarReservaLoteDTO) {
    return await db.transaction(async (trx) => {
      
      const sala = await Sala.findOrFail(salaId, { client: trx })

      const reservasParaCriar: Partial<Reserva>[] = []
      let valorTotalGeral = 0

      for (const horario of horarios) {
        const inicio = DateTime.fromISO(horario.inicio)
        const fim = DateTime.fromISO(horario.fim)

        if (!inicio.isValid || !fim.isValid) {
          throw new Error('Datas fornecidas são inválidas.')
        }

        if (inicio >= fim) {
          throw new Error('A data de início deve ser anterior ao fim.')
        }

        const conflito = await Reserva.query({ client: trx })
          .where('sala_id', salaId)
          .where('status', '!=', 'REJEITADO') 
          .where((query) => {
            query
              .where('data_hora_inicio', '<', fim.toSQL())
              .andWhere('data_hora_fim', '>', inicio.toSQL())
          })
          .first()

        if (conflito) {
          throw new Error(`Conflito de horário: O período das ${inicio.toFormat('HH:mm')} já está ocupado.`)
        }

        const duracaoHoras = fim.diff(inicio, 'hours').hours
        const precoSlot = Number(sala.precoAluguel) * duracaoHoras
        valorTotalGeral += precoSlot

        reservasParaCriar.push({
          salaId,
          profissionalId,
          dataHoraInicio: inicio,
          dataHoraFim: fim,
          status: 'PENDENTE',
          valorTotal: precoSlot,
          pagamentoEfetuado: false,
          formaPagamento: 'PENDENTE' 
        })
      }

      const transacao = await Transacao.create({
        userId: userId,
        entidadeOrigem: 'SISTEMA',
        entidadeId: this.ENTIDADE_SISTEMA_ID,
        destinatarioTipo: 'ADMIN', 
        destinatarioId: this.DESTINATARIO_ADMIN_ID,
        valor: valorTotalGeral,
        tipo: 'ENTRADA', 
        finalidade: 'RESERVA_SALA',
        status: 'PENDENTE',
        descricao: `Reserva em lote de ${reservasParaCriar.length} horários.`
      }, { client: trx }) 

      for (const res of reservasParaCriar) {
        await Reserva.create({
          ...res,
          transacaoId: transacao.id,
        }, { client: trx }) 
      }

      return transacao
    })
  }
}