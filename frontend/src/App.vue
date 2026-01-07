<script setup lang="ts">
import type { RouterLink, RouterView } from 'vue-router';
</script>

<!--TELA DO PROFISSIONAL-->

<template>
  <RouterView></RouterView>
  <!--<RouterLink to="/">Inicio</RouterLink>
  <RouterLink to="/cliente/dashboard">Dashboard(Cliente)</RouterLink>
  <RouterLink to="/profissional/dashboard">Dashboard(Profissional)</RouterLink>
  <RouterLink to="/cliente/agendar">Consultas</RouterLink>
  <RouterLink to="/profissional/agenda">Agenda</RouterLink>
  <RouterLink to="/cadastro/parceria">Parceria</RouterLink>-->

</template>

<style lang="css" scoped>

*, html {
  color: rgb(74, 74, 74);
  font-family: 'Montserrat', sans-serif;
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
.infos-usuario {
  margin: 10px;
  display: flex;
}
.infos-usuario .credenciais {
  margin-top: 14px;
}
.infos-usuario .credenciais p {
  margin: 0 10px;
  padding-bottom: 1px;
}
.infos-usuario .credenciais .nome {
  font-weight: bold;
}
main {
  margin: 50px 30px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

h1{
  color: #128093;
}


@media screen and (min-width: 700px) and (max-width: 1200px) {
    main {
        grid-template-columns: repeat(2, 1fr);
    }
}
@media screen and (max-width: 700px) {
    header {
      flex-direction: column-reverse;
      align-items: center;
    }
    main {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>
