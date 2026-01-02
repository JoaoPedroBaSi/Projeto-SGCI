<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import SidebarLateral from '@/components/SidebarLateral.vue'
import { computed } from 'vue';

// função para esconder sidebar dependendo da rota
const route = useRoute();
const deveMostrarSidebar = computed(() => {
  return route.meta.esconderSidebar !== true;
});
</script>

<template>
  <div class="layout-app">

    <SidebarLateral v-if="deveMostrarSidebar" />

    <main class="conteudo-principal" :class="{ 'full-width': !deveMostrarSidebar }">
      <RouterView />
    </main>

  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
  background-color: #f4f6f8;
}

.layout-app {
  display: flex;
  min-height: 100vh;
}

.conteudo-principal {
  margin-left: 260px;
  width: calc(100% - 260px);
  min-height: 100vh;
  transition: all 0.3s ease;
}

.conteudo-principal.full-width {
  margin-left: 0;
  width: 100%;
  padding: 0;
  max-width: 100vw;
  overflow-x: hidden;
}

html {
  scroll-behavior: smooth;
}
</style>
