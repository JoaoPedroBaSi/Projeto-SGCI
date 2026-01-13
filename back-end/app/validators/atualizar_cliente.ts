import vine from '@vinejs/vine'

export const atualizarClienteValidator = vine.compile(
  vine.object({
    nome: vine.string().minLength(3).optional(),
    telefone: vine.string().optional(),
    dataNascimento: vine.date().optional(),
    cpf: vine.string().regex(/[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}/).optional()
  })
)