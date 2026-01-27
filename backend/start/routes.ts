/* eslint-disable prettier/prettier */
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

// --- ROTA RAIZ ---
router.get('/', async () => {
  return { hello: 'world' }
})

// =======================================================
// 🔐 AUTENTICAÇÃO E REGISTRO (PÚBLICAS)
// =======================================================
router.post('/login', '#controllers/auth_controller.login')
router.post('/register', '#controllers/auth_controller.register') // Registro de Pacientes
router.post('/esqueci-senha', '#controllers/auth_controller.esqueciSenha')
router.post('/redefinir-senha', '#controllers/auth_controller.redefinirSenha')
router.get('/redefinir-senha', '#controllers/auth_controller.showRedefinirSenha')

// =======================================================
// 👤 PERFIL DO USUÁRIO LOGADO (PROTEGIDAS)
// =======================================================
router.group(() => {
  // Apontando para o 'perfils_controller'
  router.get('/me', '#controllers/perfils_controller.show')
  router.put('/me', '#controllers/perfils_controller.update')

  router.put('/auth/change-password', '#controllers/auth_controller.changePassword')
}).use(middleware.auth())

// =======================================================
// 📦 RECURSOS BÁSICOS (CRUDs)
// =======================================================
router.resource('/funcao', '#controllers/funcoes_controller').except(['create', 'edit'])
router.resource('/especializacao', '#controllers/especializacoes_controller').except(['create', 'edit'])
router.resource('/cliente', '#controllers/clientes_controller').except(['create', 'edit'])

// =======================================================
// 🩺 PROFISSIONAIS (CADASTRO RESTRITO AO ADMIN)
// =======================================================
router.resource('/profissionais', '#controllers/profissionais_controller')
      .except(['create', 'edit'])
      // CORREÇÃO: Usamos chamadas encadeadas (2 argumentos cada) para satisfazer o TypeScript
      .middleware('*', middleware.auth())          // 1. Aplica Auth em TODAS as rotas
      .middleware('store', middleware.adminOnly()) // 2. Adiciona AdminOnly APENAS no store

// Rotas extras de Profissional
router.put('/profissionais/:id/especializacoes', '#controllers/profissionais_controller.associarEspecializacao')
      .middleware(middleware.auth())

router.patch('/profissionais/:id/status', '#controllers/profissionais_controller.atualizarStatus')
      .middleware([middleware.auth(), middleware.adminOnly()])

// =======================================================
// 🏢 SALAS E INVENTÁRIO
// =======================================================
router.resource('/sala', '#controllers/salas_controller').except(['create', 'edit'])
router.resource('/reserva', '#controllers/reservas_controller').except(['create', 'edit']).use('*', middleware.auth())
router.resource('/disponibilidade', '#controllers/disponibilidades_controller').except(['create', 'edit'])
router.resource('/inventario', '#controllers/inventarios_controller').except(['create', 'edit'])
router.resource('/mov_inventario', '#controllers/mov_inventarios_controller').except(['create', 'edit']).use('*', middleware.auth())

// =======================================================
// 🚑 ATENDIMENTOS
// =======================================================
router.group(() => {
    // ALTERAÇÃO IMPORTANTE: Liberado para Admin ver histórico (removido clienteOrProfissionalOnly)
    router.get('/atendimento', '#controllers/atendimentos_controller.index').use(middleware.auth())
    
    router.get('/atendimento/:id', '#controllers/atendimentos_controller.show').middleware(middleware.clienteOrProfissionalOnly())
    router.post('/atendimento', '#controllers/atendimentos_controller.store').middleware(middleware.clienteOnly())
    router.put('/atendimento/:id', '#controllers/atendimentos_controller.update').middleware(middleware.clienteOnly())
    router.delete('/atendimento/:id', '#controllers/atendimentos_controller.destroy').middleware(middleware.clienteOrProfissionalOnly())
    router.patch('/atendimento/:id/recusar', 'AtendimentosController.recusar').use(middleware.auth())
    router.patch('/atendimento/:id/aprovar', 'AtendimentosController.aprovar').use(middleware.auth())

    // Prontuário
    router.post('/atendimentos/:id/prontuario', '#controllers/prontuarios_controller.store')
}).use(middleware.auth())

// =======================================================
// 💰 FINANCEIRO E ESTOQUE
// =======================================================
router.post('/pagamento/processar', '#controllers/transacoes_controller.realizarPagamento').middleware(middleware.auth())

router.group(() => {
    // --- Rotas do Profissional ---
    router.get('/minhas-financas', '#controllers/transacoes_controller.minhasDividas')
    router.post('/transacao/:id/pagar', '#controllers/transacoes_controller.pagar')
    // -----------------------------

    router.get('/transacao', '#controllers/transacoes_controller.index')
    router.get('/transacao/:id', '#controllers/transacoes_controller.show')
    router.post('/transacao', '#controllers/transacoes_controller.store').middleware(middleware.adminOnly())
}).use(middleware.auth())

// Pedidos de Reposição
router.post('/pedidos-reposicao', '#controllers/pedido_reposicaos_controller.store').middleware(middleware.auth())
router.get('/pedidos-reposicao', '#controllers/pedido_reposicaos_controller.index').middleware([middleware.auth()])

// =======================================================
// 🤝 PARCERIAS (ADMIN)
// =======================================================
router.group(() => {
    router.get('/parceria', '#controllers/parcerias_controller.index')
    router.get('/parceria/:id', '#controllers/parcerias_controller.show')
    router.post('/parceria', '#controllers/parcerias_controller.store')
}).use([middleware.auth(), middleware.adminOnly()])

// =======================================================
// ⚙️ ADMINISTRAÇÃO DE USUÁRIOS
// =======================================================
router.get('/user', '#controllers/users_controller.index').middleware([middleware.auth(), middleware.adminOnly()])
router.get('/user/:id', '#controllers/users_controller.show').middleware([middleware.auth()])

// =======================================================
// 🕵️‍♂️ ROTAS DE DEBUG
// =======================================================
router.get('/espiar-senha/:email', async ({ params, request }) => {
  const user = await User.findBy('email', params.email)
  if (!user) return { erro: 'Usuário não encontrado.' }

  const senhaParaTestar = request.input('senha')
  let resultado_teste = "❓ Digite a senha na URL para testar (ex: ?senha=suasenha)"

  if (senhaParaTestar) {
    const bateu = await hash.verify(user.password, senhaParaTestar)
    resultado_teste = bateu
      ? "✅ SUCESSO! A senha bate com o hash."
      : "❌ FALHA! A senha informada não gera esse hash."
  }

  return {
    email: user.email,
    status_conta: user.status,
    teste_login: resultado_teste,
    hash_no_banco: user.password.substring(0, 50) + "..."
  }
})

// ☢️ ROTA NUCLEAR (MARRETA)
router.get('/marreta/:email/:senhaNova', async ({ params }) => {
  try {
    const user = await User.findByOrFail('email', params.email)
    user.password = params.senhaNova
    await user.save()

    return {
      sucesso: true,
      mensagem: 'SENHA ALTERADA NA FORÇA BRUTA!',
      email: user.email,
      nova_senha_definida: params.senhaNova,
      hash_gerado: user.password
    }
  } catch (error) {
    return { erro: 'Usuário não encontrado ou erro ao salvar.', detalhe: error.message }
  }
})