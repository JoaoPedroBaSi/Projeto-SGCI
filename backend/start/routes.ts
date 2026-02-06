/* eslint-disable prettier/prettier */
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

// --- ROTA RAIZ ---
router.get('/', async () => {
  return { 
    sistema: 'SGCI API', 
    status: 'online', 
    versao: '1.0.0' 
  }
})

// =======================================================
// 🔐 AUTENTICAÇÃO E REGISTRO (PÚBLICAS / GUEST)
// =======================================================
router.group(() => {
  router.post('/login', '#controllers/auth_controller.login')
  router.post('/register', '#controllers/auth_controller.register')
  router.post('/esqueci-senha', '#controllers/auth_controller.esqueciSenha')
  router.post('/redefinir-senha', '#controllers/auth_controller.redefinirSenha')
}).use(middleware.guest()) // 🛡️ Impede logados de acessarem

// Rota para renderizar a página (Backend)
router.get('/redefinir-senha', '#controllers/auth_controller.showRedefinirSenha')

// =======================================================
// 👤 PERFIL E CONTA (PROTEGIDAS)
// =======================================================
router.group(() => {
  router.get('/me', '#controllers/perfils_controller.show')
  router.put('/me', '#controllers/perfils_controller.update')
  router.put('/auth/change-password', '#controllers/auth_controller.changePassword')
}).use(middleware.auth())

// =======================================================
// 📦 RECURSOS BÁSICOS (ADMIN OU PROFISSIONAL)
// =======================================================
router.group(() => {
  router.resource('/funcao', '#controllers/funcoes_controller').except(['create', 'edit'])
  router.resource('/especializacao', '#controllers/especializacoes_controller').except(['create', 'edit'])
}).use([middleware.auth(), middleware.adminOnly()])

// =======================================================
// 🩺 PROFISSIONAIS
// =======================================================
router.resource('/profissionais', '#controllers/profissionais_controller')
      .except(['create', 'edit'])
      .middleware('*', middleware.auth())
      .middleware('store', middleware.adminOnly())

router.patch('/profissionais/:id/status', '#controllers/profissionais_controller.atualizarStatus')
      .middleware([middleware.auth(), middleware.adminOnly()])

// =======================================================
// 🏢 SALAS, RESERVAS E INVENTÁRIO
// =======================================================
router.resource('/sala', '#controllers/salas_controller').except(['create', 'edit']).use('*', middleware.auth())

// Reservas (Apenas Profissionais podem reservar salas)
router.resource('/reserva', '#controllers/reservas_controller').except(['create', 'edit']).use('*', middleware.auth())

// 🛠️ INVENTÁRIO (Liberado para Admin e Profissional)
router.group(() => {
  router.resource('/inventario', '#controllers/inventarios_controller').except(['create', 'edit'])
  router.resource('/mov_inventario', '#controllers/mov_inventarios_controller').except(['create', 'edit'])
}).use([middleware.auth(), middleware.adminOrProfissionalOnly()])

// =======================================================
// 🚑 ATENDIMENTOS E PRONTUÁRIOS
// =======================================================
router.group(() => {
    router.get('/atendimento', '#controllers/atendimentos_controller.index')
    router.get('/atendimento/:id', '#controllers/atendimentos_controller.show')
    
    router.post('/atendimento', '#controllers/atendimentos_controller.store').use(middleware.clienteOnly())
    
    router.patch('/atendimento/:id/aprovar', '#controllers/atendimentos_controller.aprovar')
    router.patch('/atendimento/:id/concluir', '#controllers/atendimentos_controller.concluir')
    
    // Prontuários (Apenas quem atende pode criar)
    router.post('/atendimentos/:id/prontuario', '#controllers/prontuarios_controller.store')
    router.get('/profissional/prontuarios', '#controllers/prontuarios_controller.index')
}).use(middleware.auth())

// =======================================================
// 💰 FINANCEIRO
// =======================================================
router.group(() => {
    router.get('/transacoes/saldo', '#controllers/transacoes_controller.contarSaldo')
    router.get('/transacao', '#controllers/transacoes_controller.index')
    router.post('/pagamento/processar', '#controllers/transacoes_controller.realizarPagamento')
    
    router.get('/minhas-financas', '#controllers/transacoes_controller.minhasDividas')
}).use(middleware.auth())

// =======================================================
// 🤝 ADMINISTRAÇÃO GERAL
// =======================================================
router.group(() => {
    router.resource('/parceria', '#controllers/parcerias_controller').except(['create', 'edit'])
    router.get('/user', '#controllers/users_controller.index')
    router.patch('/user/:id/admin', '#controllers/users_controller.criarAdmin')
}).use([middleware.auth(), middleware.adminOnly()])


// =======================================================
// 🕵️‍♂️ DEBUG (REMOVER EM PRODUÇÃO)
// =======================================================
router.get('/espiar-senha/:email', '#controllers/debug_controller.espiar').use(middleware.adminOnly())