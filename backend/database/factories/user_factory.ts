import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { ProfissionalFactory } from './profissional_factory.js'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: faker.person.fullName().toUpperCase(),
      email: faker.internet.email().toLowerCase(),
      password: 'password', 
      perfilTipo: 'cliente' as const,
      status: 'ativo' as const,
    }
  })
  .state('admin', (row) => {
    row.perfilTipo = 'admin'
  })
  .state('profissional', (row) => {
    row.perfilTipo = 'profissional'
  })
  .state('pendente', (row) => {
    // Forçamos o tipo aqui para alinhar com o que o Seeder espera
    row.status = 'pendente' as 'ativo' 
  })
  .state('inativo', (row) => {
    row.status = 'inativo'
  })
  .relation('profissional', () => ProfissionalFactory)
  .build()