import vine from '@vinejs/vine'

export const storeClienteValidator = vine.compile(
  // Valida os dados do cliente durante sua criação, garantindo que seus dados estejam de acordo com o esperado na tabela,
  // além de alguns adicionais, como o CPF ter exatamente 11 caracteres e a senha ter entre 8 e 30 caracteres.
  // Os campos são obrigatórios, pois o cliente deve fornecer todos os dados ao ser criado
  vine.object({
    nome: vine.string().trim().minLength(10).maxLength(40),
    genero: vine.enum(['MASCULINO', 'FEMININO']),
    idade: vine.number().min(18).max(120),
    cpf: vine.string().trim().fixedLength(11),
    email: vine.string().trim().email(),
    senha: vine.string().trim().minLength(8).maxLength(30),
  })
)
