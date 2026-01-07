<script setup lang="ts">
import CardNovoAtendimento from '@/components/cards/atendimento/consulta/CardNovoAtendimento.vue';
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

  try {
    // Busca as duas listas em paralelo
    const [resProfissionais, resFuncoes] = await Promise.all([
      api.get<Profissional[]>('/profissional'),
      api.get<any[]>('/funcao')
    ]);

    profissionais.value = resProfissionais.data;

    const mapa: Record<number, string> = {};
    resFuncoes.data.forEach(f => {
      mapa[f.id] = f.nome;
    });
    mapeamentoFuncoes.value = mapa;

    // Lógica que você já tinha para o profissional selecionado
    const profissionalEncontrado = profissionais.value.find(p => p.id === idParaBuscar);
    return {
      nomeProfissional: profissionalEncontrado ? profissionalEncontrado.nome : 'Profissional indefinido'
    };

  } catch (err: any) {
    console.error("Erro ao carregar dados:", err);
    error.value = "Falha ao carregar dados do servidor.";
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
      <RouterLink class="disponibilidade" to="/profissional/disponibilidade">Consultar disponibilidade dos profissionais</RouterLink>
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
  .infos-perfil img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
  }
  .infos-perfil {
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 1px solid #eee;
    padding-left: 20px;
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
  .acoes {
    margin: 30px;
    display: flex;
    gap: 20px;
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
  .disponibilidade{
    color: white;
    background-color: #128093;
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
