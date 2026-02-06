import vine from '@vinejs/vine'

export const storeSalaValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase(),
    status: vine.enum(['DISPONIVEL', 'OCUPADO', 'MANUTENÇÃO']),
    precoAluguel: vine.number().min(20),
    capacidadePacientes: vine.number().positive(),
  })
)

export const updateSalaValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase().optional(),
    status: vine.enum(['DISPONIVEL', 'OCUPADO', 'MANUTENÇÃO']).optional(),
    precoAluguel: vine.number().min(20).optional(),
    capacidadePacientes: vine.number().positive().optional(),
  })
)