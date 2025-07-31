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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.resource('/funcao', '#controllers/funcoes_controller').except(['create', 'edit'])
router.resource('/especializacao', '#controllers/especializacoes_controller').except(['create', 'edit'])
router.resource('/cliente', '#controllers/clientes_controller').except(['create', 'edit'])
router.resource('/profissional', '#controllers/profissionais_controller').except(['create', 'edit'])

