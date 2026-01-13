<script setup lang="ts">
  import CardDisponibilidade from '@/components/cards/atendimento/disponibilidade/CardDisponibilidade.vue';
  //import { Settings } from 'lucide-vue-next';
  const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
</script>

<template>
  <header>
    <div class="voltar">
      <div>
        <RouterLink class="botao-voltar" to="/profissional/dashboard">
              <Settings :size="18" color="white" class="icon-gear" />
              < Dashboard
        </RouterLink>
      </div>
      <h2>Configurar horários de atendimento</h2>
    </div>
    <div class="infos-perfil">
        <div class="foto">
          <img src="https://cdn-icons-png.flaticon.com/512/12225/12225881.png" alt="Perfil">
        </div>
        <div class="texto">
          <p class="nome">{{ usuarioLogado.nome || 'Usuário' }}</p>
          <p class="email">{{ usuarioLogado.email || 'E-mail não informado' }}</p>
        </div>
      </div>
  </header>

  <main class="corpo">
    <section class="card-disponibilidade">
      <CardDisponibilidade/>
    </section>
  </main>

</template>

<style lang="css" scoped>
  header{
    padding: 20px 50px;
    background-color: white;
    display: flex;
    justify-content: space-between;
  }
  .voltar{
    display: flex;
    flex-direction: row;
  }
  .voltar div{
    display: flex;
    align-items: center;
  }
  .botao-voltar {
    height: 15px;
    margin-right: 10px;
    text-decoration: none;
    padding: 6px 12px;
    border: 1px solid #a0a0a0;
    color: #a0a0a0;
    border-radius: 5px;
    font-size: 14px;
    transition: all 0.2s;
  }
  .botao-voltar:hover {
    border-color: #128093;
    background-color: white;
    color: #128093;
  }
  .infos-perfil {
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 1px solid #eee;
    padding-left: 20px;
  }
  .infos-perfil img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
  }
  .texto{
    gap: 2px;
  }
  .texto p {
    margin: 0;
    line-height: 1.2;
  }
  .texto .email {
    color: #666;
    font-size: 0.85rem;
  }
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
