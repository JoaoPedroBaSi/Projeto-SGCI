/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

export const storeDisponibilidadeValidator = vine.compile(
    vine.object({
        profissional_id: vine.number().positive(),
        //data_hora_inicio: vine.date({formats: ['iso8601'], }),
        //data_hora_fim: vine.date({formats: ['iso8601'], }),
        data_hora_inicio: vine.string().trim(),
        data_hora_fim: vine.string().trim(),
        //Explicação breve do Status
        //Livre -> Disponível para atender
        //Ocupado -> Ocupado com algum atendimento
        //Bloqueado -> Período em que o profissional está indisponível por fatores internos
        status: vine.enum(['LIVRE', 'OCUPADO', 'BLOQUEADO']).optional(), //Se o profissional não informar, será criado como 'LIVRE'
    })
)
export const updateDisponibilidadeValidator = vine.compile(
    vine.object({
        profissional_id: vine.number().positive().optional(),
        data_hora_inicio: vine.string().trim().optional(),
        data_hora_fim: vine.string().trim().optional(),
        status: vine.enum(['LIVRE', 'OCUPADO', 'BLOQUEADO']).optional(),
    })
)
