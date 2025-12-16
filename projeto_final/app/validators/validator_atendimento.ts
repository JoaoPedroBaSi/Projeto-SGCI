/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

export const storeAtendimentoValidator = vine.compile(
    vine.object({
      profissional_id: vine.number().positive(),
      cliente_id: vine.number().positive(),
      observacoes: vine.string().minLength(10).maxLength(200),
      data_hora_inicio: vine.string().trim(),
      forma_pagamento: vine.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO']),
    })
)
export const updateAtendimentoValidator = vine.compile(
    vine.object({
      profissional_id: vine.number().positive().optional(),
      cliente_id: vine.number().positive().optional(),
      observacoes: vine.string().minLength(10).maxLength(200).optional(),
      data_hora_inicio: vine.string().trim(),
      //data_hora_inicio: vine.date({formats: ['iso8601'], }).optional(),
      valor: vine.number().decimal([0, 2]).positive().min(0).optional().optional(),
      forma_pagamento: vine.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO']).optional(),
      status: vine.enum(['CONFIRMADO', 'CONCLUIDO', 'CANCELADO']).optional(),
  })
)
