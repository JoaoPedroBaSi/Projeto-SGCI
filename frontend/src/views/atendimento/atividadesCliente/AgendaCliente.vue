<script setup lang="ts">
import CardBarraNavegacao from '@/components/barra/CardBarraNavegacao.vue';
import CardHistorico from '@/components/cards/atendimento/horarios/CardHistorico.vue';
import api from '@/services/api';
import type { Atendimento, Profissional, Sala } from '@/types';
import { computed, onMounted, ref } from 'vue';

const atendimentos = ref<any[]>([]);
const listaProfissionais = ref<Profissional[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const paginaAtual = ref(1);
const itensPorPagina = 10;

const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
const clienteLogadoId = usuarioLogado.id;
isLoading.value = true;
error.value = null;

const fetchSalas = async () => {

  try {
    const [atendimentoRes, salaRes, profRes, funcaoRes] = await Promise.all([
      api.get<Atendimento[]>('/atendimento'),
      api.get<Sala[]>('/sala'),
      api.get<Profissional[]>('/profissional'),
      api.get<{ id: number; nome: string }[]>('/funcao')
    ]);

    listaProfissionais.value = profRes.data;

    const mapaFuncoes: Record<number, string> = {};
    funcaoRes.data.forEach(f => mapaFuncoes[f.id] = f.nome);

    const processarLista = (lista: Atendimento[]): any[] => {
      if (lista.length === 0) return [];
      const [primeiro, ...resto] = lista;
      const sala = salaRes.data.find(s => s.id === primeiro?.salaId);
      const prof = profRes.data.find(p => p.id === primeiro?.profissionalId);

      const itemFormatado = {
        ...primeiro,
        nomeSala: sala ? sala.nome : 'Sala Indefinida',
        nomeProfissional: prof ? prof.nome : 'Profissional indefinido',
        funcaoProfissional: prof ? (mapaFuncoes[prof.funcaoId] || 'Especialidade') : 'Indefinida'
      };
      return [itemFormatado, ...processarLista(resto)];
    };

    const atendimentosDoCliente = atendimentoRes.data.filter(
      atend => atend.clienteId === 3//clienteLogadoId
    );

    atendimentos.value = processarLista(atendimentosDoCliente);

  } catch (err) {
    console.error("Erro:", err);
    error.value = "Falha ao carregar dados.";
  } finally {
    isLoading.value = false;
  }
};

const atendimentosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina;
  return atendimentos.value.slice(inicio, inicio + itensPorPagina);
});

const totalPaginas = computed(() => {
  return Math.max(1, Math.ceil(atendimentos.value.length / itensPorPagina));
});

const irParaPagina = (pagina: number) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaAtual.value = pagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

onMounted(fetchSalas);
</script>

<template>
  <CardBarraNavegacao/>

  <h1>Agenda</h1>

  <main>
    <div class="container-cards" v-if="!isLoading">
      <div v-for="atendimento in atendimentosPaginados" :key="atendimento.id">
        <CardHistorico class="historico-card" :consulta="atendimento" pagina="agenda" :lista-profissionais="listaProfissionais"/>
      </div>

      <p v-if="atendimentos.length === 0">Nenhum registro encontrado.</p>
    </div>
    <div v-else class="loader">Carregando...</div>

    <div class="paginacao">
      <button
        class="btn-pag"
        :disabled="paginaAtual === 1 || isLoading"
        @click="irParaPagina(paginaAtual - 1)"
      >
        &lt;
      </button>

      <button
        v-for="n in Math.max(totalPaginas, 1)"
        :key="n"
        :class="['btn-pag', { 'ativo': n === paginaAtual }]"
        :disabled="isLoading"
        @click="irParaPagina(n)"
      >
        {{ n }}
      </button>

      <button
        class="btn-pag"
        :disabled="paginaAtual === totalPaginas || isLoading"
        @click="irParaPagina(paginaAtual + 1)"
      >
        &gt;
      </button>
    </div>
  </main>
</template>

<style scoped lang="css">
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
  .historico-link {
    border: 2px solid blue; color: blue;
  }
  h1 { text-align: center; font-family: 'Montserrat', sans-serif; }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-height: 80vh; /* Garante que a página tenha altura */
  }

  .container-cards {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .historico-card { margin-bottom: 20px; }

  .paginacao {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 40px 0;
    width: 100%;
    background: white;
    border-top: 1px solid #eee;
  }

  .btn-pag {
    width: 35px;
    height: 35px;
    border-radius: 6px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-pag.ativo {
    background-color: #128093;
    color: white;
    border-color: #128093;
  }

  .btn-pag:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
