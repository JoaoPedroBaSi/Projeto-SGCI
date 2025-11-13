import factory from '@adonisjs/lucid/factories'
import Inventario from '#models/inventario'

export const InventarioFactory = factory
  .define(Inventario, async ({ faker }) => {
    return {
      nome: faker.lorem.word(),
      tipo: faker.helpers.arrayElement(['MEDICAMENTO', 'EQUIPAMENTO', 'MATERIAL_ESCRITORIO', 'MATERIAL_LIMPEZA']),
      quantidade: faker.number.int({ min: 1, max: 100 }),
      unidadeMedida: 'unidade',
      pontoReposicao: 10,
    }
  })
  .build()