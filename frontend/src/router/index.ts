import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AprovarAgendamentosView from '../views/AprovarAgendamentosView.vue'
import ReservaSalasView from '@/views/ReservaSalasView.vue'
import ControleEstoqueView from '@/views/ControleEstoqueView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
    },
  ],
})

export default router
