/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * The error handler is used to convert an exception
 * to an HTTP response.
 */
server.errorHandler(() => import('#exceptions/handler'))

/**
 * The server middleware stack runs middleware on all the HTTP
 * requests, even if there is no route registered for
 * the request URL.
 */
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'), // Ótimo para API Vue.js!
  () => import('@adonisjs/cors/cors_middleware'),
])

/**
 * The router middleware stack runs middleware on all the HTTP
 * requests with a registered route.
 */
router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
])

/**
 * Named middleware collection must be explicitly assigned to
 * the routes or the routes group.
 */
export const middleware = router.named({
  // Autenticação básica (verifica se tem token)
  auth: () => import('#middleware/auth_middleware'),
  
  // Visitantes (quem NÃO está logado)
  guest: () => import('#middleware/guest_middleware'),

  // ACL (Controle de Acesso)
  adminOnly: () => import('#middleware/admin_only_middleware'),
  clienteOnly: () => import('#middleware/cliente_only_middleware'),
  
  // Permissões Combinadas
  clienteOrProfissionalOnly: () => import('#middleware/cliente_or_profissional_only_middleware'),
  
  // NOVO: Necessário para as rotas de Estoque/Inventário
  adminOrProfissionalOnly: () => import('#middleware/admin_or_profissional_only_middleware'),
})