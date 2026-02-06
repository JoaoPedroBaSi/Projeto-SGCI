import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import Profissional from '#models/profissional'
import { FuncaoFactory } from './funcao_factory.js' // Certifique-se que o caminho está certo

export const ProfissionalFactory = factory
  .define(Profissional, async ({ faker }) => {
    return {
      nome: faker.person.fullName().toUpperCase(),
      
      genero: faker.helpers.arrayElement(['MASCULINO', 'FEMININO', 'OUTRO']),
      
      dataNascimento: DateTime.fromJSDate(
        faker.date.birthdate({ min: 18, max: 70, mode: 'age' })
      ),
      
      cpf: faker.string.numeric(11),
      
      telefone: '119' + faker.string.numeric(8),
      
      status: 'aprovado' as const,
      
      registroConselho: faker.string.alphanumeric(6).toUpperCase(),
      conselhoUf: faker.location.state({ abbreviated: true }),
      biografia: faker.lorem.sentence(),
    }
  })
  .state('pendente', (row) => {
    row.status = 'pendente'
  })
  .state('rejeitado', (row) => {
    row.status = 'rejeitado'
  })
  .relation('funcao', () => FuncaoFactory)
  .build()