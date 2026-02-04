<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue';
import { useRouter } from 'vue-router';
// Certifique-se que o caminho da imagem está correto no seu projeto
import logoSgci from '@/assets/logo-sgci.png';

import {
  Home,
  Calendar,
  HeartPulse,
  Coins,
  User,
  LogOut,
  ChevronDown,
  Building,
  Package,
  CalendarCheck,
  Clock,
  Briefcase,
  Handshake,
  ClipboardList,
  UserCheck
} from 'lucide-vue-next';

const router = useRouter();
const userName = ref('');
const userType = ref('');

const openMenus = ref<Record<string, boolean>>({});

interface MenuItem {
  label: string;
  icon?: any;
  route?: string;
  key?: string;
  children?: MenuItem[];
}

const menuItems = ref<MenuItem[]>([]);

const logout = () => {
  localStorage.clear();
  router.push('/');
};

const toggleMenu = (key?: string) => {
  if (!key) return;
  openMenus.value[key] = !openMenus.value[key];
};

onMounted(() => {
  try {
    const data = localStorage.getItem('user_data');
    if (data) {
      const user = JSON.parse(data);
      userName.value = user.fullName || user.nome || 'Usuário';

      const tipo = (user.perfil_tipo || user.perfilTipo || 'cliente').toLowerCase();
      userType.value = tipo;

      if (tipo === 'cliente') {
        menuItems.value = [
          { label: 'Início', icon: markRaw(Home), route: '/cliente/dashboard' },
          {
            label: 'Atendimentos', icon: markRaw(Calendar), key: 'atendimentos',
            children: [
              { label: 'Agendar', route: '/cliente/agendar' },
              { label: 'Minhas Consultas', route: '/cliente/agenda' }
            ]
          },
          {
            label: 'Saúde', icon: markRaw(HeartPulse), key: 'saude',
            children: [
              { label: 'Prontuário', route: '/cliente/historico' },
              { label: 'Inventário', route: '#inventario' },
              { label: 'Farmácias Parceiras', route: '/parcerias' }
            ]
          },
          {
            label: 'Finanças', icon: markRaw(Coins), key: 'financas',
            children: [
              { label: 'Pagamentos', route: '#pagamentos' }
            ]
          },
          {
            label: 'Conta', icon: markRaw(User), key: 'conta',
            children: [
              { label: 'Meu Perfil', route: '/perfil' }
            ]
          }
        ];
      }

      else if (tipo === 'profissional') {
        menuItems.value = [
          { label: 'Início', icon: markRaw(Home), route: '/profissional/dashboard' },
          {
            label: 'Atendimentos', icon: markRaw(Calendar), key: 'agenda_prof',
            children: [
              { label: 'Minha Agenda', route: '/profissional/agenda' },
              { label: 'Histórico', route: '/profissional/historico' },
              { label: 'Meus Pacientes', route: '#pacientes' }
            ]
          },
          {
            label: 'Prontuários', icon: markRaw(ClipboardList), key: 'pront_prof',
            children: [
              { label: 'Meus Prontuários', route: '/profissional/prontuarios' },
              { label: 'Registrar Relatório', route: '#relatorios' }
            ]
          },
          {
            label: 'Disponibilidade', icon: markRaw(Clock), key: 'disp_prof',
            children: [
              { label: 'Gerenciar Agenda', route: '/profissional/disponibilidade' }
            ]
          },
          {
            label: 'Salas e Recursos', icon: markRaw(Building), key: 'infra_prof',
            children: [
              { label: 'Reservar Sala', route: '/profissional/reservas' },
              { label: 'Minhas Reservas', route: '/profissional/reservas' },
              { label: 'Consultar Estoque', route: '/profissional/solicitar-reposicao' }
            ]
          },
          {
            label: 'Financeiro', icon: markRaw(Coins), key: 'fin_prof',
            children: [
              { label: 'Pagar Aluguel', route: '/profissional/pagamento-salas' },
              { label: 'Meu Extrato', route: '/profissional/financeiro' }
            ]
          },
          {
            label: 'Conta', icon: markRaw(User), key: 'conta_prof',
            children: [
              { label: 'Meu Perfil', route: '/perfil' }
            ]
          }
        ];
      }

      else if (tipo === 'admin') {
        menuItems.value = [
          { label: 'Início', icon: markRaw(Home), route: '/admin/dashboard' },
          {
            label: 'Gestão', icon: markRaw(Briefcase), key: 'gestao_admin',
            children: [
              { label: 'Novo Profissional', route: '/admin/cadastrar-profissional' },
              { label: 'Aprovar Profissionais', route: '/admin/aprovacoes' }
            ]
          },
          {
            label: 'Atendimentos', icon: markRaw(CalendarCheck), key: 'atend_admin',
            children: [
              { label: 'Aprovar Consultas', route: '/admin/solicitacoes' },
            ]
          },
          {
            label: 'Finanças', icon: markRaw(Coins), key: 'fin_admin',
            children: [
              { label: 'Transações', route: '#financeiro-admin' },
              { label: 'Tabela de Preços', route: '#tabela-precos' }
            ]
          },
          {
            label: 'Recursos', icon: markRaw(Package), key: 'recursos_admin',
            children: [
              { label: 'Salas', route: '/admin/salas' },
              { label: 'Inventário', route: '/admin/estoque' },
              { label: 'Aprovar Reservas', route: '/admin/reservas' }
            ]
          },
          {
            label: 'Parcerias', icon: markRaw(Handshake), key: 'parcerias_admin',
            children: [
              { label: 'Gestão de Parceiros', route: '/parcerias' },
              { label: 'Novo Parceiro', route: '/cadastro/parceria' }
            ]
          },
          {
            label: 'Conta', icon: markRaw(User), key: 'conta_admin',
            children: [
              { label: 'Meu Perfil', route: '/perfil' }
            ]
          }
        ];
      }
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    router.push('/');
  }
});
</script>

<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="logo">
        <img :src="logoSgci" alt="Logo SGCI" class="logo-img" />
        <h2 class="titulo">SGCI</h2>
      </div>

      <nav class="nav-content">
        <div v-for="(item, index) in menuItems" :key="index">

          <div v-if="item.children && item.children.length > 0" class="menu-group">
            <button @click="toggleMenu(item.key)" class="menu-item menu-button"
              :class="{ 'active-parent': openMenus[item.key!] }">
              <div class="left-content">
                <component :is="item.icon" class="icon-svg" />
                <span class="label-text">{{ item.label }}</span>
              </div>
              <ChevronDown class="arrow-icon" :class="{ 'rotated': openMenus[item.key!] }" :size="16" />
            </button>

            <div v-show="openMenus[item.key!]" class="submenu">
              <router-link v-for="child in item.children" :key="child.route" :to="child.route!" class="submenu-item"
                active-class="active-sub">
                {{ child.label }}
              </router-link>
            </div>
          </div>

          <router-link v-else :to="item.route!" class="menu-item" active-class="active">
            <div class="left-content">
              <component :is="item.icon" class="icon-svg" />
              <span class="label-text">{{ item.label }}</span>
            </div>
          </router-link>

        </div>

        <div v-if="userType === 'profissional'" class="patient-mode-section">
          <div class="divider-line"></div>
          <p class="section-label">MODO PESSOAL</p>
          <router-link to="/cliente/dashboard" class="menu-item patient-btn" active-class="active-patient">
            <div class="left-content">
              <UserCheck class="icon-svg" />
              <span class="label-text">Sou Paciente</span>
            </div>
          </router-link>
        </div>

      </nav>

      <button @click="logout" class="btn-logout">
        <LogOut class="icon-svg" /> <span>Sair</span>
      </button>
    </aside>

    <main class="content">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f8f9fa;
  font-family: 'Montserrat', sans-serif;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  min-width: 260px;
  background-color: #117a8b;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  z-index: 10;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.nav-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.nav-content::-webkit-scrollbar {
  width: 6px;
}

