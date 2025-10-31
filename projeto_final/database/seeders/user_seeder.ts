// database/seeders/user_seeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'
import Funcao from '#models/funcao'
import Disponibilidade from '#models/disponibilidade'
import Atendimento from '#models/atendimento'
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

    const usuario = await User.create({
      email: 'profteste@exemplo.com',
      password: 'senhaDoProf',
      perfil_tipo: 'profissional',
      status: 'ativo'
    })  
    
    // 2. Cria o perfil na tabela 'clientes' e associa-o ao user criado
    const cliente = await Cliente.create({
      user_id: user.id, // A ligação entre as tabelas
      nome: 'Utilizador de Teste',
      cpf: '12345678900',
      telefone: '999999999',
      dataNascimento: DateTime.fromISO('1990-01-01'), // Exemplo de data
      genero: 'MASCULINO'
    })

    const funcaoTeste = await Funcao.create({
      nome: 'médico geral'
    })

    const profissional = await Profissional.create({
      userId: usuario.id,
      funcaoId: funcaoTeste.id,
      nome: 'joão',
      genero: 'MASCULINO',
      dataNascimento: DateTime.fromISO('2005-01-01'),
      cpf: '98765432100',
      telefone: '888888888'

    })

    const disponibilidade = await Disponibilidade.create({
      profissionalId: profissional.id, 
      dataHoraInicio: DateTime.now(), 
      dataHoraFim: DateTime.now().plus({minutes: 30}) , // Não sei o tipo do horario pra colocar aqui
    })

    const atendimento = await Atendimento.create({
      profissionalId: profissional.id,
      clienteId: cliente.id,
      disponibilidadeId: disponibilidade.id,
      valor: 100
    })

    // 3. Atualiza o user com o ID do perfil que acabou de ser criado
    user.perfil_id = cliente.id
    await user.save()

    console.log('Utilizador de teste criado com sucesso!')
    console.log('--- DADOS PARA O TESTE ---')
    console.log('ID do Atendimento:', atendimento.id)
    console.log('Login do Profissional:', usuario.email)
    console.log('---------------------------')
  }
}