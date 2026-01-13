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
    // 1. Cria ou Atualiza o Usuário CLIENTE
    const userCliente = await User.updateOrCreate(
      { email: 'email.de.teste@exemplo.com' }, // Busca por email
      {
        password: 'senhaDoUtilizador',
        perfil_tipo: 'cliente',
        status: 'ativo',
      }
    )

    // 2. Cria ou Atualiza o Usuário PROFISSIONAL
    const userProfissional = await User.updateOrCreate(
      { email: 'profteste@exemplo.com' }, // Busca por email
      {
        password: 'senhaDoProf',
        perfil_tipo: 'profissional',
        status: 'ativo'
      }
    )
    
    // 3. Cria o perfil CLIENTE vinculado ao userCliente
    const cliente = await Cliente.updateOrCreate(
      { id: userCliente.id }, // Busca pelo ID do user
      {
        userId: userCliente.id,
        nome: 'Utilizador de Teste',
        cpf: '12345678900',
        telefone: '999999999',
        dataNascimento: DateTime.fromISO('1990-01-01'),
        genero: 'MASCULINO'
      }
    )

    // 4. Busca uma função existente (criada no main_seeder) ou cria se não existir
    // Vamos usar o ID 1 (Médico) que você criou no main_seeder
    let funcaoMedico = await Funcao.find(1)
    if (!funcaoMedico) {
        funcaoMedico = await Funcao.create({ nome: 'Médico Geral' })
    }

    // 5. Cria o perfil PROFISSIONAL vinculado ao userProfissional (CORREÇÃO AQUI)
    // Antes você estava usando user.id (do cliente), agora usamos userProfissional.id
    const profissional = await Profissional.updateOrCreate(
      { id: userProfissional.id },
      {
        userId: userProfissional.id,
        funcaoId: funcaoMedico.id,
        nome: 'João Profissional',
        genero: 'MASCULINO',
        dataNascimento: DateTime.fromISO('2005-01-01'),
        cpf: '98765432100',
        telefone: '888888888',
        email: userProfissional.email // Garantindo que o email está aqui também se sua tabela pedir
      }
    )

    // 6. Cria Disponibilidade
    const disponibilidade = await Disponibilidade.updateOrCreate(
      { profissionalId: profissional.id, status: 'LIVRE' }, // Critério simples para não duplicar infinitamente no teste
      {
        profissionalId: profissional.id, 
        dataHoraInicio: DateTime.now(), 
        dataHoraFim: DateTime.now().plus({minutes: 30}),
        status: 'OCUPADO' // Já nasce ocupado pois vamos criar um atendimento abaixo
      }
    )

    // 7. Cria Atendimento
    const atendimento = await Atendimento.create({
      profissionalId: profissional.id,
      clienteId: cliente.id,
      disponibilidadeId: disponibilidade.id,
      valor: 100,
      dataHoraInicio: disponibilidade.dataHoraInicio,
      dataHoraFim: disponibilidade.dataHoraFim,
      formaPagamento: 'PIX',
      status: 'CONFIRMADO'
    })

    // Atualiza o user com o ID do perfil (se a sua lógica exigir isso)
    userCliente.perfil_id = cliente.id
    await userCliente.save()

    console.log('--- SEEDERS RODADOS COM SUCESSO ---')
    console.log('Cliente Email:', userCliente.email)
    console.log('Profissional Email:', userProfissional.email)
    console.log('ID do Atendimento Gerado:', atendimento.id)
    console.log('-----------------------------------')
  }
}