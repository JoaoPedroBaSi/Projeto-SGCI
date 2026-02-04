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
import CardInfosLogin from '@/components/cards/atendimento/login/CardInfosLogin.vue';

type DadosAnexadosSala = { nomeSala: string };
type DadosAnexadosProfissional = { nomeProfissional: string };
type AtendimentoCompleto = Atendimento & DadosAnexadosSala & DadosAnexadosProfissional;

const route = useRoute();
const atendimentos = ref<AtendimentoCompleto[]>([]);
const salas = ref<Sala[]>([])
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

const carregarDados = async () => {
  isLoading.value = true;
  error.value = null;

  const token = localStorage.getItem('auth_token');

  if (!token) {
    console.error("Token 'auth_token' não encontrado.");
    error.value = "Sessão expirada. Por favor, faça login novamente.";
    isLoading.value = false;
    return;
  }

  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  try {
    const [atendRes, salaRes] = await Promise.allSettled([
      api.get<any[]>('/atendimento'),
      api.get<any[]>('/sala')
    ]);

    let dadosSalas: any[] = [];
    if (salaRes.status === 'fulfilled') {
      dadosSalas = salaRes.value.data;
      salas.value = dadosSalas;
    }

    if (atendRes.status === 'fulfilled') {
      atendimentos.value = atendRes.value.data.map((a: any) => ({
        ...a,
        nomeSala: dadosSalas.find(s => s.id === a.salaId)?.nome || 'Sala N/A',

        nomeProfissional: a.profissional?.nome || 'Profissional N/A',

        disponibilidades: a.profissional?.disponibilidades || []
      }));
    } else {
      console.warn("Falha ao carregar atendimentos:", atendRes.reason);
    }
  } catch (err) {
    console.error("Erro crítico no dashboard:", err);
    error.value = "Não foi possível carregar os dados do painel.";
  } finally {
    isLoading.value = false;
  }
};

watch(() => route.params.id, () => {
  carregarDados();
});

const contarAtendimentosConfirmados = computed(() =>
  atendimentos.value.filter(a => a.status === 'CONFIRMADO').length + atendimentos.value.filter(a => a.status === 'PENDENTE').length
);

const contarAtendimentosAguardandoPagamento = computed(() =>
  atendimentos.value.filter(a => a.statusPagamento === 'PENDENTE').length
);

const contarAtendimentosNoHistorico = computed(() =>
  atendimentos.value.filter(a => a.status === 'CONCLUIDO').length
);

const infos = computed(() => [
  { id: 1, calculo: contarAtendimentosConfirmados.value, finalidade: "CONFIRMADO" },
  { id: 2, calculo: contarAtendimentosAguardandoPagamento.value, finalidade: "AGUARDANDO" },
  { id: 3, calculo: contarAtendimentosNoHistorico.value, finalidade: "CONCLUIDO" }
]);

const saldoTotal = computed(() => {
  return atendimentos.value
    .filter(a => a.status === 'CONCLUIDO' && a.statusPagamento === 'PAGO')
    .reduce((acc, atual) => {
      const valorNumerico = Number(atual.valor) || 0;
      return acc + valorNumerico;
    }, 0);
});

onMounted(carregarDados);
</script>
<template>
  <DashboardLayout>
    <header class="cabecalho">
      <div class="titulo">
        <h1>Seus dashboards</h1>
      </div>
      <CardInfosLogin />
    </header>

    <div class="secao-titulo">
      <h3>Total gasto</h3>
    </div>
    <div class="container-linha-unica">
      <CardDashboardProfissional finalidade="rendimento" :chartData="saldoTotal" titulo="Gasto" />
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

      <CardDashboardConsulta v-for="atendimento in atendimentos" :key="atendimento.id" :consulta="atendimento"
        @detalhar="abrirDetalhes" />
    </section>

    <Teleport to="body">
      <div v-if="atendimentoSelecionado" class="modal-overlay" @click.self="fecharDetalhes">
        <div class="modal-content">
          <button class="btn-fechar" @click="fecharDetalhes">✕</button>
          <CardAtendimento :consulta="atendimentoSelecionado" @cancelar="fecharDetalhes" />
        </div>
      </div>
    </Teleport>

    <div class="secao-titulo">
      <h3>Detalhamento</h3>
    </div>
    <section class="grid-resumo-layout">
      <CardDashboardCalc v-for="info in infos" :key="info.id"
        :finalidade="(info.finalidade as 'CONFIRMADO' | 'AGUARDANDO' | 'CONCLUIDO')"
        :qtdAtendimentosConfirmados="contarAtendimentosConfirmados"
        :qtdAtendimentosAguardandoPagamento="contarAtendimentosAguardandoPagamento"
        :qtdAtendimentosNoHistorico="contarAtendimentosNoHistorico" />
    </section>
  </DashboardLayout>
</template>

<style lang="css" scoped>
.secao-titulo {
  margin: 40px 30px 10px 30px;
  border-left: 5px solid #128093;
  padding-left: 15px;
}

h3 {
  color: #4a4a4a;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.cabecalho {
  padding: 0 50px;
  display: flex;
  justify-content: space-between;
  min-height: 150px;
  align-items: center;
  background-color: white;
  flex-wrap: wrap;
  gap: 20px;
}

.titulo {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.titulo h1 {
  color: #128093;
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}

.container-linha-unica {
  padding: 10px 50px;
}

.grid-container {
  margin: 30px;
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0 25px 0;
  scroll-snap-type: x mandatory;
  align-items: center;
}

.container-botao-adicionar {
  flex: 0 0 300px;
  scroll-snap-align: start;
}

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

.simbolo-mais {
  font-size: 2.5rem;
  color: #128093;
}

:deep(.card) {
  flex: 0 0 350px;
  scroll-snap-align: start;
}

.grid-resumo-layout {
  margin: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  max-width: 95%;
}

.btn-fechar {
  position: absolute;
  top: -45px;
  right: 0;
  background: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  color: #128093;
  font-weight: bold;
}

@media (max-width: 850px) {
  .cabecalho {
    padding: 20px;
    justify-content: center;
    text-align: center;
  }

  .infos-perfil {
    border-left: none;
    padding-left: 0;
    width: 100%;
    justify-content: center;
  }

  .container-linha-unica {
    padding: 10px 20px;
  }

  .grid-resumo-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .secao-titulo {
    margin: 30px 20px 10px 20px;
  }

  .titulo h1 {
    font-size: 22px;
  }

  :deep(.card) {
    flex: 0 0 280px;
  }

  .container-botao-adicionar {
    flex: 0 0 250px;
  }
}

.grid-container::-webkit-scrollbar {
  height: 8px;
}

.grid-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.grid-container::-webkit-scrollbar-thumb {
  background: #128093;
  border-radius: 10px;
}
</style>
