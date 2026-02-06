import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const storeAtendimentoValidator = vine.compile(
  vine.object({
    profissionalId: vine.number().positive(),
    clienteId: vine.number().positive(),
    disponibilidadeId: vine.number().positive(),
    dataHoraInicio: vine.date({ formats: ['YYYY-MM-DD HH:mm:ss', 'ISO_8601'] }).transform((value) => DateTime.fromJSDate(value)),
    formaPagamento: vine.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO', 'BOLETO']),
    observacoes: vine.string().trim().maxLength(200).optional(),
    status: vine.enum(['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO']).optional(),
  })
)

export const updateAtendimentoValidator = vine.compile(
  vine.object({
    observacoes: vine.string().trim().minLength(10).maxLength(200).optional(),
    dataHoraInicio: vine.date({ formats: ['YYYY-MM-DD HH:mm:ss', 'ISO_8601'] }).transform((value) => DateTime.fromJSDate(value)).optional(),
    status: vine.enum(['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO']).optional(),
  })
)