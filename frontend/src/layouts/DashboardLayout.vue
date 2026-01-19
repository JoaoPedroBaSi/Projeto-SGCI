<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue';
import { useRouter } from 'vue-router';
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
  ClipboardList
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

const toggleMenu = (key: string) => {
  if (openMenus.value[key]) {
    openMenus.value[key] = false;
  } else {
    openMenus.value[key] = true;
  }
};

onMounted(() => {
  const data = localStorage.getItem('user_data');
  if (data) {
    const user = JSON.parse(data);
    userName.value = user.fullName || user.nome || 'Usuário';
    const tipo = (user.perfil_tipo || user.perfilTipo || 'cliente').toLowerCase();
    userType.value = tipo;

    // ==========================================================
    // 1. MENU DO CLIENTE
    // ==========================================================
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

    // ==========================================================
    // 2. MENU DO PROFISSIONAL
    // ==========================================================
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
            { label: 'Meus Prontuários', route: '#prontuarios' }, // Adicionar rota correta
            { label: 'Registrar Relatório', route: '#relatórios' } // Adicionar rota correta
          ]
        },
        {
          label: 'Disponibilidade', icon: markRaw(Clock), key: 'disp_prof',
          children: [
            { label: 'Meus Horários', route: '/profissional/disponibilidade' },
            { label: 'Cadastrar', route: '/profissional/cadastro/disponibilidade' }
          ]
        },
        {
          label: 'Salas e Recursos', icon: markRaw(Building), key: 'infra_prof',
          children: [

            { label: 'Reservar Sala', route: '/profissional/pagamento-salas' },
            { label: 'Minhas Reservas', route: '/profissional/reservas' },
            { label: 'Consultar Estoque', route: '/profissional/solicitar-reposicao' }
          ]
        },
        {
          label: 'Financeiro', icon: markRaw(Coins), key: 'fin_prof',
          children: [
            { label: 'Pagar Aluguel', route: '#aluguel'}, // Adicionar rota correta
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

    // ==========================================================
    // 3. MENU DO ADMIN (ATUALIZADO - 7 GRUPOS DO FIGMA)
    // ==========================================================
    else if (tipo === 'admin') {
      menuItems.value = [
        { label: 'Início', icon: markRaw(Home), route: '/admin/dashboard' },

        {
          label: 'Gestão', icon: markRaw(Briefcase), key: 'gestao_admin',
          children: [
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
            { label: 'Transações', route: '#financeiro-admin' }, // Adicionar rota correta
            { label: 'Tabela de Preços', route: '#tabela-precos' } // Adicionar rota correta
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
});
</script>

<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="logo">
        <img :src="logoSgci" alt="Logo SGCI" class="logo-img" />
        <h2 class="titulo">SGCI</h2>
      </div>

      <nav>
        <div v-for="(item, index) in menuItems" :key="index">

          <div v-if="item.children" class="menu-group">
            <button @click="toggleMenu(item.key!)" class="menu-item menu-button"
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
      </nav>

      <button @click="logout" class="btn-logout">
        <LogOut class="icon-svg" /> Sair
      </button>
    </aside>

    <main class="content">
      <header class="top-header">
        <h2>Olá, {{ userName }}!</h2>
        <span class="badge">{{ userType.toUpperCase() }}</span>
      </header>

      <hr class="divider">

      <slot></slot>

    </main>
  </div>
</template>

<style scoped>
/* =========================================
   RESET E ESTRUTURA
   ========================================= */
* {
  box-sizing: border-box;
}

.dashboard-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f0f9ff;
  font-family: 'Montserrat', sans-serif;
  overflow: hidden;
}

/* =========================================
   SIDEBAR (MENU LATERAL)
   ========================================= */
.sidebar {
  width: 260px;
  min-width: 260px;
  background-color: #117a8b;
  /* Teal */
  color: white;
  display: flex;
  flex-direction: column;
  padding: 30px 20px;

  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar::-webkit-scrollbar {
  display: none;
}

.logo {
  text-align: center;
  margin-bottom: 40px;
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
  font-size: 2rem;
  margin: 0;
}

/* =========================================
   ITENS DO MENU
   ========================================= */
.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 15px;
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 5px;
  transition: 0.3s;
  background: transparent;
  border: none;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  justify-content: flex-start;
}

.menu-item .label-text {
  color: #ffffff !important;
}

:deep(.icon-svg) {
  width: 20px;
  height: 20px;
  stroke: #ffffff !important;
  stroke-width: 2px;
  fill: none !important;
  transition: stroke 0.3s;
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
  font-weight: bold;
}

/* =========================================
   SUBMENU
   ========================================= */
.submenu {
  margin-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  padding-left: 5px;
  margin-bottom: 10px;
  width: 100%;
}

.submenu-item {
  display: block;
  padding: 8px 15px;
  color: #b2dfdb !important;
  text-decoration: none;
  font-size: 0.9rem;
  transition: 0.2s;
  border-radius: 4px;
  white-space: nowrap;
}

.submenu-item:hover {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.05);
}

.active-sub {
  color: #ffffff !important;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.1);
}

/* =========================================
   SETA (CHEVRON)
   ========================================= */
:deep(.arrow-icon) {
  stroke: #ffffff !important;
  transition: transform 0.3s;
  opacity: 0.8;
  margin-left: auto;
}

.rotated {
  transform: rotate(180deg);
}

/* =========================================
   BOTÃO SAIR
   ========================================= */
.btn-logout {
  margin-top: auto;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #ffffff !important;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.btn-logout:hover {
  background-color: #ffffff;
  color: #117a8b !important;
}

.btn-logout:hover :deep(.icon-svg) {
  stroke: #117a8b !important;
}

/* =========================================
   CONTEÚDO PRINCIPAL
   ========================================= */
.content {
  flex: 1;
  padding: 40px 60px;
  overflow-y: auto;
  height: 100%;
}

.top-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.top-header h2 {
  color: #117a8b;
  font-size: 1.8rem;
  margin: 0;
}

.badge {
  background-color: #2dd4bf;
  color: #0f766e;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.divider {
  border: 0;
  border-top: 1px solid #e2e8f0;
  margin-bottom: 30px;
}
</style>
