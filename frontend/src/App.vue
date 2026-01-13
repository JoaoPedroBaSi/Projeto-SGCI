<script setup lang="ts">
<<<<<<< HEAD
import { RouterView } from 'vue-router'
=======
import type { RouterLink, RouterView, useRoute } from 'vue-router';
import { computed } from 'vue';
>>>>>>> main
</script>

<!--TELA DO PROFISSIONAL-->

<template>
<<<<<<< HEAD
  <RouterView />
</template>

<style>
/* Reset básico para tirar margens brancas do navegador */
body { margin: 0; padding: 0; box-sizing: border-box; }
</style>
=======
<!-- 
  <RouterLink to="/">Inicio</RouterLink>
  <RouterLink to="/cliente/dashboard">Dashboard(Cliente)</RouterLink>
  <RouterLink to="/profissional/dashboard">Dashboard(Profissional)</RouterLink>
  <RouterLink to="/cliente/agendar">Consultas</RouterLink>
  <RouterLink to="/profissional/agenda">Agenda</RouterLink>
  <RouterLink to="/cadastro/parceria">Parceria</RouterLink> -->
  <main>
    <RouterView></RouterView>
  </main>
</template>

<style lang="css" scoped>

*, html {
  color: rgb(74, 74, 74);
  font-family: 'Montserrat', sans-serif;
}
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
  background-color: #f4f6f8;
}
header {
  margin: 30px;
  display: flex;
  justify-content: space-between;
}
img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    margin: auto;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

html {
  scroll-behavior: smooth;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
>>>>>>> main
