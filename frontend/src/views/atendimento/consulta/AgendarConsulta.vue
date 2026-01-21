<script setup lang="ts">
import CardNovoAtendimento from '@/components/cards/atendimento/consulta/CardNovoAtendimento.vue';
import CardInfosLogin from '@/components/cards/atendimento/login/CardInfosLogin.vue';
import api from '@/services/api';
import type { Profissional } from '@/types';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const profissionais = ref<Profissional[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');

const mapeamentoFuncoes = ref<Record<number, string>>({}); // Guarda { 1: "DENTISTA" }

const carregarDados = async (idParaBuscar?: number) => {
  isLoading.value = true;
  error.value = null;

  // 1. Recupera o token correto
  const token = localStorage.getItem('auth_token');

  if (!token) {
    error.value = "Sessão expirada. Faça login novamente.";
    isLoading.value = false;
    return { nomeProfissional: 'Não autorizado' };
  }

  // 2. Configura o token no Axios para as requisições abaixo
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  try {
    // Busca as duas listas em paralelo (Agora com o Token nos headers)
    const [resProfissionais, resFuncoes] = await Promise.all([
      api.get<Profissional[]>('/profissionais'),
      api.get<any[]>('/funcao')
    ]);

    profissionais.value = resProfissionais.data;

    const mapa: Record<number, string> = {};
    resFuncoes.data.forEach(f => {
      mapa[f.id] = f.nome;
    });
    mapeamentoFuncoes.value = mapa;

    const profissionalEncontrado = profissionais.value.find(p => p.id === idParaBuscar);

    // Se o profissional encontrado tiver disponibilidades (vinda do preload do backend)
    // elas já estarão acessíveis aqui em profissionalEncontrado.disponibilidades

    return {
      nomeProfissional: profissionalEncontrado ? profissionalEncontrado.nome : 'Profissional indefinido'
    };

  } catch (err: any) {
    console.error("Erro ao carregar dados:", err);

    if (err.response?.status === 401) {
      error.value = "Sessão inválida. Por favor, saia e entre novamente.";
    } else {
      error.value = "Falha ao carregar dados do servidor.";
    }

    return { nomeProfissional: 'Erro ao carregar' };
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const idDaUrl = route.params.id ? Number(route.params.id) : undefined;
  carregarDados(idDaUrl);
});

// O watch garante que se o usuário mudar de profissional sem recarregar a página, os dados atualizem
watch(() => route.params.id, (novoId) => {
  if (novoId) carregarDados(Number(novoId));
});
</script>

<template>
  <header class="cabecalho">
    <div class="acoes">
      <RouterLink class="consulta" to="/cliente/dashboard">< Voltar</RouterLink>
    </div>
    <CardInfosLogin/>
  </header>

<main>
  <CardNovoAtendimento :listaProfissionais="profissionais" :mapaFuncoes="mapeamentoFuncoes" class="card-atendimento"/>
</main>
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
  .historico-link {
    border: 2px solid blue; color: blue;
  }
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
