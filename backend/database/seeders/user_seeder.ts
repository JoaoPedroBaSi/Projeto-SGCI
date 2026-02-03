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

    // DEFINIÇÃO DAS SENHAS
    const senhaPura = 'senha123' // Para o User (que tem hook automático)
    const senhaHash = await hash.make(senhaPura) // Para Profissional/Cliente (que não têm hook)

    // ---------------------------------------------------------
    // 1. SUPER ADMINISTRADOR
    // ---------------------------------------------------------
    const userAdmin = await User.updateOrCreate(
      { email: 'admin@teste.com' },
      { 
        fullName: 'Administrador Principal',
        password: senhaPura, // <--- Manda pura, o Model User criptografa
        perfil_tipo: 'admin', 
        status: 'ativo' 
      }
    )

    // ---------------------------------------------------------
    // 2. UTILIZADORES PADRÃO
    // ---------------------------------------------------------
    const userCliente = await User.updateOrCreate(
      { email: 'cliente@teste.com' },
      { 
        fullName: 'Cliente Exemplo',
        password: senhaPura, // <--- Manda pura
        perfil_tipo: 'cliente', 
        status: 'ativo' 
      }
    )

    const userProfissional = await User.updateOrCreate(
      { email: 'medico@teste.com' },
      { 
        fullName: 'Doutor João',
        password: senhaPura, // <--- Manda pura
        perfil_tipo: 'profissional', 
        status: 'ativo' 
      }
    )

    // ---------------------------------------------------------
    // 3. VINCULAR PERFIS
    // ---------------------------------------------------------
    
    // Perfil Cliente
    const cliente = await Cliente.updateOrCreate(
      { id: userCliente.id },
      {
        nome: userCliente.fullName ?? 'Cliente Exemplo', 
        cpf: '111.111.111-11',
        telefone: '11999999999',
        email: userCliente.email,
        senha: senhaHash, // <--- Manda Hash, pois tabela Clientes não tem hook
        dataNascimento: DateTime.fromISO('1990-01-01'),
        genero: 'MASCULINO'
      }
    )

    // Função do Médico
    let funcaoMedico = await Funcao.firstOrCreate(
      { nome: 'MEDICO' },
      { nome: 'MEDICO' }
    )

    // Perfil Profissional
    const profissional = await Profissional.updateOrCreate(
      { id: userProfissional.id },
      {
        funcaoId: funcaoMedico.id,
        nome: userProfissional.fullName ?? 'Doutor João',
        cpf: '222.222.222-22',
        telefone: '11888888888',
        genero: 'MASCULINO',
        dataNascimento: DateTime.fromISO('1985-05-20'),
        email: userProfissional.email,
        senha: senhaHash, // <--- Manda Hash, pois tabela Profissionais não tem hook
        status: 'aprovado',
        registro_conselho: 'CRM-12345',
        conselho_uf: 'SP'
      }
    )

    // ---------------------------------------------------------
    // 4. CRIAR DADOS DE AGENDA E CONSULTA
    // ---------------------------------------------------------
    
    const dataTeste = DateTime.fromISO('2026-01-25T14:00:00')

    const disponibilidade = await Disponibilidade.updateOrCreate(
      { 
        profissionalId: profissional.id, 
        dataHoraInicio: dataTeste 
      }, 
      {
        profissionalId: profissional.id, 
        dataHoraInicio: dataTeste, 
        dataHoraFim: dataTeste.plus({ minutes: 30 }),
        status: 'OCUPADO'
      }
    )

    await Atendimento.updateOrCreate(
      { 
        profissionalId: profissional.id,
        dataHoraInicio: dataTeste
      },
      {
        clienteId: cliente.id,
        disponibilidadeId: disponibilidade.id,
        valor: 150.00,
        dataHoraFim: disponibilidade.dataHoraFim,
        formaPagamento: 'PIX',
        status: 'CONFIRMADO',
        statusPagamento: 'PAGO'
      }
    )

    console.log('--- ✅ SEEDERS CONCLUÍDOS ---')
    console.log(`👑 Admin: ${userAdmin.email} | Senha: ${senhaPura}`)
  }
}