.nav-content::-webkit-scrollbar-track {
  background: transparent;
}

.nav-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
  flex-shrink: 0;
}

.logo-img {
  width: 80px;
  height: auto;
  display: block;
  margin: 0 auto 10px auto;
}

.titulo {
  color: white;
  font-weight: bold;
  font-size: 1.8rem;
  margin: 0;
  letter-spacing: 1px;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 15px;
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 5px;
  transition: all 0.3s ease;
  background: transparent;
  border: none;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  justify-content: flex-start;
  text-align: left;
}

.menu-item .label-text {
  color: #ffffff;
  font-weight: 500;
}

:deep(.icon-svg) {
  width: 20px;
  height: 20px;
  stroke: #ffffff;
  stroke-width: 2px;
  fill: none;
  transition: stroke 0.3s;
  flex-shrink: 0;
}

.left-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
}

.menu-item:hover,
.active,
.active-parent {
  background-color: rgba(255, 255, 255, 0.15);
  font-weight: 600;
}

.patient-mode-section {
  margin-top: 25px;
  padding-top: 10px;
}

.divider-line {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  margin-bottom: 15px;
  width: 100%;
}

.section-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 10px;
  padding-left: 10px;
}

.patient-btn {
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.patient-btn:hover {
  background-color: #2dd4bf;
  border-color: #2dd4bf;
}

.active-patient {
  background-color: #2dd4bf !important;
  color: #0f766e !important;
  font-weight: bold;
}

.active-patient :deep(.icon-svg) {
  stroke: #0f766e !important;
}

.active-patient .label-text {
  color: #0f766e !important;
}

.submenu {
  margin-left: 15px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  padding-left: 5px;
  margin-bottom: 8px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.submenu-item {
  display: block;
  padding: 8px 15px;
  color: #b2dfdb !important;
  text-decoration: none;
  font-size: 0.85rem;
  transition: 0.2s;
  border-radius: 4px;
  white-space: nowrap;
  margin-bottom: 2px;
}

.submenu-item:hover {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.1);
}

.active-sub {
  color: #ffffff !important;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.15);
}

:deep(.arrow-icon) {
  stroke: #ffffff;
  transition: transform 0.3s ease;
  opacity: 0.7;
  margin-left: auto;
}

.rotated {
  transform: rotate(180deg);
}

.btn-logout {
  margin-top: auto;
  flex-shrink: 0;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  font-weight: 500;
}

.btn-logout:hover {
  background-color: #ffffff;
  color: #117a8b !important;
  border-color: #ffffff;
}

.btn-logout:hover :deep(.icon-svg) {
  stroke: #117a8b;
}

.content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  height: 100%;
  position: relative;
  min-width: 0;
}
</style>
