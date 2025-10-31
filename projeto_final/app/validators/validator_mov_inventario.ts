import vine from '@vinejs/vine'

export const storeMovInventarioValidator = vine.compile(
  vine.object({
    id_item: vine.number().positive(),
    id_profissional: vine.number().positive(),
    tipo: vine.enum(['ENTRADA', 'SAIDA']),
    quantidade: vine.number().min(1).max(9999),
    observacao: vine.string().trim().maxLength(255).optional(),
  })
)
