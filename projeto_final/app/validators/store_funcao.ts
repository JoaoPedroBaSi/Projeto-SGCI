import vine from '@vinejs/vine'

export const storeFuncaoValidator = vine.compile(
  // Valida o nome da função durante sua criação, garantindo que seja uma string,
  // que não esteja vazia, e que tenha no mínimo 3 caracteres e no máximo 40 caracteres.
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(40),
  })
)
