import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { ProfissionalFactory } from '#database/factories/profissional_factory'
import { FuncaoFactory } from '#database/factories/funcao_factory'
import { InventarioFactory } from '#database/factories/inventario_factory'

test.group('Listagem de Pedidos de reposicao', (group) => {
  group.each.setup( async() => await testUtils.db().truncate())
  
  test('Deve listar todos os pedidos de reposição quando o usuário for admin', async ({ client }) => {
    const usuarioAdmin = await UserFactory
      .merge({
        email: 'admin-teste@sgci.com',
        password: '123',
        perfil_tipo: 'admin',
        status: 'ativo'
      })
      .create() 

    const resposta = await client.get('/pedidos-reposicao').loginAs(usuarioAdmin);
    return resposta.assertStatus(200)
  })

  test('Deve permitir que um profissional crie um pedido de reposição', async ({ client, assert }) => {
    // PASSO 1: Criar os dados na ordem correta
    // Função é necessária para criar o profissional
    const funcao = await FuncaoFactory.create()

    // Usuário com perfil de profissional
    const usuarioProfissional = await UserFactory
      .merge({
        email: 'profissional-teste@sgci.com',
        password: '123',
        perfil_tipo: 'profissional',
        status: 'ativo'
      })
      .create()

    // Perfil profissional vinculado ao usuário
    const perfilProfissional = await ProfissionalFactory
      .merge({
        id: usuarioProfissional.id,
        userId: usuarioProfissional.id,
        funcaoId: funcao.id
      })
      .create()

    // Item de inventário que será solicitado na reposição
    const itemInventario = await InventarioFactory.create()

    // PASSO 2: Executar a ação (POST para criar pedido)
    // .json({ ... }) contém os dados esperados pelo request.only()
    const resposta = await client
      .post('/pedidos-reposicao')
      .loginAs(usuarioProfissional)
      .json({
        idInventario: itemInventario.id,
        quantidade: 10
      })

    // PASSO 3: Verificar a resposta HTTP
    resposta.assertStatus(201)

    // PASSO 4: Verificar se os dados foram salvos no banco
    const pedidoExiste = await db.from('pedidos_reposicao').where({
      id_inventario: itemInventario.id,
      id_profissional: perfilProfissional.id,
      quantidade: 10,
      status: 'pendente'
    }).first()

    assert.isNotNull(pedidoExiste)
  })
})