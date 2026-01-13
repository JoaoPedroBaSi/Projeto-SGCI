<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* Reset e Estilos Globais Unificados */
body { 
  margin: 0; 
  padding: 0; 
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif; /* Trazido da Main */
  background-color: #f4f6f8; /* Trazido da Main */
}

/* Garante que tudo use a fonte correta */
*, html {
  font-family: 'Montserrat', sans-serif;
  color: rgb(74, 74, 74);
}

html {
  scroll-behavior: smooth;
}
</style>