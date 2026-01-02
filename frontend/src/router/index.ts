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
      meta: { esconderSidebar: true }
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
