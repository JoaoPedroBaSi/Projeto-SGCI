import vine from '@vinejs/vine'

export const storeEspecializacaoValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(4).maxLength(100).toUpperCase(),
  })
)

export const updateEspecializacaoValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(4).maxLength(100).toUpperCase().optional(),
  })
)