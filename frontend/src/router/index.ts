import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AutenticacaoView from '@/views/AutenticacaoView.vue'

import CadastroClienteView from '../views/CadastroClienteView.vue'
// REMOVIDO: Importação da tela antiga de cadastro de profissional

import RedefinirSenhaView from '../views/RedefinirSenha.vue'
import EsqueciSenha from '../views/EsqueciSenha.vue'

import AdminDashboardView from '@/views/AdminDashboardView.vue'
import PerfilView from '@/views/PerfilView.vue'
import AprovacaoProfissional from '@/views/AprovacaoProfissional.vue'
import SolicitacaoReposicaoView from '@/views/SolicitacaoReposicaoView.vue'
import FinanceiroView from '@/views/FinanceiroView.vue'

import SalasView from '@/views/SalasView.vue'
import AprovacaoReservasView from '@/views/AprovacaoReservasView.vue'

import DashboardClienteView from '@/views/atendimento/dashboard/DashboardCliente.vue'
import DashboardProfissionalView from '@/views/atendimento/dashboard/DashboardProfissional.vue'

import ProntuarioView from '@/views/prontuario/ProntuarioView.vue'
import DetalheProntuarioView from '@/views/prontuario/DetalheProntuarioView.vue'

import AprovarAgendamentosView from '../views/AprovarAgendamentosView.vue'
import ReservaSalasView from '@/views/ReservaSalasView.vue'
import ControleEstoqueView from '@/views/ControleEstoqueView.vue'

// CONFIGURAÇÃO DAS ROTAS

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/autenticacao',
      name: 'autenticacao',
      component: AutenticacaoView
    },
    { path: '/login', redirect: '/' },
    {
      path: '/cadastro/cliente',
      name: 'cadastro-cliente',
      component: CadastroClienteView
    },
    // REMOVIDO: Rota pública de cadastro de profissional (Agora é só pelo Admin)
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

    // --- ROTAS DO ADMINISTRADOR ---
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
      path: '/admin/cadastrar-profissional',
      name: 'admin-cadastrar-profissional',
      // Importação dinâmica: O arquivo TEM que existir na pasta views/admin/
      component: () => import('../views/admin/CadastroProfissionalView.vue'),
      meta: { requiresAuth: true }
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
    // -----------------------------

    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilView,
      meta: { requiresAuth: true }
    },
    {
      path: '/consulta/aprovacao',
      name: 'aprovacaoConsulta',
      component: () => import('../views/atendimento/consulta/AprovarConsulta.vue'),
    },
    {
      path: '/dashboard/cliente',
      name: 'dashboard-cliente',
      component: DashboardClienteView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/profissional',
      name: 'dashboard-profissional',
      component: DashboardProfissionalView,
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
      path: '/profissional/reservas',
      name: 'profissional-reservas',
      component: ReservaSalasView
    },
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
    },
    {
      path: '/profissional/prontuarios',
      name: 'prontuarios',
      component: ProntuarioView,
      meta: { requiresAuth: true }
    },

    {
      path: '/profissional/prontuarios/:id', // :id significa que é dinâmico
      name: 'detalhe-prontuario',
      component: DetalheProntuarioView,
      meta: { requiresAuth: true }
    },
  ],
})

export default router