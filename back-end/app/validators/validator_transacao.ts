import vine from '@vinejs/vine'

export const storeTransacaoValidator = vine.compile(
    vine.object({
        user_id: vine.number().positive(),
        entidade_origem: vine.string().trim(),
        entidade_id: vine.number().positive(),
        destinatario_tipo: vine.string().trim().nullable().optional(),
        destinatario_id: vine.number().positive().nullable().optional(),
        valor: vine.number().positive(),
        tipo: vine.enum(['ENTRADA', 'SAIDA']),
        //finalidade é uma espécie de justificativa
        finalidade: vine.string().trim(),
        status: vine.enum(['PENDENTE', 'CONCLUIDA', 'FALHOU', 'ESTORNADA']),
        referencia_externa: vine.string().trim().nullable().optional()
    })
)

export const updateTransacaoValidator = vine.compile(
    vine.object({
        user_id: vine.number().positive().optional(),
        entidade_origem: vine.string().trim().optional(),
        entidade_id: vine.number().positive().optional(),
        destinatario_tipo: vine.string().trim().nullable().optional(),
        destinatario_id: vine.number().positive().nullable().optional(),
        valor: vine.number().positive().optional(),
        tipo: vine.enum(['ENTRADA', 'SAIDA']).optional(),
        //finalidade é uma espécie de justificativa
        finalidade: vine.string().trim().optional(),
        status: vine.enum(['PENDENTE', 'CONCLUIDA', 'FALHOU', 'ESTORNADA']).optional(),
        referencia_externa: vine.string().trim().nullable().optional()
    })
)