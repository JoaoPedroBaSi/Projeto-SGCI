import vine from '@vinejs/vine'

export const storeTransacaoValidator = vine.compile(
  vine.object({
    // IDs de vínculo devem ser opcionais, pois a transação pode ser de um Atendimento OU de uma Reserva
    atendimentoId: vine.number().positive().optional(),
    reservaId: vine.number().positive().optional(),
    
    userId: vine.number().positive(),
    
    // Polimorfismo (Quem pagou/recebeu)
    entidadeOrigem: vine.string().trim(),
    entidadeId: vine.number().positive(),
    
    destinatarioTipo: vine.string().trim().optional(),
    destinatarioId: vine.number().positive().optional(),
    
    valor: vine.number().positive(),
    tipo: vine.enum(['ENTRADA', 'SAIDA']),
    
    finalidade: vine.string().trim().maxLength(255),
    
    status: vine.enum(['PENDENTE', 'CONCLUIDA', 'FALHOU', 'ESTORNADA']),
    
    referenciaExterna: vine.string().trim().maxLength(100).optional(),
  })
)

export const updateTransacaoValidator = vine.compile(
  vine.object({
    userId: vine.number().positive().optional(),
    entidadeOrigem: vine.string().trim().optional(),
    entidadeId: vine.number().positive().optional(),
    destinatarioTipo: vine.string().trim().optional(),
    destinatarioId: vine.number().positive().optional(),
    valor: vine.number().positive().optional(),
    tipo: vine.enum(['ENTRADA', 'SAIDA']).optional(),
    finalidade: vine.string().trim().maxLength(255).optional(),
    status: vine.enum(['PENDENTE', 'CONCLUIDA', 'FALHOU', 'ESTORNADA']).optional(),
    referenciaExterna: vine.string().trim().maxLength(100).optional(),
  })
)