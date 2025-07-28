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

router.resource('/funcao', '#controllers/funcaos_controller').except(['create', 'edit'])
router.post('/funcao/:id/profissionais', '#controllers/funcaos_controller.associarProfissional')
