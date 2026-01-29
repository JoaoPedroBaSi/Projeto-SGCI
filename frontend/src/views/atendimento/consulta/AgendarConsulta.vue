<script setup lang="ts">
import CardBarraNavegacao from '@/components/barra/CardBarraNavegacao.vue';
import CardNovoAtendimento from '@/components/cards/atendimento/consulta/CardNovoAtendimento.vue';
import CardInfosLogin from '@/components/cards/atendimento/login/CardInfosLogin.vue';
import api from '@/services/api';
import type { Profissional } from '@/types';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const profissionais = ref<Profissional[]>([]);
const mapeamentoFuncoes = ref<Record<number, string>>({});

const carregarDados = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  try {
    const [resProfissionais, resFuncoes] = await Promise.all([
      api.get<Profissional[]>('/profissionais'),
      api.get<any[]>('/funcao')
    ]);

    profissionais.value = resProfissionais.data;
    resFuncoes.data.forEach(f => {
      mapeamentoFuncoes.value[f.id] = f.nome;
    });
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
};

onMounted(() => carregarDados());
</script>

<template>
  <CardBarraNavegacao/>
  <main>
    <CardNovoAtendimento
      :listaProfissionais="profissionais"
      :mapaFuncoes="mapeamentoFuncoes"
    />
  </main>
</template>

<style lang="css" scoped>
  h1 {
    margin: 25px;
  }
  main {
    display: flex;
    justify-content: center;
    margin-top: 100px;
    margin-bottom: 100px;
  }

</style>
