<script setup lang="ts">
  import { computed } from 'vue';
import CardInfosLogin from '../cards/atendimento/login/CardInfosLogin.vue';
  const rotaVoltar = computed(() => {
  const userDataRaw = localStorage.getItem('user_data');
  if (!userDataRaw) return '/login';

  try {
    const userData = JSON.parse(userDataRaw);
    // Verifica se é profissional ou cliente (ajuste conforme os nomes no seu banco)
    const perfil = userData.perfil_tipo || userData.user?.perfil_tipo;

    if (perfil === 'profissional') {
      return '/profissional/dashboard';
    }

    return '/cliente/dashboard';
  } catch (e) {
    return '/cliente/dashboard'; // Fallback padrão
  }
});
</script>

<template>
  <header class="cabecalho">
    <div class="acoes">
      <RouterLink class="consulta" :to="rotaVoltar"> < Voltar </RouterLink>
    </div>
    <CardInfosLogin/>
  </header>
</template>

<style lang="css" scoped>
  .cabecalho {
    padding: 0 50px;
    display: flex;
    justify-content: space-between;
    height: 150px;
    align-items: center;
    background-color: white;
  }
  .acoes a {
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    border-radius: 8px;
  }
  .consulta {
    border: 2px solid #128093; color: #128093;
  }
  /*
  .historico-link {
    border: 2px solid blue; color: blue;
  }*/
</style>
