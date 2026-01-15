<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import CardDashboardConsulta from '@/components/cards/atendimento/dashboard/CardDashboardConsulta.vue';
import CardDashboardCalc from '@/components/cards/atendimento/dashboard/CardDashboardCalc.vue';
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/services/api';
import type { Profissional, Atendimento, Sala, Cliente } from '@/types/index';
import { useRoute } from 'vue-router';
import CardAtendimento from '@/components/cards/atendimento/consulta/CardAtendimento.vue';
import CardDashboardProfissional from '@/components/cards/atendimento/dashboard/CardDashboardProfissional.vue';

// Tipos auxiliares para a combinação de dados
type DadosAnexadosSala = { nomeSala: string };
type DadosAnexadosProfissional = { nomeProfissional: string };
type AtendimentoCompleto = Atendimento & DadosAnexadosSala & DadosAnexadosProfissional;

const route = useRoute();
const atendimentos = ref<AtendimentoCompleto[]>([]);
const clienteLogado = ref<Cliente | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const atendimentoSelecionado = ref<AtendimentoCompleto | null>(null);

const abrirDetalhes = (atendimento: AtendimentoCompleto) => {
  atendimentoSelecionado.value = atendimento;
};

const fecharDetalhes = () => {
  atendimentoSelecionado.value = null;
};

// O ID do cliente torna-se computado baseado na URL para ser iterativo
const clienteLogadoId = computed(() => Number(route.params.id));

