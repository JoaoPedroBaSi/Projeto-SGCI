import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

/**
 * Regra customizada para validar idade mínima (18 anos) e datas futuras
 */
const dataNascimentoRule = vine.createRule((value, _, field) => {
  if (!value) return

  const nascimento = DateTime.fromJSDate(value as Date)
  const hoje = DateTime.now()

  if (!nascimento.isValid) {
    field.report('Data de nascimento inválida', 'validation', field)
    return
  }

  if (nascimento > hoje) {
    field.report('A data de nascimento não pode ser futura', 'validation', field)
    return
  }

  const idade = hoje.diff(nascimento, 'years').years

  if (idade < 18) {
    field.report('Você deve ter no mínimo 18 anos para se cadastrar', 'validation', field)
  } else if (idade > 120) {
    field.report('Data de nascimento inválida (idade excessiva)', 'validation', field)
  }
})

/**
 * Validador de Registro de Usuários
 * Define quais campos o sistema aceita na criação de conta
 */
export const registerValidator = vine.compile(
  vine.object({
    // Dados básicos de login
    fullName: vine.string().trim().minLength(3).maxLength(100).toUpperCase(),
    email: vine.string().trim().email().toLowerCase(),
    password: vine.string().minLength(8).maxLength(30),
    perfilTipo: vine.enum(['cliente', 'profissional', 'admin']),
    
    // Dados de perfil comum
    genero: vine.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional(),
    
    dataNascimento: vine.date({ formats: ['YYYY-MM-DD'] })
      .use(dataNascimentoRule())
      .optional(),

    cpf: vine.string()
      .trim()
      .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
      .transform((value) => value.replace(/\D/g, '')) // Limpa pontos e traços
      .optional(),

    telefone: vine.string().trim().minLength(10).maxLength(15).optional(),

    // Campos específicos para Profissionais
    funcaoId: vine.number().positive().optional(),
    registroConselho: vine.string().trim().maxLength(50).optional(),
    conselhoUf: vine.string().trim().fixedLength(2).toUpperCase().optional(),
    biografia: vine.string().maxLength(500).trim().optional(),
    fotoPerfilUrl: vine.string().url().optional(),
    comprovanteCredenciamentoUrl: vine.string().url().optional(),
    
    // Campos de Administração (Essenciais para o Controller não dar erro)
    observacoesAdmin: vine.string().trim().maxLength(1000).optional(),
    status: vine.enum(['ativo', 'pendente', 'inativo']).optional(),
  })
)