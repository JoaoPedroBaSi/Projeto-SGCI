import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import emitter from '@adonisjs/core/services/emitter'
import Sala from '#models/sala'
import Reserva from '#models/reserva'
import { DateTime } from 'luxon'
import { ProfissionalFactory } from '#database/factories/profissional_factory'
import { UserFactory } from '#database/factories/user_factory'
import { FuncaoFactory } from '#database/factories/funcao_factory'

test.group('Automação de Salas (Sprint 4)', (group) => {
  // Limpeza do banco antes de cada teste
  group.each.setup(async () => await testUtils.db().truncate())

  test('Deve mudar status da sala para OCUPADO quando evento reserva:aprovada ocorrer', async ({ assert }) => {
    
    // 1. SETUP: Criar o Cenário (Profissional e Sala)
    const funcao = await FuncaoFactory.create()
    const user = await UserFactory.create()
    const profissional = await ProfissionalFactory.merge({ userId: user.id, funcaoId: funcao.id }).create()
    
    // Criamos uma sala DISPONIVEL
    const sala = await Sala.create({
      nome: 'Sala de Teste 01',
      capacidadePacientes: 10,
      precoAluguel: 100,
      status: 'DISPONIVEL', // Começa livre
      profissionalId: profissional.id,
      dataDisponibilidade: DateTime.now()
    })

    // Criamos uma reserva APROVADA ligada a essa sala
    const reserva = await Reserva.create({
      salaId: sala.id,
      profissionalId: profissional.id,
      status: 'APROVADA', // O gatilho lógico
      dataHoraInicio: DateTime.now(),
      dataHoraFim: DateTime.now().plus({ hours: 1 })
    })

    // 2. AÇÃO: Disparar o Evento (Simulando o sistema)
    // Aqui nós "fingimos" que o controller do João Pedro acabou de aprovar a reserva
    await emitter.emit('reserva:aprovada', { reserva })

    // Pequeno delay para garantir que o Listener (que é assíncrono) teve tempo de rodar
    await new Promise(resolve => setTimeout(resolve, 100))

    // 3. VERIFICAÇÃO: O status mudou?
    // Buscamos a sala novamente no banco para ver como ela está AGORA
    const salaAtualizada = await Sala.findOrFail(sala.id)

    // A prova de fogo:
    assert.equal(salaAtualizada.status, 'OCUPADO') 
  })
})