const carregarDados = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const [atendResponse, salaResponse, profResponse, cliResponse] = await Promise.all([
      api.get<Atendimento[]>('/atendimento'),
      api.get<Sala[]>('/sala'),
      api.get<Profissional[]>('/profissional'),
      api.get<Cliente[]>('/cliente')
    ]);

    // 1. Identifica o cliente logado
    clienteLogado.value = cliResponse.data.find(c => c.id === clienteLogadoId.value) || null;

    // 2. Mapeia e combina os dados
    const atendimentosCombinados: AtendimentoCompleto[] = atendResponse.data.map(atendimento => {
      const sala = salaResponse.data.find(s => s.id === atendimento.salaId);
      const profissional = profResponse.data.find(p => p.id === atendimento.profissionalId);

      return {
        ...atendimento,
        nomeSala: sala ? sala.nome : 'Sala Indefinida',
        nomeProfissional: profissional ? profissional.nome : 'Profissional indefinido'
      };
    });

    // 3. Filtra apenas os atendimentos do cliente atual
    atendimentos.value = atendimentosCombinados.filter(
      a => a.clienteId === clienteLogadoId.value
    );

  } catch (err) {
    error.value = "Erro ao carregar dados do dashboard.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// Observa mudanças na URL (ID) para recarregar os dados automaticamente
watch(() => route.params.id, () => {
  carregarDados();
});

// Cálculos baseados nos atendimentos filtrados
const contarAtendimentosConfirmados = computed(() =>
  atendimentos.value.filter(a => a.status === 'CONFIRMADO').length
);

const contarAtendimentosAguardandoPagamento = computed(() =>
  atendimentos.value.filter(a => a.statusPagamento === 'PENDENTE').length
);

const contarAtendimentosNoHistorico = computed(() =>
  atendimentos.value.filter(a => a.status === 'CONCLUIDO').length
);

const infos = computed(() => [
  { id: 1, calculo: contarAtendimentosConfirmados.value, finalidade: "CONFIRMADO"},
  { id: 2, calculo: contarAtendimentosAguardandoPagamento.value, finalidade: "AGUARDANDO"},
  { id: 3, calculo: contarAtendimentosNoHistorico.value, finalidade: "CONCLUIDO"}
]);

const saldoTotal = computed(() => {
  return atendimentos.value
    .filter(a => a.statusPagamento === 'PAGO')
    .reduce((acc, atual) => acc + Number(atual.valor || 0), 0);
});

onMounted(carregarDados);
</script>
Para tornar esta tela responsiva (ajustando o layout para diferentes tamanhos de tela) sem alterar as cores, fontes ou o estilo visual que você já definiu, apliquei ajustes na estrutura de grid e no flexbox do cabeçalho.

As principais mudanças focam em permitir que o cabeçalho se organize verticalmente em celulares e que a lista de cards de resumo (Detalhamento) se adapte de 3 colunas para 1 conforme o espaço diminui.

Código Responsivo Ajustado
Snippet de código

<template>
  <DashboardLayout>
    <header class="cabecalho">
      <div class="titulo">
        <h1>Seus dashboards</h1>
      </div>
      <div class="infos-perfil">
        <div class="foto">
          <img src="https://cdn-icons-png.flaticon.com/512/12225/12225881.png" alt="Perfil">
        </div>
        <div class="texto">
          <p class="nome">{{ clienteLogado?.nome || 'Usuário' }}</p>
          <p class="email">{{ clienteLogado?.email || 'E-mail não informado' }}</p>
        </div>
      </div>
    </header>

    <div class="secao-titulo">
      <h3>Total gasto</h3>
    </div>
    <div class="container-linha-unica">
      <CardDashboardProfissional finalidade="rendimento" :chartData="saldoTotal" titulo="Gasto"/>
    </div>

    <div class="secao-titulo">
      <h3>Próximas consultas</h3>
    </div>
    <section class="grid-container">
      <div class="container-botao-adicionar">
        <router-link to="/cliente/agendar" class="card-novo-agendamento">
          <div class="conteudo-adicionar">
            <span class="simbolo-mais">+</span>
          </div>
        </router-link>
      </div>

      <CardDashboardConsulta
        v-for="atendimento in atendimentos"
        :key="atendimento.id"
        :consulta="atendimento"
        @detalhar="abrirDetalhes"
      />
    </section>

    <Teleport to="body">
      <div v-if="atendimentoSelecionado" class="modal-overlay" @click.self="fecharDetalhes">
        <div class="modal-content">
          <button class="btn-fechar" @click="fecharDetalhes">✕</button>
          <CardAtendimento
            :consulta="atendimentoSelecionado"
            @cancelar="fecharDetalhes"
          />
        </div>
      </div>
    </Teleport>

    <div class="secao-titulo">
      <h3>Detalhamento</h3>
    </div>
    <section class="grid-resumo-layout">
      <CardDashboardCalc
        v-for="info in infos"
        :key="info.id"
        :finalidade="info.finalidade"
        :qtdAtendimentosConfirmados="contarAtendimentosConfirmados"
        :qtdAtendimentosAguardandoPagamento="contarAtendimentosAguardandoPagamento"
        :qtdAtendimentosNoHistorico="contarAtendimentosNoHistorico"
      />
    </section>
  </DashboardLayout>
</template>

<style lang="css" scoped>
  /* --- ESTILOS ORIGINAIS MANTIDOS --- */
  .secao-titulo {
    margin: 40px 30px 10px 30px;
    border-left: 5px solid #128093;
    padding-left: 15px;
  }
  h3 { color: #4a4a4a; font-size: 1.4rem; font-weight: 700; margin: 0; letter-spacing: -0.5px; }

  /* --- CABEÇALHO RESPONSIVO --- */
  .cabecalho {
    padding: 0 50px;
    display: flex;
    justify-content: space-between;
    min-height: 150px; /* Alterado de height fixo */
    align-items: center;
    background-color: white;
    flex-wrap: wrap; /* Permite quebra em telas menores */
    gap: 20px;
  }

  .titulo { display: flex; gap: 20px; margin: 20px 0; }
  .titulo h1 { color: #128093; font-size: 28px; font-weight: 800; margin: 0; }

  .infos-perfil {
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 1px solid #eee;
    padding-left: 20px;
  }
  .infos-perfil img { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; }
  .texto p { margin: 0; line-height: 1.2; }
  .texto .email { color: #666; font-size: 0.85rem; }

  /* --- SEÇÃO TOTAL GASTO --- */
  .container-linha-unica { padding: 10px 50px; }

  /* --- GRID DE CONSULTAS (SCROLL HORIZONTAL) --- */
  .grid-container {
    margin: 30px;
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding: 10px 0 25px 0;
    scroll-snap-type: x mandatory;
    align-items: center;
  }

  .container-botao-adicionar { flex: 0 0 300px; scroll-snap-align: start; }

  .card-novo-agendamento {
    width: 100%;
    height: 180px;
    background-color: #ffffff;
    border: 2px dashed #128093;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .simbolo-mais { font-size: 2.5rem; color: #128093; }

  :deep(.card) { flex: 0 0 350px; scroll-snap-align: start; }

  /* --- GRID DE DETALHAMENTO (RESPONSIVO) --- */
  .grid-resumo-layout {
    margin: 30px;
    display: grid;
    /* Começa com 3 colunas, mas se adapta */
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  /* --- MODAL --- */
  .modal-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center;
    align-items: center; z-index: 1000; backdrop-filter: blur(4px);
  }
  .modal-content { position: relative; max-width: 95%; }
  .btn-fechar {
    position: absolute; top: -45px; right: 0; background: white;
    border: none; width: 35px; height: 35px; border-radius: 50%;
    cursor: pointer; color: #128093; font-weight: bold;
  }

  /* --- MEDIA QUERIES (Apenas para ajustes de fluxo) --- */
  @media (max-width: 850px) {
    .cabecalho { padding: 20px; justify-content: center; text-align: center; }
    .infos-perfil { border-left: none; padding-left: 0; width: 100%; justify-content: center; }
    .container-linha-unica { padding: 10px 20px; }
    .grid-resumo-layout { grid-template-columns: 1fr; } /* Coluna única no mobile */
  }

  @media (max-width: 500px) {
    .secao-titulo { margin: 30px 20px 10px 20px; }
    .titulo h1 { font-size: 22px; }
    :deep(.card) { flex: 0 0 280px; } /* Cards menores no mobile */
    .container-botao-adicionar { flex: 0 0 250px; }
  }

  /* Estilização da Scrollbar */
  .grid-container::-webkit-scrollbar { height: 8px; }
  .grid-container::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
  .grid-container::-webkit-scrollbar-thumb { background: #128093; border-radius: 10px; }
</style>
