import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import Profissional from '#models/profissional'

export const ProfissionalFactory = factory
  .define(Profissional, async ({ faker }) => {
    return {
      nome: faker.person.fullName(),
      genero: faker.helpers.arrayElement(['MASCULINO', 'FEMININO']),
      dataNascimento: DateTime.fromJSDate(faker.date.birthdate()),
      cpf: faker.string.numeric('###########'),
      telefone: faker.phone.number(),
      status: 'aprovado' as const,
    }
  })
  .build()