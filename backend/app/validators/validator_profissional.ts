import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

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
    field.report('O profissional deve ter no mínimo 18 anos', 'validation', field)
  } else if (idade > 120) {
    field.report('Idade máxima permitida é 120 anos', 'validation', field)
  }
})


export const storeProfissionalValidator = vine.compile(
  vine.object({
    funcaoId: vine.number().positive().optional(), 
    
    nome: vine.string().trim().minLength(3).maxLength(100).toUpperCase(),
    
    genero: vine.enum(['MASCULINO', 'FEMININO', 'OUTRO']),
    
    cpf: vine.string().trim()
      .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
      .transform((value) => value.replace(/\D/g, '')),
    
    dataNascimento: vine.date({ formats: ['YYYY-MM-DD'] })
      .use(dataNascimentoRule())
      .transform((value) => DateTime.fromJSDate(value)),
    
    telefone: vine.string().trim().minLength(10).maxLength(15),

    registroConselho: vine.string().trim().maxLength(50).optional(),
    conselhoUf: vine.string().trim().fixedLength(2).toUpperCase().optional(),
    fotoPerfilUrl: vine.string().url().optional(),
    biografia: vine.string().trim().maxLength(1000).optional(),
    
    status: vine.enum(['pendente', 'aprovado', 'rejeitado', 'ativo', 'inativo']).optional(),
    
    comprovanteCredenciamentoUrl: vine.string().url().optional(),
    observacoesAdmin: vine.string().trim().maxLength(400).optional(),
  })
)


export const updateProfissionalValidator = vine.compile(
  vine.object({
    funcaoId: vine.number().positive().optional(),
    nome: vine.string().trim().minLength(3).maxLength(100).toUpperCase().optional(),
    genero: vine.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional(),
    
    cpf: vine.string().trim()
      .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
      .transform((value) => value.replace(/\D/g, ''))
      .optional(),
      
    dataNascimento: vine.date({ formats: ['YYYY-MM-DD'] })
      .use(dataNascimentoRule())
      .transform((value) => DateTime.fromJSDate(value))
      .optional(),
      
    telefone: vine.string().trim().minLength(10).maxLength(15).optional(),

    registroConselho: vine.string().trim().maxLength(50).optional(),
    conselhoUf: vine.string().trim().fixedLength(2).toUpperCase().optional(),
    fotoPerfilUrl: vine.string().url().optional(),
    biografia: vine.string().trim().maxLength(1000).optional(),
    status: vine.enum(['pendente', 'aprovado', 'rejeitado', 'ativo', 'inativo']).optional(),
    comprovanteCredenciamentoUrl: vine.string().url().optional(),
    observacoesAdmin: vine.string().trim().maxLength(500).optional(),
  })
)