import vine from '@vinejs/vine'

// Regra: calcula a idade com base na data de nascimento
const dataNascimentoRule = vine.createRule(async (value, _, field) => {
  const nascimento = new Date(value as string | number | Date)
  const hoje = new Date()

  // Cálculo da idade considerando mês e dia
  const idade =
    hoje.getFullYear() -
    nascimento.getFullYear() -
    (hoje < new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate()) ? 1 : 0)

  // Verificações de validação
  if (Number.isNaN(nascimento.getTime())) {
    field.report('Data de nascimento inválida', 'validation', field)
  } else if (nascimento > hoje) {
    field.report('A data de nascimento não pode ser futura', 'validation', field)
  } else if (idade < 18) {
    field.report('O cliente deve ter no mínimo 18 anos', 'validation', field)
  } else if (idade > 120) {
    field.report('Idade máxima permitida é 120 anos', 'validation', field)
  }
})

export const storeClienteValidator = vine.compile(
  // Valida os dados do cliente durante sua criação, garantindo que seus dados estejam de acordo com o esperado na tabela,
  // além de alguns adicionais, como o CPF ter exatamente 11 caracteres.
  // Os campos são obrigatórios, pois o cliente deve fornecer todos os dados ao ser criado
  vine.object({
    nome: vine.string().trim().minLength(10).maxLength(40).toUpperCase(),
    genero: vine.enum(['MASCULINO', 'FEMININO']),
    dataNascimento: vine.date().use(dataNascimentoRule()),
    cpf: vine.string().trim().fixedLength(11),
    // email e senhas removidos, uma vez que passaram para users
    telefone: vine.string().trim().minLength(10).maxLength(15),
  })
)

export const updateClienteValidator = vine.compile(
  // Valida os dados do cliente durante seu update, garantindo que estejam de acordo com o esperado na tabela,
  // além de alguns adicionais, como o CPF ter exatamente 11 caracteres.
  // Os campos são opcionais, pois o cliente pode atualizar apenas alguns deles.
  vine.object({
    nome: vine.string().trim().minLength(10).maxLength(40).toUpperCase().optional(),
    genero: vine.enum(['MASCULINO', 'FEMININO']).optional(),
    dataNascimento: vine.date().use(dataNascimentoRule()).optional(),
    cpf: vine.string().trim().fixedLength(11).optional(),
    telefone: vine.string().trim().minLength(10).maxLength(15).optional(),
  })
)
