/* eslint-disable prettier/prettier */
import vine from '@vinejs/vine'

// Regra: calcula a idade com base na data de nascimento
const dataNascimentoRule = vine.createRule((value, _, field) => {
  if (!value) return;

  const nascimento = new Date(value as string | number | Date)
  const hoje = new Date()

  const idade =
    hoje.getFullYear() -
    nascimento.getFullYear() -
    (hoje < new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate()) ? 1 : 0)

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
    // AJUSTE 1: Diminui o tamanho mínimo do nome para aceitar nomes curtos
    fullName: vine.string().trim().minLength(5).maxLength(40).toUpperCase(),
    email: vine.string().trim().email().toLowerCase(),
    password: vine.string().minLength(8).maxLength(255),
    perfil_tipo: vine.enum(['cliente', 'profissional', 'admin']),

    funcao_id: vine.number().positive().optional(),
    
    // Obs: Garanta que o front manda "MASCULINO" ou "FEMININO"
    genero: vine.enum(['MASCULINO', 'FEMININO']).optional(),
    
    dataNascimento: vine.date().use(dataNascimentoRule()).optional(),
    
    // AJUSTE 2: Adicionei um transform para remover pontos e traços caso o front envie
    // Isso garante que chegue apenas números para o regex validar
cpf: vine
      .string()
      .trim()
      .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
      .transform((value) => value.replace(/\D/g, ''))
      .optional(),

    telefone: vine.string().trim().minLength(10).maxLength(15).optional(),

    registro_conselho: vine.string().trim().maxLength(50).optional(),
    conselho_uf: vine.string().trim().fixedLength(2).optional(),
    foto_perfil_url: vine.string().url().optional(),
    biografia: vine.string().maxLength(400).optional(),
    status: vine.enum(['ativo', 'pendente', 'inativo']).optional(),
    comprovante_credenciamento_url: vine.string().url().optional(),
    observacoes_admin: vine.string().trim().maxLength(400).optional(),
  }),
)