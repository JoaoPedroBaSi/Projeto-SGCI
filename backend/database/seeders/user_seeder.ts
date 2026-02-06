import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Cliente from '#models/cliente'
import Profissional from '#models/profissional'
import Funcao from '#models/funcao'
import Disponibilidade from '#models/disponibilidade'
import Atendimento from '#models/atendimento'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash' 

export default class extends BaseSeeder {
  public async run() {
    console.log('--- 🛠️ INICIANDO SEED TÉCNICO BLINDADO ---')

    const senhaPura = 'senha123' 
    const senhaHash = await hash.make(senhaPura) 

    // 1. Criar Admin
    const userAdmin = await User.updateOrCreate(
      { email: 'admin@teste.com' },
      { 
        fullName: 'ADMINISTRADOR PRINCIPAL',
        password: senhaPura, 
        perfilTipo: 'admin', 
        status: 'ativo' 
      }
    )

    // 2. Criar Usuário Cliente
    const userCliente = await User.updateOrCreate(
      { email: 'cliente@teste.com' },
      { 
        fullName: 'CLIENTE EXEMPLO', 
        password: senhaPura,
        perfilTipo: 'cliente', 
        status: 'ativo' 
      }
    )

    // 3. Criar Usuário Profissional
    const userProfissional = await User.updateOrCreate(
      { email: 'medico@teste.com' },
      { 
        fullName: 'DOUTOR JOÃO',
        password: senhaPura,
        perfilTipo: 'profissional', 
        status: 'ativo' 
      }
    )

    // CORREÇÃO: Usando o operador "!" para garantir que fullName não é nulo
    const cliente = await Cliente.updateOrCreate(
      { id: userCliente.id },
      {
        nome: userCliente.fullName!, // Operador ! resolve o erro ts(2322)
        cpf: '111.111.111-11',
        telefone: '11999999999',
        email: userCliente.email,
        senha: senhaHash, 
        dataNascimento: DateTime.fromISO('1990-01-01'),
        genero: 'MASCULINO'
      }
    )

    const funcaoMedico = await Funcao.firstOrCreate(
      { nome: 'MEDICO' },
      { nome: 'MEDICO' }
    )

    const profissional = await Profissional.updateOrCreate(
      { id: userProfissional.id },
      {
        funcaoId: funcaoMedico.id,
        nome: userProfissional.fullName!, // Operador ! resolve o erro ts(2322)
        cpf: '222.222.222-22',
        telefone: '11888888888',
        genero: 'MASCULINO',
        dataNascimento: DateTime.fromISO('1985-05-20'),
        email: userProfissional.email,
        senha: senhaHash, 
        status: 'aprovado' as any, // Cast para evitar erro de Enum se houver
        registroConselho: 'CRM-12345',
        conselhoUf: 'SP'
      }
    )
    
    // Configuração de Atendimento para Teste
    const dataInicio = DateTime.now().plus({ days: 1 }).set({ hour: 14, minute: 0, second: 0, millisecond: 0 })
    const dataFim = dataInicio.plus({ minutes: 30 })

    const disponibilidade = await Disponibilidade.updateOrCreate(
      { 
        profissionalId: profissional.id, 
        dataHoraInicio: dataInicio 
      }, 
      {
        profissionalId: profissional.id, 
        dataHoraInicio: dataInicio,
        dataHoraFim: dataFim,
        status: 'OCUPADO'
      }
    )

    await Atendimento.updateOrCreate(
      { 
        profissionalId: profissional.id,
        dataHoraInicio: dataInicio 
      },
      {
        clienteId: cliente.id,
        disponibilidadeId: disponibilidade.id,
        valor: 150.00,
        dataHoraFim: dataFim,
        formaPagamento: 'PIX' as any,
        status: 'CONFIRMADO' as any,
        statusPagamento: 'PAGO' as any
      }
    )

    console.log('--- ✅ SEEDERS CONCLUÍDOS ---')
    console.log(`👑 Admin: ${userAdmin.email} | Senha: ${senhaPura}`)
    console.log(`🩺 Médico: ${userProfissional.email} | Senha: ${senhaPura}`)
    console.log(`👤 Cliente: ${userCliente.email} | Senha: ${senhaPura}`)
  }
}