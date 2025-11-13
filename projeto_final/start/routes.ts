/* eslint-disable prettier/prettier */
/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Rotas padrões com resource
router.resource('/funcao', '#controllers/funcoes_controller').except(['create', 'edit'])
router.resource('/especializacao', '#controllers/especializacoes_controller').except(['create', 'edit'])
router.resource('/cliente', '#controllers/clientes_controller').except(['create', 'edit'])
router.resource('/profissional', '#controllers/profissionais_controller').except(['create', 'edit'])
router.put('/profissional/:id/especializacoes', '#controllers/profissionais_controller.associarEspecializacao')
router.resource('/sala', '#controllers/salas_controller').except(['create', 'edit'])
router.resource('/reserva', '#controllers/reservas_controller').except(['create', 'edit'])
router.resource('/disponibilidade', '#controllers/disponibilidades_controller').except(['create', 'edit'])
router.resource('/inventario', '#controllers/inventarios_controller').except(['create', 'edit'])
router.resource('/mov_inventario', '#controllers/mov_inventarios_controller').except(['create', 'edit'])

//ATENDIMENTO
//Somente o adm pode visualizar, considerando que são todos os atendimentos da clínica
//(no futuro teremos que dar permissão aos atendentes)
router.get('/atendimento', '#controllers/atendimentos_controller.index').middleware([middleware.auth(), middleware.adminOnly()])
//Somente o cliente e o profissional autenticado pode visualizar seu próprio atendimento
router.get('/atendimento/:id', '#controllers/atendimentos_controller.show').middleware([middleware.auth(), middleware.clienteOrProfissionalOnly()])
//Somente o cliente (e futuramente o atendente) podem agendar um atendimento
router.post('/atendimento', '#controllers/atendimentos_controller.store').middleware([middleware.auth(), middleware.clienteOnly()])
//Somente o cliente (e futuramente o atendente) podem atualizar um atendimento
router.put('/atendimento/:id', '#controllers/atendimentos_controller.update').middleware([middleware.auth(), middleware.clienteOnly()])
//O cliente, o profissional (profissionais como um todo, e atendentes também)
router.delete('/atendimento/:id', '#controllers/atendimentos_controller.destroy').middleware([middleware.auth(), middleware.clienteOrProfissionalOnly()])

//USER
//Somente o adm pode visualizar todos os usuários
router.get('/user', '#controllers/users_controller.index').middleware([middleware.auth(), middleware.adminOnly()])
//somente usuários autenticados, com seu devido token podem visualizar seus dados
router.get('/user/:id', '#controllers/users_controller.show').middleware([middleware.auth()])
router.post('/login', '#controllers/users_controller.login')

//AUTH
router.post('/register', '#controllers/auth_controller.register')

//PROFISSIONAL
// Somente o adm pode aprovar ou rejeitar um profissional
router.patch('/profissional/:id/status', '#controllers/profissionais_controller.atualizarStatus')
      .middleware([middleware.auth(), middleware.adminOnly()])

//TRANSACAO
router.get('/transacao', '#controllers/transacoes_controller.index').middleware([middleware.auth(), middleware.adminOnly()])
router.get('/transacao/:id', '#controllers/transacoes_controller.show').middleware([middleware.auth(), middleware.adminOnly()])
router.post('/transacao', '#controllers/transacoes_controller.store').middleware([middleware.auth(), middleware.adminOnly()])

//PARCERIA
router.get('/parceria', '#controllers/parcerias_controller.index').middleware([middleware.auth(), middleware.adminOnly()])
router.get('/parceria/:id', '#controllers/parcerias_controller.show').middleware([middleware.auth(), middleware.adminOnly()])
router.post('/parceria', '#controllers/parcerias_controller.store').middleware([middleware.auth(), middleware.adminOnly()])


// teste

router.group(() => {
  router.get('/me', '#controllers/perfils_controller.show')
  router.put('/me', '#controllers/perfils_controller.update')
}).use(middleware.auth())

router.post('esqueci-senha', '#controllers/auth_controller.esqueciSenha')
router.post('redefinir-senha', '#controllers/auth_controller.redefinirSenha')

// MOSTRAR o formulário de redefinição de senha
router.get('/redefinir-senha', '#controllers/auth_controller.showRedefinirSenha')

router.post('/atendimentos/:id/prontuario', '#controllers/prontuarios_controller.store').middleware([middleware.auth()])


router.post('pedidos-reposicao', '#controllers/pedido_reposicaos_controller.store').middleware([middleware.auth(), middleware.auth()])
router.get('pedidos-reposicao', '#controllers/pedido_reposicaos_controller.index').middleware([middleware.auth(), middleware.adminOnly()])
