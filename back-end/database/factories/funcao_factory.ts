import factory from '@adonisjs/lucid/factories'
import Funcao from '#models/funcao'

export const FuncaoFactory = factory
  .define(Funcao, async ({ faker }) => {
    return {
      nome: faker.lorem.word(),
    }
  })
  .build()