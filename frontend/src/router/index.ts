import { createRouter, createWebHistory } from 'vue-router'

// ==========================================================
// 1. IMPORTS DAS VIEWS (SEUS + DA EQUIPE)
// ==========================================================

import HomeView from '../views/HomeView.vue'

// --- SEUS IMPORTS (HEAD) ---
import CadastroClienteView from '../views/CadastroClienteView.vue'
import CadastroProfissionalView from '../views/CadastroProfissionalView.vue'
import RedefinirSenhaView from '../views/RedefinirSenha.vue'
import EsqueciSenha from '../views/EsqueciSenha.vue'

import AdminDashboardView from '@/views/AdminDashboardView.vue'
import PerfilView from '@/views/PerfilView.vue'
import AprovacaoProfissional from '@/views/AprovacaoProfissional.vue'
import SolicitacaoReposicaoView from '@/views/SolicitacaoReposicaoView.vue'
import FinanceiroView from '@/views/FinanceiroView.vue'

// --- IMPORTS SPRINT 4 (ADMIN SALAS) ---
import SalasView from '@/views/SalasView.vue'
import AprovacaoReservasView from '@/views/AprovacaoReservasView.vue'

// Dashboards (Sua versão)
import ClientDashboardView from '@/views/ClientDashboardView.vue'
import ProfissionalDashboardView from '@/views/ProfissionalDashboardView.vue'

// --- IMPORTS DA EQUIPE (MAIN) ---
import AprovarAgendamentosView from '../views/AprovarAgendamentosView.vue'
import ReservaSalasView from '@/views/ReservaSalasView.vue'
import ControleEstoqueView from '@/views/ControleEstoqueView.vue'

// ==========================================================
// 2. CONFIGURAÇÃO DAS ROTAS
// ==========================================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    { path: '/login', redirect: '/' },

    // --- CADASTRO E RECUPERAÇÃO ---
    {
      path: '/cadastro/cliente',
      name: 'cadastro-cliente',
      component: CadastroClienteView
    },
    {
      path: '/cadastro/profissional',
      name: 'cadastro-profissional',
      component: CadastroProfissionalView
    },
    {
      path: '/redefinir-senha',
      name: 'redefinir-senha',
      component: RedefinirSenhaView
    },
    {
      path: '/esqueci-senha',
      name: 'esqueci-senha',
      component: EsqueciSenha
    },

    // --- ÁREA ADMIN (SUAS TAREFAS) ---
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboardView
    },
    {
      path: '/admin/aprovacoes',
      name: 'aprovacao-profissional',
      component: AprovacaoProfissional
    },
    {
      path: '/admin/salas',
      name: 'admin-salas',
      component: SalasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/reservas',
      name: 'admin-reservas',
      component: AprovacaoReservasView,
      meta: { requiresAuth: true }
    },

    // --- ÁREA COMUM ---
    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilView,
      meta: { requiresAuth: true }
    },

    // --- SEUS DASHBOARDS (Rota antiga) ---
    {
      path: '/dashboard/cliente',
      name: 'dashboard-cliente',
      component: ClientDashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/profissional',
      name: 'dashboard-profissional',
      component: ProfissionalDashboardView,
      meta: { requiresAuth: true }
    },
    {
       path: '/dashboard',
       redirect: '/dashboard/cliente'
    },

    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },

    // ==========================================================
    // ROTAS DA EQUIPE (VINDAS DA MAIN)
    // ==========================================================

    // Dashboards da Equipe (Note que eles usaram caminhos diferentes)
    {
      path: '/cliente/dashboard',
      name: 'dashboardCliente',
      component: () => import('../views/atendimento/dashboard/DashboardCliente.vue'),
    },
    {
      path: '/profissional/dashboard',
      name: 'dashboardProfissional',
      component: () => import('../views/atendimento/dashboard/DashboardProfissional.vue'),
    },

    // Agendamento e Histórico
    {
      path: '/cliente/agendar',
      name: 'agendarAtendimento',
      component: () => import('../views/atendimento/consulta/AgendarConsulta.vue'),
    },
    {
      path: '/cliente/historico',
      name: 'historicoAtendimento',
      component: () => import('../views/atendimento/atividadesCliente/HistoricoCliente.vue'),
    },
    {
      path: '/cliente/agenda',
      name: 'agendaCliente',
      component: () => import('../views/atendimento/atividadesCliente/AgendaCliente.vue'),
    },
    {
      path: '/profissional/agenda',
      name: 'agendaProfissional',
      component: () => import('../views/atendimento/agendaProfissional/AgendaProfissional.vue'),
    },
    {
      path: '/profissional/historico',
      name: 'historicoProfissional',
      component: () => import('../views/atendimento/agendaProfissional/HistoricoProfissional.vue'),
    },

    // Disponibilidade
    {
      path: '/profissional/cadastro/disponibilidade',
      name: 'cadastroDisponibilidadeProfissional',
      component: () => import('../views/atendimento/disponibilidade/CadastroDisponibilidade.vue'),
    },
    {
      path: '/profissional/disponibilidade',
      name: 'disponibilidadeProfissional',
      component: () => import('../views/atendimento/disponibilidade/ExibicaoDisponibilidade.vue'),
    },

    // Parcerias
    {
      path: '/cadastro/parceria',
      name: 'cadastroParceria',
      component: () => import('../views/atendimento/parceria/CadastroParceria.vue'),
    },
    {
      path: '/parcerias',
      name: 'listaParceria',
      component: () => import('../views/atendimento/parceria/ListaParceria.vue'),
    },

    // Admin Outros (Equipe)
    {
      path: '/admin/solicitacoes',
      name: 'admin-solicitacoes',
      component: AprovarAgendamentosView
    },
    {
      path: '/admin/estoque',
      name: 'admin-estoque',
      component: ControleEstoqueView
    },

    // Reservas (Visão Profissional da Equipe)
    {
      path: '/profissional/reservas',
      name: 'profissional-reservas',
      component: ReservaSalasView
    },

    // ==========================================================
    // SUAS ROTAS PROFISSIONAIS (MANTIDAS)
    // ==========================================================
    {
      path: '/profissional/solicitar-reposicao',
      name: 'solicitar-reposicao',
      component: SolicitacaoReposicaoView,
      meta: { requiresAuth: true }
    },

    {
      path: '/profissional/financeiro',
      name: 'financeiro-profissional',
      component: FinanceiroView,
      meta: { requiresAuth: true }
    },

    {
      path: '/profissional/pagamento-salas',
      name: 'pagamento-salas',
      component: () => import('@/views/profissional/PagamentoSalasView.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

export default router
