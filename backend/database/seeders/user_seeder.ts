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
    console.log('--- 🛠️ INICIANDO SEED TÉCNICO BLINDADO ---')

    // ---------------------------------------------------------
    // 1. UTILIZADORES (Idempotente)
    // ---------------------------------------------------------
    const userCliente = await User.updateOrCreate(
      { email: 'cliente@teste.com' },
      { password: 'senha123', perfil_tipo: 'cliente', status: 'ativo' }
    )

    const userProfissional = await User.updateOrCreate(
      { email: 'medico@teste.com' },
      { password: 'senha123', perfil_tipo: 'profissional', status: 'ativo' }
    )

    // ---------------------------------------------------------
    // 2. PERFIS (Usando ID Partilhado - Correção Principal)
    // ---------------------------------------------------------
    const cliente = await Cliente.updateOrCreate(
      { id: userCliente.id }, // Busca pelo ID do User
      {
        name: 'Cliente Exemplo',
        cpf: '111.111.111-11',
        telefone: '11999999999',
        email: userCliente.email,
        senha: userCliente.password, // Opcional, já que auth é via User
        dataNascimento: DateTime.fromISO('1990-01-01'),
        genero: 'MASCULINO'
      }
    )

    let funcaoMedico = await Funcao.firstOrCreate(
      { nome: 'MEDICO' },
      { nome: 'MEDICO' }
    )

    const profissional = await Profissional.updateOrCreate(
      { id: userProfissional.id }, // Busca pelo ID do User
      {
        funcaoId: funcaoMedico.id,
        nome: 'Doutor João',
        cpf: '222.222.222-22',
        telefone: '11888888888',
        genero: 'MASCULINO',
        dataNascimento: DateTime.fromISO('1985-05-20'),
        email: userProfissional.email,
        senha: userProfissional.password,
        status: 'aprovado',
        registro_conselho: 'CRM-12345', // Adicionado para evitar nulos na view
        conselho_uf: 'SP'
      }
    )

    // ---------------------------------------------------------
    // 3. AGENDA (Correção da Duplicação)
    // ---------------------------------------------------------
    
    // Define uma data fixa no futuro para facilitar seus testes
    // Assim você sempre sabe que dia 25/01/2026 às 14:00 tem algo.
    const dataTeste = DateTime.fromISO('2026-01-25T14:00:00')

    const disponibilidade = await Disponibilidade.updateOrCreate(
      { 
        profissionalId: profissional.id, 
        dataHoraInicio: dataTeste // Busca pela data exata para não duplicar
      }, 
      {
        profissionalId: profissional.id, 
        dataHoraInicio: dataTeste, 
        dataHoraFim: dataTeste.plus({ minutes: 30 }),
        status: 'OCUPADO' // Já nasce ocupada pois vamos criar o atendimento
      }
    )

    // AQUI ESTAVA O ERRO: Mudamos de .create() para .updateOrCreate()
    const atendimento = await Atendimento.updateOrCreate(
      { 
        profissionalId: profissional.id,
        dataHoraInicio: dataTeste // Se já existir consulta neste horário, não cria outra
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

    console.log('--- ✅ SEEDERS CONCLUÍDOS SEM DUPLICAÇÕES ---')
    console.log(`Cliente: ${cliente.email} (ID: ${cliente.id})`)
    console.log(`Médico: ${profissional.email} (ID: ${profissional.id})`)
    console.log(`Consulta criada para: ${dataTeste.toFormat('dd/MM/yyyy HH:mm')}`)
  }
}