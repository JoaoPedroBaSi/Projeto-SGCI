/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

export const storeDisponibilidadeValidator = vine.compile(
    vine.object({
        profissional_id: vine.number().positive(),
        //1 (segunda); 2 (terça); 3 (quarta); 4 (quinta); 5 (sexta); 6 (sabádo)
        dia: vine.number().positive().max(6),
        //Horários tem tamanho fixo 5 (ex: 15:30), e 
        //devem ter 2 números consecutivos separados por ':' (determinado pela função regex())
        horario_comeco: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        horario_termino: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
    })
)

export const updateDisponibilidadeValidator = vine.compile(
    vine.object({
        profissional_id: vine.number().positive().optional(),
        dia: vine.number().positive().max(31).optional(),
        //Horários tem tamanho fixo 5 (ex: 15:30), e 
        //devem ter 2 números consecutivos separados por ':' (determinado pela função regex())
        horario_comeco: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
        horario_termino: vine.string().fixedLength(5).regex(/^\d{2}:\d{2}$/),
    })
)