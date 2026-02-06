import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

const dataValidadeRule = vine.createRule((value, _, field) => {
  if (!value) return

  const validade = DateTime.fromJSDate(value as Date)
  const hoje = DateTime.now().startOf('day')

  if (!validade.isValid) {
    field.report('Data de validade inválida', 'validation', field)
    return
  }

  if (validade < hoje) {
    field.report('A data de validade não pode ser no passado', 'validation', field)
  }
})

export const storeInventarioValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(100).toUpperCase(),
    tipo: vine.enum(['MEDICAMENTO', 'EQUIPAMENTO', 'MATERIAL_ESCRITORIO', 'MATERIAL_LIMPEZA']),
    quantidade: vine.number().min(0),
    unidadeMedida: vine.string().trim().minLength(1).maxLength(20).toUpperCase(),
    validade: vine.date({ formats: ['YYYY-MM-DD'] })
      .use(dataValidadeRule())
      .transform((value) => DateTime.fromJSDate(value)),
    lote: vine.string().trim().maxLength(50).optional(),
    fornecedor: vine.string().trim().maxLength(100).optional(),
    pontoReposicao: vine.number().min(0),
  })
)

export const updateInventarioValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(100).toUpperCase().optional(),
    tipo: vine.enum(['MEDICAMENTO', 'EQUIPAMENTO', 'MATERIAL_ESCRITORIO', 'MATERIAL_LIMPEZA']).optional(),
    quantidade: vine.number().min(0).optional(),
    unidadeMedida: vine.string().trim().minLength(1).maxLength(20).toUpperCase().optional(),
    validade: vine.date({ formats: ['YYYY-MM-DD'] })
      .use(dataValidadeRule())
      .transform((value) => DateTime.fromJSDate(value))
      .optional(),
    lote: vine.string().trim().maxLength(50).optional(),
    fornecedor: vine.string().trim().maxLength(100).optional(),
    pontoReposicao: vine.number().min(0).optional(),
  })
)