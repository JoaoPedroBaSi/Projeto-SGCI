<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
// Verifique se este caminho abaixo está correto para o seu Card
import CardMinhaConsulta from '@/components/cards/atendimento/consulta/CardMinhaConsulta.vue';
import CardBarraNavegacao from '@/components/barra/CardBarraNavegacao.vue';

// Interfaces para evitar erros de tipagem
interface Atendimento {
  id: number;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO';
  dataHoraInicio: string;
  nomeSala?: string;
  profissional?: { nome: string };
  observacoes?: string;
  forma_pagamento?: string;
}

const atendimentos = ref<Atendimento[]>([]);
const carregando = ref(true);
const statusFiltro = ref<'PENDENTE' | 'CONFIRMADO' | 'CANCELADO'>('PENDENTE');

const buscarAtendimentos = async () => {
  carregando.value = true;
  const token = localStorage.getItem('auth_token');
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  try {
    // Buscamos atendimentos e salas em paralelo
    const [atendimentoRes, salaRes] = await Promise.all([
      api.get(`/atendimento?cliente_id=${userData.id}`, config),
      api.get('/sala', config)
    ]);

    // Fazemos o mapeamento para injetar o nome da sala em cada atendimento
    atendimentos.value = atendimentoRes.data.map((atend: any) => {
      const sala = salaRes.data.find((s: any) => Number(s.id) === Number(atend.salaId));
      return {
        ...atend,
        nomeSala: sala ? sala.nome : 'Sala Indefinida'
      };
    });

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  } finally {
    carregando.value = false;
  }
};
const atendimentosFiltrados = computed(() => {
  return atendimentos.value.filter(a => a.status === statusFiltro.value);
});

onMounted(buscarAtendimentos);
</script>

<template>
  <CardBarraNavegacao/>
  <main class="page-container">
    <header class="header-pagina">
      <h1>Minhas consultas</h1>

      <div class="filtros-container">
        <button
          v-for="status in ['PENDENTE', 'CONFIRMADO', 'CANCELADO']"
          :key="status"
          :class="['btn-filtro', { ativo: statusFiltro === status }]"
          @click="statusFiltro = status as any"
        >
          {{ status }}
        </button>
      </div>
    </header>

    <div v-if="carregando" class="feedback">Carregando consultas...</div>

    <div v-else-if="atendimentosFiltrados.length > 0">
      <div class="grid-consultas">
        <CardMinhaConsulta
          v-for="atendimento in atendimentosFiltrados"
          :key="atendimento.id"
          :atendimento="atendimento"
          @atualizar="buscarAtendimentos"
        />
      </div>
    </div>

    <div v-else class="feedback">
      <p>Nenhuma consulta <strong>{{ statusFiltro.toLowerCase() }}</strong> encontrada.</p>
    </div>
  </main>
</template>

<style scoped>

  .page-container { padding: 20px; max-width: 1400px; margin: 0 auto; font-family: sans-serif; }
  .header-pagina { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
  h1 { color: #128093; margin: 0; }
  .filtros-container { display: flex; gap: 10px; background: #eee; padding: 5px; border-radius: 12px; }
  .btn-filtro { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; color: #666; background: transparent; transition: 0.3s; }
  .btn-filtro.ativo { background: #128093; color: white; }
  .grid-consultas {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    justify-content: center;
    padding: 20px 0;
  }
  .feedback { text-align: center; padding: 50px; color: #888; }
</style>
