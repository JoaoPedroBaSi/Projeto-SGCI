import factory from '@adonisjs/lucid/factories'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      password: await hash.make('password123'),
      perfil_tipo: 'profissional' as const,
      status: 'ativo' as const,
    }
  })
  .build()