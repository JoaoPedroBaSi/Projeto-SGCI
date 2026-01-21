<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api' // Ajuste o caminho do seu axios
import CardAprovacao from '@/components/cards/atendimento/consulta/CardAprovacao.vue'

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
  <main>
    <h1>Gerenciar Agendamentos</h1>

    <section class="container-aprovacoes">
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
  </main>
</template>

<style scoped>
  main {
    padding: 20px;
  }

  .container-aprovacoes {
    max-width: 1200px;
    margin: 0 auto;
  }

  .grid-atendimentos {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr;
    justify-items: center;
  }

  @media (min-width: 1024px) {
    .grid-atendimentos {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    .grid-atendimentos {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  h1, h2 {
    color: #128093;
    text-align: center;
    margin-bottom: 20px;
  }
</style>


