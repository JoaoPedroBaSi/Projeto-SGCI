import vine from '@vinejs/vine'

export const updateFuncaoValidator = vine.compile(
  // Valida o nome da função durante o update, garantindo que seja uma string,
  // que não esteja vazia, e que tenha no mínimo 3 caracteres máximo 40 caracteres.
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(40),
  })
)
