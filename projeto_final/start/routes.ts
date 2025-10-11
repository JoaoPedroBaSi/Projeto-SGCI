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

router.resource('/funcao', '#controllers/funcoes_controller').except(['create', 'edit'])
router.resource('/especializacao', '#controllers/especializacoes_controller').except(['create', 'edit'])
router.resource('/cliente', '#controllers/clientes_controller').except(['create', 'edit'])
router.resource('/profissional', '#controllers/profissionais_controller').except(['create', 'edit'])
router.put('/profissional/:id/especializacoes', '#controllers/profissionais_controller.associarEspecializacao')
router.resource('/sala', '#controllers/salas_controller').except(['create', 'edit'])
router.resource('/disponibilidade', '#controllers/disponibilidades_controller').except(['create', 'edit'])
router.resource('/atendimento', '#controllers/atendimentos_controller').except(['create', 'edit'])

//Somente o adm pode visualizar todos os usuários
router.get('/users', '#controllers/users_controller.index').middleware([middleware.auth()])
router.post('/login', '#controllers/users_controller.login')
router.post('/register', '#controllers/auth_controller.register')
//somente usuários autenticados, com seu devido token podem visualizar seus dados
router.get('/user/:id', '#controllers/users_controller.show').middleware([middleware.auth()])
