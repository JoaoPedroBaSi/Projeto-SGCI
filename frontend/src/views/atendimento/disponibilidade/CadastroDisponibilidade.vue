<script setup lang="ts">
  import CardBarraNavegacao from '@/components/barra/CardBarraNavegacao.vue';
import CardDisponibilidade from '@/components/cards/atendimento/disponibilidade/CardDisponibilidade.vue';
  const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
</script>

<template>
  <CardBarraNavegacao/>

  <main class="corpo">
    <section class="card-disponibilidade">
      <CardDisponibilidade/>
    </section>
  </main>

</template>

<style lang="css" scoped>
  main{
    display: flex;
    justify-content: center;
    background-color: #e0e0e0;
    padding: 40px 20px;
    min-height: calc(100vh - 150px);
  }
  .card-disponibilidade{
    width: 80%;
  }
</style>
