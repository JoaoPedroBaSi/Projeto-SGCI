/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

export const storeAtendimentoValidator = vine.compile(
    vine.object({
        profissional_id: vine.number().positive(),
        cliente_id: vine.number().positive(),
        horario_comeco: vine.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).trim(),
        //Removi o campo horario_termino, já que é um campo gerado pela própria aplicação
        //resumindo, horario_termino = horario_comeco + 30 (min)
        //horario_termino: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
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
        horario_comeco: vine.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).trim(),
        //horario_termino: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        dia: vine.number().positive().min(1).max(6),
        //yyyy-mm-dd -> modelo estrangeiro separado pelas '-'
        data: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/), 
        valor: vine.number().decimal([0, 2]).positive().min(0).optional(),
        forma_pagamento: vine.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO']).optional(),
        feito: vine.boolean().optional(),
    })
)