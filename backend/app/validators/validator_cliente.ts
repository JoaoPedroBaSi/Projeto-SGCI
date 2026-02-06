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
    field.report('O cliente deve ter no mínimo 18 anos', 'validation', field)
  } else if (idade > 120) {
    field.report('Idade máxima permitida é 120 anos', 'validation', field)
  }
})

export const storeClienteValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(100).toUpperCase(),
    genero: vine.enum(['MASCULINO', 'FEMININO']),
    dataNascimento: vine.date({ formats: ['YYYY-MM-DD'] }).use(dataNascimentoRule()),
    cpf: vine.string().trim().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/).transform((value) => value.replace(/\D/g, '')),
    telefone: vine.string().trim().minLength(10).maxLength(15),
  })
)

export const updateClienteValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(100).toUpperCase().optional(),
    genero: vine.enum(['MASCULINO', 'FEMININO']).optional(),
    dataNascimento: vine.date({ formats: ['YYYY-MM-DD'] }).use(dataNascimentoRule()).optional(),
    cpf: vine.string().trim().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/).transform((value) => value.replace(/\D/g, '')).optional(),
    telefone: vine.string().trim().minLength(10).maxLength(15).optional(),
  })
)