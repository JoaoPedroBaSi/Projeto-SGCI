<script lang="ts" setup>
import CardMinhaConsulta from '@/components/cards/atendimento/consulta/CardMinhaConsulta.vue';
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import type { Atendimento } from '@/types';
import CardPagamentoAtendimento from '@/components/cards/atendimento/pagamento/CardPagamentoAtendimento.vue';
import CardBarraNavegacao from '@/components/barra/CardBarraNavegacao.vue';

const atendimentos = ref<Atendimento[]>([]);
const carregando = ref(true);

const buscarAtendimentos = async () => {
  carregando.value = true; // Ativa o loading ao atualizar
  const token = localStorage.getItem('auth_token');
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const clienteId = userData.id;

  try {
    const response = await api.get(`/atendimento?cliente_id=${clienteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    atendimentos.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error);
  } finally {
    carregando.value = false;
  }
};

const atendimentosAtivos = computed(() => {
  return atendimentos.value.filter(a => a.status === 'CONCLUIDO');
});

onMounted(buscarAtendimentos);
</script>

<template>
  <CardBarraNavegacao/>
  <main>
    <h1>Pagamentos pendentes</h1>
    <div v-if="carregando">Carregando consultas...</div>

    <div v-else-if="atendimentosAtivos.length > 0">
    </div>

    <div v-else>
      <p>Você ainda não possui consultas concluídas.</p>
    </div>
    <CardPagamentoAtendimento v-for="atendimento in atendimentosAtivos" :key="atendimento.id" :atendimento="atendimento"/>
  </main>
</template>

<style lang="css" scoped>
  h1{
    color: #128093;
  }
  main{
    padding: 20px;
  }
</style>
