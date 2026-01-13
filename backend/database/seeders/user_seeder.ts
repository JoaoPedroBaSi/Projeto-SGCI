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
    console.log('--- INICIANDO SEED DE TESTE CORRIGIDO ---')

    // 1. Cria User Cliente (COM PERFIL_TIPO)
    const userCliente = await User.updateOrCreate(
      { email: 'cliente@teste.com' },
      {
        password: 'senha123',
        perfil_tipo: 'cliente', // <--- CORREÇÃO AQUI
        status: 'ativo'         // <--- CORREÇÃO AQUI
      }
    )

    // 2. Cria User Profissional (COM PERFIL_TIPO)
    const userProfissional = await User.updateOrCreate(
      { email: 'medico@teste.com' },
      {
        password: 'senha123',
        perfil_tipo: 'profissional', // <--- CORREÇÃO AQUI
        status: 'ativo'              // <--- CORREÇÃO AQUI
      }
    )
    
    // 3. Cria Perfil Cliente
    const cliente = await Cliente.updateOrCreate(
      { id: userCliente.id },
      {
        id: userCliente.id,
        nome: 'Cliente Exemplo',
        cpf: '111.111.111-11',
        telefone: '11999999999',
        email: userCliente.email,
        senha: userCliente.password,
        dataNascimento: DateTime.fromISO('1990-01-01'),
        genero: 'MASCULINO'
      }
    )

    // 4. Busca Função
    let funcaoMedico = await Funcao.findBy('nome', 'MEDICO')
    if (!funcaoMedico) {
        funcaoMedico = await Funcao.create({ nome: 'MEDICO' })
    }

    // 5. Cria Perfil Profissional
    const profissional = await Profissional.updateOrCreate(
      { id: userProfissional.id },
      {
        id: userProfissional.id,
        funcaoId: funcaoMedico.id,
        nome: 'Doutor João',
        cpf: '222.222.222-22',
        telefone: '11888888888',
        genero: 'MASCULINO',
        dataNascimento: DateTime.fromISO('1985-05-20'),
        email: userProfissional.email,
        senha: userProfissional.password,
        status: 'aprovado'
      }
    )

    // 6. Disponibilidade
    const disponibilidade = await Disponibilidade.updateOrCreate(
      { profissionalId: profissional.id, status: 'LIVRE' }, 
      {
        profissionalId: profissional.id, 
        dataHoraInicio: DateTime.now(), 
        dataHoraFim: DateTime.now().plus({ minutes: 30 }),
        status: 'OCUPADO'
      }
    )

    // 7. Atendimento
    const atendimento = await Atendimento.create({
      profissionalId: profissional.id,
      clienteId: cliente.id,
      disponibilidadeId: disponibilidade.id,
      valor: 150.00,
      dataHoraInicio: disponibilidade.dataHoraInicio,
      dataHoraFim: disponibilidade.dataHoraFim,
      formaPagamento: 'PIX',
      status: 'CONFIRMADO',
      statusPagamento: 'PAGO'
    })

    console.log('--- SEEDERS CONCLUÍDOS ---')
    console.log(`Cliente ID: ${cliente.id}`)
    console.log(`Profissional ID: ${profissional.id}`)
  }
}