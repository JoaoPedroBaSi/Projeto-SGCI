import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const storeDisponibilidadeValidator = vine.compile(
  vine.object({
    profissionalId: vine.number().positive(),
    dataHoraInicio: vine.date({ formats: ['YYYY-MM-DD HH:mm:ss', 'ISO_8601'] })
      .transform((value) => DateTime.fromJSDate(value)),
    dataHoraFim: vine.date({ formats: ['YYYY-MM-DD HH:mm:ss', 'ISO_8601'] })
      .transform((value) => DateTime.fromJSDate(value)),
    status: vine.enum(['LIVRE', 'OCUPADO', 'BLOQUEADO']).optional(),
  })
)

export const updateDisponibilidadeValidator = vine.compile(
  vine.object({
    profissionalId: vine.number().positive(), 
    dataHoraInicio: vine.date({ formats: ['YYYY-MM-DD HH:mm:ss', 'ISO_8601'] })
      .transform((value) => DateTime.fromJSDate(value)),
    dataHoraFim: vine.date({ formats: ['YYYY-MM-DD HH:mm:ss', 'ISO_8601'] })
      .transform((value) => DateTime.fromJSDate(value)),
    status: vine.enum(['LIVRE', 'OCUPADO', 'BLOQUEADO']).optional(),
  })
)