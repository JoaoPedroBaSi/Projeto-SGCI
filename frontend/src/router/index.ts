import { createRouter, createWebHistory } from 'vue-router'

// 1. IMPORTS DAS VIEWS (TELAS)
import HomeView from '../views/HomeView.vue'
<<<<<<< HEAD
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

// 2. Dashboard do Cliente
import ClientDashboardView from '@/views/ClientDashboardView.vue'

// Dashboard Profissional
import ProfissionalDashboardView from '@/views/ProfissionalDashboardView.vue'
=======
import AprovarAgendamentosView from '../views/AprovarAgendamentosView.vue'
import ReservaSalasView from '@/views/ReservaSalasView.vue'
import ControleEstoqueView from '@/views/ControleEstoqueView.vue'
>>>>>>> main

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    
    { path: '/login', redirect: '/' },

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

    // --- ÁREA ADMIN ---
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

    // --- DASHBOARDS ---
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
<<<<<<< HEAD
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
=======
      path: '/cliente/dashboard',
      name: 'dashboardCliente',
      component: () => import('../views/atendimento/dashboard/DashboardCliente.vue'),
    },
    {
      path: '/profissional/dashboard',
      name: 'dashboardProfissional',
      component: () => import('../views/atendimento/dashboard/DashboardProfissional.vue'),
    },
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
      path: '/profissional/cadastro/disponibilidade',
      name: 'cadastroDisponibilidadeProfissional',
      component: () => import('../views/atendimento/disponibilidade/CadastroDisponibilidade.vue'),
    },
    {
      path: '/profissional/disponibilidade',
      name: 'disponibilidadeProfissional',
      component: () => import('../views/atendimento/disponibilidade/ExibicaoDisponibilidade.vue'),
    },
    {
      path: '/profissional/historico',
      name: 'historicoProfissional',
      component: () => import('../views/atendimento/agendaProfissional/HistoricoProfissional.vue'),
    },
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
    {
      path: '/profissional/reservas',
      name: 'profissional-reservas',
      component: ReservaSalasView
>>>>>>> main
    },

    // --- ÁREA PROFISSIONAL ---
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

    // ✅✅✅ ROTA CORRIGIDA ✅✅✅
    {
      path: '/profissional/pagamento-salas',
      name: 'pagamento-salas',
      // IMPORTANTE: O arquivo DEVE estar na pasta src/views/profissional/
      component: () => import('@/views/profissional/PagamentoSalasView.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

export default router