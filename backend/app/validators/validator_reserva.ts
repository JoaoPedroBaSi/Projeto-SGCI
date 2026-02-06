import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

const htmlDateTimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

export const storeReservaValidator = vine.compile(
  vine.object({
    salaId: vine.number().positive(),
    profissionalId: vine.number().positive(),
    dataHoraInicio: vine.date({ formats: ['YYYY-MM-DDTHH:mm', 'ISO_8601'] })
      .transform((value) => DateTime.fromJSDate(value)),
    dataHoraFim: vine.date({ formats: ['YYYY-MM-DDTHH:mm', 'ISO_8601'] })
      .transform((value) => DateTime.fromJSDate(value)),
  })
)

export const storeReservaLoteValidator = vine.compile(
  vine.object({
    salaId: vine.number().positive(),
    profissionalId: vine.number().positive(),
    horarios: vine.array(
      vine.object({
        inicio: vine.string().regex(htmlDateTimeLocalRegex),
        fim: vine.string().regex(htmlDateTimeLocalRegex),
      })
    ).minLength(1),
  })
)

export const updateReservaStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['APROVADA', 'REJEITADO', 'CANCELADO', 'PENDENTE']),
  })
)

export const updateReservaFormaPagamento = vine.compile(
  vine.object({
    formaPagamento: vine.enum(['PIX', 'DEBITO', 'CREDITO', 'DINHEIRO', 'BOLETO']),
  })
)