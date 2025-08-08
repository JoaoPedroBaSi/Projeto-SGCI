/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

export const storeAtendimentoValidator = vine.compile(
    vine.object({
        profissional_id: vine.number().positive(),
        cliente_id: vine.number().positive(),
        horario_comeco: vine.string().regex(/^\d{2}:\d{2}$/),
        horario_termino: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        dia: vine.number().positive().min(1).max(6),
        //yyyy-mm-dd -> modelo estrangeiro separado pelas '-'
        data: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        valor: vine.number().decimal([0, 2]).positive().min(0),
        forma_pagamento: vine.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO']),
        feito: vine.boolean(),
    })
)
export const updateAtendimentoValidator = vine.compile(
    vine.object({
        profissional_id: vine.number().positive(),
        cliente_id: vine.number().positive().optional(),
        horario_comeco: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        horario_termino: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        dia: vine.number().positive().min(1).max(6),
        //yyyy-mm-dd -> modelo estrangeiro separado pelas '-'
        data: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        valor: vine.number().decimal([0, 2]).positive().min(0).optional(),
        forma_pagamento: vine.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO']).optional(),
        feito: vine.boolean().optional(),
    })
)