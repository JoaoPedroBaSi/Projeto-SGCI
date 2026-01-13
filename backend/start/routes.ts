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
router.group(() => {
    router.get('/reserva/ocupados', '#controllers/reservas_controller.buscarOcupados')
    router.resource('/reserva', '#controllers/reservas_controller').except(['create', 'edit'])
}).use(middleware.auth())
router.resource('/disponibilidade', '#controllers/disponibilidades_controller').except(['create', 'edit'])
router.resource('/inventario', '#controllers/inventarios_controller').except(['create', 'edit'])
router.resource('/mov_inventario', '#controllers/mov_inventarios_controller').except(['create', 'edit'])

//ATENDIMENTO
router.get('/atendimento/solicitacoes', '#controllers/atendimentos_controller.buscarSolicitacoes').middleware([middleware.auth(), middleware.adminOnly()]),
router.get('/atendimento', '#controllers/atendimentos_controller.index').middleware([middleware.auth(), middleware.adminOnly()])
router.get('/atendimento/:id', '#controllers/atendimentos_controller.show').middleware([middleware.auth(), middleware.clienteOrProfissionalOnly()])
router.post('/atendimento', '#controllers/atendimentos_controller.store').middleware([middleware.auth(), middleware.clienteOnly()])
router.put('/atendimento/:id', '#controllers/atendimentos_controller.update').middleware([middleware.auth(), middleware.clienteOnly()])
router.patch('/atendimento/cancelar/:id', '#controllers/atendimentos_controller.cancelar').middleware([middleware.auth(), middleware.clienteOrProfissionalOnly()])
router.patch('/atendimento/concluir/:id', '#controllers/atendimentos_controller.concluir').middleware([middleware.auth()])
router.patch('/atendimento/:id/aprovar','#controllers/atendimentos_controller.aprovar').middleware([middleware.auth(), middleware.adminOnly()])
router.patch('/atendimento/:id/recusar','#controllers/atendimentos_controller.recusar').middleware([middleware.auth(), middleware.adminOnly()])

//USER
router.get('/user', '#controllers/users_controller.index').middleware([middleware.auth(), middleware.adminOnly()])
//somente usuários autenticados, com seu devido token podem visualizar seus dados
router.get('/user/:id', '#controllers/users_controller.show').middleware([middleware.auth()])
router.post('/login', '#controllers/users_controller.login')
// Rota para processar pagamento (Exige login)
router.post('/pagamento/processar', '#controllers/transacoes_controller.realizarPagamento').middleware([middleware.auth()])

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

//RESERVA
router.patch('/reserva', '#controllers/reservas_controller.pagar')

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
