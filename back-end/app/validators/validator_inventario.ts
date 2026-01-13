import vine from '@vinejs/vine'

// Regra para validar a data de validade para não ser no passado ou inválida
const dataValidadeRule = vine.createRule(async (value, __, field) => {
  const validade = new Date(value as string | number | Date)
  const hoje = new Date()

  if (Number.isNaN(validade.getTime())) {
    field.report('Data de validade inválida', 'validation', field)
  } else if (validade < hoje) {
    field.report('A data de validade não pode ser no passado', 'validation', field)
  }
})

export const storeInventarioValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase(),
    tipo: vine.enum(['MEDICAMENTO', 'EQUIPAMENTO', 'MATERIAL_ESCRITORIO', 'MATERIAL_LIMPEZA']),
    quantidade: vine.number().min(0),
    unidadeMedida: vine.string().trim().minLength(1).maxLength(20).toUpperCase(),
    validade: vine.date().use(dataValidadeRule()),
    lote: vine.string().trim().optional(),
    fornecedor: vine.string().trim().optional(),
    pontoReposicao: vine.number().min(0),
  })
)

export const updateInventarioValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).maxLength(50).toUpperCase().optional(),
    tipo: vine
      .enum(['MEDICAMENTO', 'EQUIPAMENTO', 'MATERIAL_ESCRITORIO', 'MATERIAL_LIMPEZA'])
      .optional(),
    quantidade: vine.number().min(0).optional(),
    unidadeMedida: vine.string().trim().minLength(1).maxLength(20).toUpperCase().optional(),
    validade: vine.date().use(dataValidadeRule()).optional(),
    lote: vine.string().trim().optional(),
    fornecedor: vine.string().trim().optional(),
    pontoReposicao: vine.number().min(0).optional(),
  })
)
