<script lang="ts" setup>
  import CardCadastroParceria from '@/components/cards/atendimento/parceria/CardCadastroParceria.vue';
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h3>Gestão de Parcerias</h3>
      <div class="opcoes">
        <RouterLink to="/cadastro/parceria" class="botao-opcao">Cadastrar parceria</RouterLink>
        <RouterLink to="/parcerias" class="botao-opcao">Lista de parcerias</RouterLink>
      </div>
    </header>

    <main class="content">
      <section class="section-card">
        <CardCadastroParceria />
      </section>
    </main>
  </div>
</template>

<style scoped>
  h3{
    padding-bottom: 10px;
  }
  .botao-opcao {
    margin-right: 10px;
    text-decoration: none;
    padding: 6px 12px;
    border: 1px solid #a0a0a0;
    color: #a0a0a0;
    border-radius: 5px;
    font-size: 14px;
    transition: all 0.2s;
  }
  .botao-opcao:hover {
    cursor: pointer;
    border-color: #128093;
    background-color: rgb(217, 255, 242);
    color: #128093;
  }
  .page-container {
    background-color: #e0e0e0; /* Cinza de fundo que você usou na Agenda */
    min-height: 100vh;
  }

  .page-header {
    background: white;
    padding: 50px;
    margin-bottom: 30px;
  }

  .page-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
  }

  .section-card {
    display: flex;
    justify-content: center;
    padding: 0 20px 40px;
  }
</style>
