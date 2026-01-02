<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

// Estado para controlar qual menu está aberto
const menuAberto = ref<string | null>(null);

function alternarMenu(nomeMenu: string) {
  if (menuAberto.value === nomeMenu) {
    menuAberto.value = null;
  } else {
    menuAberto.value = nomeMenu;
  }
}
</script>

<template>
  <aside class="sidebar">
    <div class="logo-area">
      <img src="@/assets/logo-sgci.png" alt="SGCI Logo" class="logo-img" />
      <h1 class="logo-text">SGCI</h1>
    </div>

    <nav class="menu">

      <RouterLink to="/" class="menu-item link-direto">
        <div class="flex-row">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Início</span>
        </div>
      </RouterLink>

      <div class="menu-group">
        <button class="menu-item btn-toggle" @click="alternarMenu('gestao')">
          <div class="flex-row">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Gestão</span>
          </div>
          <span class="chevron" :class="{ 'rotacionado': menuAberto === 'gestao' }">▼</span>
        </button>
        <div class="submenu" v-if="menuAberto === 'gestao'">
          <RouterLink to="/usuarios" class="submenu-item">Gerenciar Usuários</RouterLink>
        </div>
      </div>

      <div class="menu-group">
        <button class="menu-item btn-toggle" @click="alternarMenu('atendimentos')">
          <div class="flex-row">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Atendimentos</span>
          </div>
          <span class="chevron" :class="{ 'rotacionado': menuAberto === 'atendimentos' }">▼</span>
        </button>
        <div class="submenu" v-if="menuAberto === 'atendimentos'">
          <RouterLink to="/admin/solicitacoes" class="submenu-item">Aprovar Consultas</RouterLink>
        </div>
      </div>

      <div class="menu-group">
        <button class="menu-item btn-toggle" @click="alternarMenu('financas')">
          <div class="flex-row">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            <span>Finanças</span>
          </div>
          <span class="chevron" :class="{ 'rotacionado': menuAberto === 'financas' }">▼</span>
        </button>
        <div class="submenu" v-if="menuAberto === 'financas'">
          <RouterLink to="/transacoes" class="submenu-item">Transações</RouterLink>
          <RouterLink to="/tabela-precos" class="submenu-item">Tabela de Preços</RouterLink>
        </div>
      </div>

      <div class="menu-group">
        <button class="menu-item btn-toggle" @click="alternarMenu('recursos')">
          <div class="flex-row">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Recursos</span>
          </div>
          <span class="chevron" :class="{ 'rotacionado': menuAberto === 'recursos' }">▼</span>
        </button>
        <div class="submenu" v-if="menuAberto === 'recursos'">
          <RouterLink to="/salas" class="submenu-item">Salas</RouterLink>
          <RouterLink to="/inventario" class="submenu-item">Inventário</RouterLink>
          <RouterLink to="/admin/reservas" class="submenu-item">Aprovar Reservas</RouterLink>
        </div>
      </div>

      <div class="menu-group">
        <button class="menu-item btn-toggle" @click="alternarMenu('parcerias')">
          <div class="flex-row">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4 8 4v14" />
              <path d="M13 21v-8h-2v8" />
            </svg>
            <span>Parcerias</span>
          </div>
          <span class="chevron" :class="{ 'rotacionado': menuAberto === 'parcerias' }">▼</span>
        </button>
        <div class="submenu" v-if="menuAberto === 'parcerias'">
          <RouterLink to="/farmacias" class="submenu-item">Gestão de Farmácias</RouterLink>
        </div>
      </div>

      <div class="menu-group">
        <button class="menu-item btn-toggle" @click="alternarMenu('conta')">
          <div class="flex-row">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Conta</span>
          </div>
          <span class="chevron" :class="{ 'rotacionado': menuAberto === 'conta' }">▼</span>
        </button>
        <div class="submenu" v-if="menuAberto === 'conta'">
          <RouterLink to="/perfil" class="submenu-item">Meu Perfil</RouterLink>
        </div>
      </div>

    </nav>

    <div class="footer">
      <button class="btn-sair">
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sair
      </button>
    </div>
  </aside>
</template>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

/* CONFIGURAÇÃO GERAL */
.sidebar {
  width: 260px;
  height: 100vh;
  background-color: #1C8E9D;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Montserrat', sans-serif;
  box-shadow: 4px 0 10px rgba(0,0,0,0.1);
  z-index: 999;
  scrollbar-gutter: stable;
  
  /* Estilização da Scrollbar - Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

/* --- Estilização da Scrollbar - Chrome, Edge, Safari) --- */

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.6);
}

.logo-area {
  padding: 30px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.logo-img {
  width: 60px;
  height: auto;
}

.logo-text {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 1px;
  margin: 0;
  color: white;
}

/* MENU DE NAVEGAÇÃO */
.menu {
  flex: 1;
  padding: 0 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 15px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 1.05rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background-color: rgba(255,255,255,0.15);
}

/* ÍCONES SVG */
.flex-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-svg {
  width: 24px;
  height: 24px;
  min-width: 24px;
}

.chevron {
  font-size: 0.7rem;
  transition: transform 0.3s;
  opacity: 0.8;
}
.chevron.rotacionado {
  transform: rotate(180deg);
}

/* SUBMENU */
.submenu {
  margin-top: 2px;
  padding-bottom: 5px;
}

.submenu-item {
  display: block;
  padding: 10px 10px 10px 51px;
  color: #e6e6e6;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.submenu-item:hover {
  color: white;
  font-weight: 600;
}

.submenu-item:last-child {
  border-bottom: none;
}

/* RODAPÉ (SAIR) */
.footer {
  padding: 0;
  margin-top: 20px;
}

.btn-sair {
  width: 100%;
  padding: 20px;
  background-color: transparent;
  color: white;
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background 0.3s;
}

.btn-sair:hover {
  background-color: rgba(0,0,0,0.1);
}
</style>

