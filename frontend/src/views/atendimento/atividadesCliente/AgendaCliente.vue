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

// Pega o ID do usuário logado
const usuarioLogado = JSON.parse(localStorage.getItem('user_data') || '{}');
const clienteLogadoId = usuarioLogado.id;

isLoading.value = true;
error.value = null;

const fetchDados = async () => {
  try {
    const [atendimentoRes, salaRes, profRes, funcaoRes] = await Promise.all([
      api.get<Atendimento[]>('/atendimento'),
      api.get<Sala[]>('/sala'),
      api.get<Profissional[]>('/profissionais'), 
      api.get<{ id: number; nome: string }[]>('/funcao')
    ]);

    // === DIAGNÓSTICO (Olhe no Console F12) ===
    console.log("=== INÍCIO DO DIAGNÓSTICO ===");
    console.log("👤 ID do Usuário Logado:", clienteLogadoId);
    console.log("📦 Total de Atendimentos no Banco:", atendimentoRes.data.length);
    console.log("📄 Dados brutos dos atendimentos:", atendimentoRes.data);
    // ==========================================

    listaProfissionais.value = profRes.data;

    const mapaFuncoes: Record<number, string> = {};
    funcaoRes.data.forEach(f => mapaFuncoes[f.id] = f.nome);

    const processarLista = (lista: Atendimento[]): any[] => {
      if (lista.length === 0) return [];
      const [primeiro, ...resto] = lista;
      
      const sala = salaRes.data.find(s => Number(s.id) === Number(primeiro?.salaId));
      const prof = profRes.data.find(p => Number(p.id) === Number(primeiro?.profissionalId));

      const itemFormatado = {
        ...primeiro,
        nomeSala: sala ? sala.nome : 'Sala Indefinida',
        nomeProfissional: prof ? prof.nome : 'Profissional indefinido',
        funcaoProfissional: prof ? (mapaFuncoes[prof.funcaoId] || 'Especialidade') : 'Indefinida'
      };
      return [itemFormatado, ...processarLista(resto)];
    };

    // Filtra apenas os atendimentos DESTE cliente
    const atendimentosDoCliente = atendimentoRes.data.filter(
      atend => Number(atend.clienteId) === Number(clienteLogadoId)
    );
    
    console.log("✅ Atendimentos filtrados para você:", atendimentosDoCliente.length);

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

onMounted(fetchDados);
</script>