// database/seeders/user_seeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Cliente from '#models/cliente'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    // 1. Cria o registo de autenticação na tabela 'users'
    const user = await User.create({
      email: 'email.de.teste@exemplo.com',
      password: 'senhaDoUtilizador', // O hook no Model vai criptografar isto
      perfil_tipo: 'cliente',
      status: 'ativo',
    })

    // 2. Cria o perfil na tabela 'clientes' e associa-o ao user criado
    const cliente = await Cliente.create({
      user_id: user.id, // A ligação entre as tabelas
      nome: 'Utilizador de Teste',
      cpf: '12345678900',
      telefone: '999999999',
      dataNascimento: DateTime.fromISO('1990-01-01').toJSDate(), // Exemplo de data
      genero: 'MASCULINO'
    })

    // 3. Atualiza o user com o ID do perfil que acabou de ser criado
    user.perfil_id = cliente.id
    await user.save()

    console.log('Utilizador de teste criado com sucesso!')
  }
}