import factory from '@adonisjs/lucid/factories'
import Funcao from '#models/funcao'

export const FuncaoFactory = factory
  .define(Funcao, async ({ faker }) => {
    return {
      nome: faker.helpers.arrayElement([
        'MEDICO',
        'DENTISTA',
        'TERAPEUTA',
        'PSICOLOGO',
        'UROLOGISTA',
        'GINECOLOGISTA',
        'NUTRICIONISTA'
      ]),
    }
  })
  .build()