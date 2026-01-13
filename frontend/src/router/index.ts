import { createRouter, createWebHistory } from 'vue-router'

// 1. IMPORTS DAS VIEWS (TELAS)
import HomeView from '../views/HomeView.vue'
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
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
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