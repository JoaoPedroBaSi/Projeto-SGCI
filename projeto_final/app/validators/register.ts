/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

// Regra: calcula a idade com base na data de nascimento
const dataNascimentoRule = vine.createRule((value, _, field) => {
  if (!value) return;

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

export const registerValidator = vine.compile(
  vine.object({
    // Validação dos campos da tabela 'User'
    fullName: vine.string().trim().minLength(10).maxLength(40).toUpperCase(),
    email: vine.string().trim().email().toLowerCase(),
    password: vine.string().minLength(8).maxLength(30),
    perfil_tipo: vine.enum(['cliente', 'profissional', 'admin']),

    // Campos dos perfis 'cliente' e 'profissional'
    funcao_id: vine.number().positive().optional(),
    genero: vine.enum(['MASCULINO', 'FEMININO']).optional(),
    dataNascimento: vine.date().use(dataNascimentoRule()).optional(),
    cpf: vine.string().trim().regex(/^\d{11}$/).optional(),
    telefone: vine.string().trim().minLength(10).maxLength(15).optional(),

    // Campos específicos da tabela 'Profissional'
    registro_conselho: vine.string().trim().maxLength(50).optional(),
    conselho_uf: vine.string().trim().fixedLength(2).optional(),
    foto_perfil_url: vine.string().url().optional(),
    biografia: vine.string().maxLength(400).optional(),
    status: vine.enum(['ativo', 'pendente', 'inativo']).optional(),
    comprovante_credenciamento_url: vine.string().url().optional(),
    observacoes_admin: vine.string().trim().maxLength(400).optional(),
  }),
)
