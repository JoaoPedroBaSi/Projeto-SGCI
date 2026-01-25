import vine from '@vinejs/vine'

export const storeSalaValidator = vine.compile(
  // Valida os dados da sala durante sua criação, garantindo que estejam de acordo com o esperado na tabela,
  // além de alguns adicionais, como o nome ter entre 3 e 50 caracteres e o preço de aluguel ser um número positivo.
  // Os campos são obrigatórios, pois a sala deve ser criada com todos os dados necessários
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase(),
    status: vine.enum(['DISPONIVEL', 'OCUPADO', 'MANUTENÇÃO']),
    precoAluguel: vine.number().min(20),
    capacidadePacientes: vine.number().positive(),
  })
)

export const updateSalaValidator = vine.compile(
  // Valida os dados da sala durante sua atualização, garantindo que estejam de acordo com o esperado na tabela,
  // além de alguns adicionais, como o nome ter entre 3 e 50 caracteres e o preço de aluguel ser um número positivo.
  // Os campos são opcionais, pois a sala pode ser atualizada apenas com alguns dados por vez
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase().optional(),
    status: vine.enum(['DISPONIVEL', 'OCUPADO', 'MANUTENÇÃO']).optional(),
    precoAluguel: vine.number().min(20).optional(),
    capacidadePacientes: vine.number().positive().optional(),
  })
)
