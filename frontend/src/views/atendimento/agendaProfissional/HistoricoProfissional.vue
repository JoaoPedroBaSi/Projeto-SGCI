<script setup lang="ts">
import CardBarraNavegacao from '@/components/barra/CardBarraNavegacao.vue';
import CardHistorico from '@/components/cards/atendimento/horarios/CardHistorico.vue';
import api from '@/services/api';
import type { Atendimento, Sala } from '@/types';
import { computed, onMounted, ref } from 'vue';

const atendimentos = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const paginaAtual = ref(1);
const itensPorPagina = 10;

const fetchHistoricoParaProfissional = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const token = localStorage.getItem('auth_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Buscamos os dados necessários
    const [atendimentoRes, salaRes, clienteRes] = await Promise.all([
      api.get<Atendimento[]>('/atendimento', config), // O back já filtra pelo profissional logado
      api.get<Sala[]>('/sala', config),
      api.get<any[]>('/cliente', config) // Precisamos da lista de clientes para pegar os nomes
    ]);

    atendimentos.value = atendimentoRes.data.map(atend => {
      const sala = salaRes.data.find(s => s.id === atend.salaId);
      const cliente = clienteRes.data.find(c => c.id === atend.clienteId);

      return {
        ...atend,
        nomeSala: sala ? sala.nome : 'Sala Indefinida',
        // TRATAMENTO DIFERENCIADO:
        // No card, o campo "nomeProfissional" é o título principal.
        // Para o profissional, o título principal deve ser o nome do PACIENTE.
        nomeProfissional: cliente ? cliente.nome : 'Paciente indefinido',
        funcaoProfissional: 'Paciente' // Subtítulo do card
      };
    });

  } catch (err: any) {
    console.error("Erro:", err);
    error.value = "Falha ao carregar histórico.";
  } finally {
    isLoading.value = false;
  }
};

// --- Lógica de Paginação (Idêntica à original) ---
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

onMounted(fetchHistoricoParaProfissional);
</script>

<template>
  <CardBarraNavegacao/>

  <h1>Histórico de Consultas</h1>

  <main>
    <div class="container-cards" v-if="!isLoading">
      <div v-for="atendimento in atendimentosPaginados" :key="atendimento.id">
        <CardHistorico class="historico-card" :consulta="atendimento" pagina="historico"/>
      </div>

      <p v-if="atendimentos.length === 0">Nenhum registro encontrado no histórico.</p>
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
        v-for="n in totalPaginas"
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
  /* Estilos copiados integralmente para manter a paridade visual */
  h1 { text-align: center; font-family: 'Montserrat', sans-serif; margin-top: 20px; color: #128093; }
  main { display: flex; flex-direction: column; align-items: center; width: 100%; min-height: 80vh; }
  .container-cards { flex-grow: 1; display: flex; flex-direction: column; align-items: center; width: 100%; }
  .historico-card { margin-bottom: 20px; width: 100%; max-width: 1000px; }
  .loader { text-align: center; padding: 50px; color: #128093; font-weight: bold; }

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
    width: 35px; height: 35px; border-radius: 6px; border: 1px solid #ddd;
    background: white; cursor: pointer; transition: 0.2s;
  }

  .btn-pag.ativo { background-color: #128093; color: white; border-color: #128093; }
  .btn-pag:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
