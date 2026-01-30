/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

export const storeAtendimentoValidator = vine.compile(
  vine.object({
    profissional_id: vine.number().positive(),
    cliente_id: vine.number().positive(),
    disponibilidade_id: vine.number().positive(), // ADICIONADO
    data_hora_inicio: vine.string().trim(),
    // Ajustado para aceitar exatamente o que vem do Vue
    forma_pagamento: vine.enum(['DINHEIRO', 'PIX', 'CARTÃO DE CRÉDITO', 'DEBITO', 'BOLETO']),
    // Opcional para evitar erro se o usuário escrever pouco
    observacoes: vine.string().trim().maxLength(200).optional(),
    status: vine.enum(['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO']).optional()
  })
)
export const updateAtendimentoValidator = vine.compile(
    vine.object({
      observacoes: vine.string().minLength(10).maxLength(200).optional(),
      data_hora_inicio: vine.string().trim().optional(),
  })
)
