import vine from '@vinejs/vine'

export const storeSalaValidator = vine.compile(
  // Valida os dados da sala durante sua criação, garantindo que estejam de acordo com o esperado na tabela,
  // além de alguns adicionais, como o nome ter entre 3 e 50 caracteres e o preço de aluguel ser um número positivo.
  // Os campos são obrigatórios, pois a sala deve ser criada com todos os dados necessários
  vine.object({
    profissionalId: vine.number().positive(),
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase(),
    precoAluguel: vine.number().min(900),
    dataDisponibilidade: vine.string().trim(),
    ocupado: vine.boolean(),
  })
)

export const updateSalaValidator = vine.compile(
  // Valida os dados da sala durante sua atualização, garantindo que estejam de acordo com o esperado na tabela,
  // além de alguns adicionais, como o nome ter entre 3 e 50 caracteres e o preço de aluguel ser um número positivo.
  // Os campos são opcionais, pois a sala pode ser atualizada apenas com alguns dados por vez
  vine.object({
    profissionalId: vine.number().positive().optional(),
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase().optional(),
    precoAluguel: vine.number().min(900).optional(),
    dataDisponibilidade: vine.string().trim().optional(),
    ocupado: vine.boolean().optional(),
  })
)
