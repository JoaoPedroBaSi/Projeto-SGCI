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

// Recupera dados do usuário
const usuarioLogado = JSON.parse(localStorage.getItem('user_data') || '{}');
const clienteLogadoId = usuarioLogado.id;

isLoading.value = true;
error.value = null;

const fetchDados = async () => {
  try {
    const [atendimentoRes, salaRes, profRes, funcaoRes] = await Promise.all([
      api.get<any[]>('/atendimento'),
      api.get<Sala[]>('/sala'),
      api.get<Profissional[]>('/profissionais'), // Rota correta no Plural
      api.get<{ id: number; nome: string }[]>('/funcao')
    ]);

    listaProfissionais.value = profRes.data;

    // Mapa de Funções para acesso rápido
    const mapaFuncoes: Record<number, string> = {};
    funcaoRes.data.forEach(f => mapaFuncoes[f.id] = f.nome);

    // Filtra para pegar apenas os agendamentos do usuário logado
    const meusAtendimentos = atendimentoRes.data.filter(
      atend => Number(atend.clienteId || atend.cliente_id) === Number(clienteLogadoId)
    );

    // --- MAPEAMENTO ROBUSTO ---
    atendimentos.value = meusAtendimentos.map((item) => {
      // Busca Sala e Profissional (Verifica camelCase e snake_case)
      const salaId = item.salaId || item.sala_id;
      const profId = item.profissionalId || item.profissional_id;
      
      const sala = salaRes.data.find(s => Number(s.id) === Number(salaId));
      const prof = profRes.data.find(p => Number(p.id) === Number(profId));

      return {
        ...item,
        // Garante que a data exista, tentando todas as variações possíveis
        dataHoraInicio: item.dataHoraInicio || item.data_hora_inicio || item.data,
        status: item.status,
        
        // Dados Relacionados
        nomeSala: sala ? sala.nome : 'Sala não definida',
        nomeProfissional: prof ? prof.nome : 'Profissional não definido',
        
        // CORREÇÃO DO TYPESCRIPT: Usamos (prof as any) para ler propriedades dinâmicas
        funcaoProfissional: prof 
          ? (mapaFuncoes[(prof as any).funcaoId || (prof as any).funcao_id] || 'Especialista') 
          : ''
      };
    });

    console.log("Atendimentos processados:", atendimentos.value);

  } catch (err) {
    console.error("Erro ao carregar agenda:", err);
    error.value = "Não foi possível carregar seus agendamentos.";
  } finally {
    isLoading.value = false;
  }
};

// Lógica de Paginação
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

onMounted(fetchDados);
</script>

<template>
  <CardBarraNavegacao/>

  <h1>Agenda</h1>

  <main>
    <div class="container-cards" v-if="!isLoading">
      <div v-for="atendimento in atendimentosPaginados" :key="atendimento.id">
        <CardHistorico class="historico-card" :consulta="atendimento" pagina="agenda" :lista-profissionais="listaProfissionais"/>
      </div>

      <p v-if="atendimentos.length === 0 && !error">Nenhum registro encontrado.</p>
      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>
    <div v-else class="loader">Carregando...</div>

    <div class="paginacao" v-if="!isLoading && atendimentos.length > 0">
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
  h1 { text-align: center; font-family: 'Montserrat', sans-serif; margin-top: 30px; color: #128093; }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-height: 80vh;
  }

  .container-cards {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding-top: 20px;
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
  
  .error-msg {
    color: red;
    font-weight: bold;
    margin-top: 20px;
  }
  
  .loader {
    margin-top: 50px;
    font-size: 1.2rem;
    color: #666;
  }
</style>