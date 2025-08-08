/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

export const storeAtendimentoValidator = vine.compile(
    vine.object({
        profissional_id: vine.number().positive(),
        cliente_id: vine.number().positive(),
        horario_comeco: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        horario_termino: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        dia: vine.number().positive().min(1).max(6),
        //dd/mm/aaaa -> separado pelo / a cada dois números e 4 números após a segunda barra.
        data: vine.string().fixedLength(10).regex(/^\d{2}\/\d{2}\/\d{4}$/),
        valor: vine.number().decimal([0, 2]).positive().min(0),
        forma_pagamento: vine.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO']),
        feito: vine.boolean(),
    })
)
export const updateAtendimentoValidator = vine.compile(
    vine.object({
        profissional_id: vine.number().positive(),
        cliente_id: vine.number().positive(),
        horario_comeco: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        horario_termino: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        dia: vine.number().positive().min(1).max(6),
        //dd/mm/aaaa -> separado pelo / a cada dois números e 4 números após a segunda barra.
        data: vine.string().fixedLength(10).regex(/^\d{2}\/\d{2}\/\d{4}$/),
        valor: vine.number().decimal([0, 2]).positive().min(0),
        forma_pagamento: vine.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO']),
        feito: vine.boolean(),
    })
)