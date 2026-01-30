<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api' // Ajuste o caminho do seu axios
import CardAprovacao from '@/components/cards/atendimento/consulta/CardAprovacao.vue'
import CardBarraNavegacao from '@/components/barra/CardBarraNavegacao.vue'

const atendimentosPendentes = ref([])
const isLoading = ref(true)

const carregarPendentes = async () => {
  const token = localStorage.getItem('auth_token')
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`

  try {
    isLoading.value = true
    const response = await api.get('/atendimento?status=PENDENTE')
    atendimentosPendentes.value = response.data
  } catch (err) {
    console.error("Erro ao carregar pendentes", err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  carregarPendentes()
})
</script>
<template>
  <CardBarraNavegacao/>
  <main class="page-container">
    <h1>Gerenciar Agendamentos</h1>

    <section v-if="!isLoading && atendimentosPendentes.length > 0" class="container-aprovacoes">
      <h2>Solicitações pendentes</h2>

      <div class="grid-atendimentos">
        <CardAprovacao
          v-for="item in atendimentosPendentes"
          :key="item.id"
          :atendimento="item"
          @atualizar="carregarPendentes"
        />
      </div>
    </section>

    <div v-else-if="isLoading" class="loading-state">
      <p>Carregando solicitações...</p>
    </div>

    <div v-else class="empty-state">
      <p>Não há solicitações pendentes no momento.</p>
    </div>
  </main>
</template>

<style scoped>
  .page-container {
    padding: 30px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    color: #128093;
    font-size: 1.8rem;
    margin-bottom: 40px; /* Espaço maior para o primeiro título */
    font-weight: 700;
  }

  h2 {
    color: #444; /* Cor levemente mais suave que o h1 para hierarquia */
    font-size: 1.2rem;
    margin-bottom: 25px;
    padding-left: 5px;
    border-left: 4px solid #128093; /* Detalhe lateral para elegância */
  }

  .grid-atendimentos {
    display: grid;
    gap: 25px;
    /* Grid inteligente: se ajusta sozinho entre 1, 2 ou 3 colunas */
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    align-items: start;
  }

  .loading-state, .empty-state {
    text-align: center;
    padding: 50px;
    color: #888;
    font-style: italic;
  }

  /* Ajuste para telas pequenas */
  @media (max-width: 768px) {
    h1 { font-size: 1.5rem; }
    .grid-atendimentos {
      grid-template-columns: 1fr;
    }
  }
</style>


