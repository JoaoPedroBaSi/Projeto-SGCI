import factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password', // Senha conhecida para testes
      
      // 'as const' resolve o erro de tipagem string vs 'cliente'
      perfil_tipo: 'cliente' as const, 
      status: 'ativo' as const,
    }
  })
  .build()