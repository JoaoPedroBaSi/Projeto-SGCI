import factory from '@adonisjs/lucid/factories'
import Inventario from '#models/inventario'
import { DateTime } from 'luxon'

export const InventarioFactory = factory
  .define(Inventario, async ({ faker }) => {
    return {
      nome: faker.commerce.productName().toUpperCase(),
      
      tipo: faker.helpers.arrayElement([
        'MEDICAMENTO', 
        'EQUIPAMENTO', 
        'MATERIAL_ESCRITORIO', 
        'MATERIAL_LIMPEZA'
      ]),
      
      quantidade: faker.number.int({ min: 1, max: 500 }),
      
      unidadeMedida: faker.helpers.arrayElement(['UNIDADE', 'CAIXA', 'FRASCO', 'LITRO', 'ML', 'MG']),
      
      validade: DateTime.fromJSDate(faker.date.future()),
      
      lote: faker.string.alphanumeric(6).toUpperCase(),
      fornecedor: faker.company.name(),
      
      pontoReposicao: faker.number.int({ min: 5, max: 20 }),
    }
  })
  .build()