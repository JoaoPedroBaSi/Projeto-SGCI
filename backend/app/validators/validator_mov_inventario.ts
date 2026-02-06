import vine from '@vinejs/vine'

export const storeMovInventarioValidator = vine.compile(
  vine.object({
    inventarioId: vine.number().positive(),
    tipo: vine.enum(['ENTRADA', 'SAIDA']),
    quantidade: vine.number().min(1).max(10000),
    observacao: vine.string().trim().maxLength(255).optional(),
  })
)