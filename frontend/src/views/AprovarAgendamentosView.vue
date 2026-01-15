<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/services/api';
import SolicitacaoCard from '@/components/cards/SolicitacaoCard.vue';
import SolicitacaoAdmModal from '@/components/modals/SolicitacaoAdmModal.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

interface Solicitacao {
  id: number;
  titulo: string;
  paciente: string;
  profissional: string;
  dataHora: string;
  dataHoraOriginal: string;
  tipoConsulta: string;
  status: string;
}

interface Toast {
  id: number;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'info';
}

const listaSolicitacoes = ref<Solicitacao[]>([]);
const loading = ref(false);
const toasts = ref<Toast[]>([]);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

const modalAberto = ref(false);
const tipoAcao = ref('');
const itemSelecionado = ref<Solicitacao | null>(null);

function adicionarToast(mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso') {
  const id = Date.now();
  toasts.value.push({ id, mensagem, tipo });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 5000);
}

async function fetchSolicitacoes(isPolling = false) {
  if (!isPolling) loading.value = true;

  try {
    const response = await api.get('/atendimento/solicitacoes', {
      params: { status: 'PENDENTE' }
    });

    const pendentes = response.data;

    const novaListaMapeada: Solicitacao[] = pendentes.map((item: any) => {
      const dataObj = new Date(item.dataHoraInicio);
      const dataFormatada = dataObj.toLocaleString('pt-BR', {
        timeZone: 'UTC',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      return {
        id: item.id,
        titulo: 'Solicitação de Agendamento',
        paciente: item.cliente?.nome || 'Cliente #' + item.clienteId,
        profissional: item.profissional?.nome || 'Profissional #' + item.profissionalId,
        dataHora: dataFormatada,
        dataHoraOriginal: item.dataHoraInicio,
        tipoConsulta: item.observacoes || 'Consulta Geral',
        status: item.status
      };
    });

    if (isPolling && novaListaMapeada.length > listaSolicitacoes.value.length) {
      const idsAtuais = new Set(listaSolicitacoes.value.map(s => s.id));
      const novosItens = novaListaMapeada.filter(novo => !idsAtuais.has(novo.id));

      if (novosItens.length > 0) {
        adicionarToast(`Novo agendamento recebido! (${novosItens.length})`, 'info');
      }
    }

    listaSolicitacoes.value = novaListaMapeada;

  } catch (error) {
    if (!isPolling) {
      adicionarToast('Erro ao carregar agendamentos do servidor.', 'erro');
    }
    console.error(error);
  } finally {
    if (!isPolling) loading.value = false;
  }
}

async function processarDecisao(payload: any) {
  const { id, acao } = payload;
  try {
    if (acao === 'confirmar') {
      await api.patch(`/atendimento/${id}/aprovar`);
      adicionarToast('Agendamento confirmado com sucesso!', 'sucesso');
    } else if (acao === 'recusar') {
      await api.patch(`/atendimento/${id}/recusar`);
      adicionarToast('Solicitação recusada com sucesso.', 'sucesso');
    }
    listaSolicitacoes.value = listaSolicitacoes.value.filter(s => s.id !== id);
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Erro ao processar a solicitação.';
    adicionarToast(msg, 'erro');
  } finally {
    modalAberto.value = false;
  }
}

function abrirModalRecusa(item: Solicitacao) {
  itemSelecionado.value = item;
  tipoAcao.value = 'recusar';
  modalAberto.value = true;
}

function abrirModalConfirmacao(item: Solicitacao) {
  itemSelecionado.value = item;
  tipoAcao.value = 'confirmar';
  modalAberto.value = true;
}

onMounted(() => {
  fetchSolicitacoes();
  pollingInterval = setInterval(() => {
    if (!loading.value) {
      fetchSolicitacoes(true);
    }
  }, 20000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<template>
  <DashboardLayout>
    <div class="pagina-aprovacao">
      <div class="toast-container">
        <TransitionGroup name="toast">
          <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.tipo">
            <span class="icon" v-if="toast.tipo === 'sucesso'">✅</span>
            <span class="icon" v-else-if="toast.tipo === 'erro'">❌</span>
            <span class="icon" v-else>🔔</span>
            {{ toast.mensagem }}
          </div>
        </TransitionGroup>
      </div>

      <header class="header-pagina">
        <h1 class="titulo-principal">Gerenciar Agendamentos</h1>
      </header>

      <section class="conteudo">
        <h2 class="subtitulo-secao">Solicitações de Consulta</h2>

        <div v-if="loading" class="estado-lista">
          <p>Carregando solicitações...</p>
        </div>

        <div v-else-if="listaSolicitacoes.length === 0" class="estado-lista">
          <p>Nenhuma solicitação pendente.</p>
        </div>

        <div v-else class="grid-solicitacoes">
          <TransitionGroup name="list">
            <SolicitacaoCard v-for="solicitacao in listaSolicitacoes" :key="solicitacao.id" :dados="solicitacao"
              @ao-recusar="abrirModalRecusa" @ao-confirmar="abrirModalConfirmacao" />
          </TransitionGroup>
        </div>
      </section>

      <SolicitacaoAdmModal :visivel="modalAberto" :acao="tipoAcao" :item="itemSelecionado"
        @ao-fechar="modalAberto = false" @ao-salvar="processarDecisao" />
    </div>
  </DashboardLayout>
</template>

<style scoped>
.pagina-aprovacao {
  font-family: 'Montserrat', sans-serif;
  color: #333;
  padding: 30px 40px;
  min-height: 100vh;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.toast.sucesso {
  background-color: #2CAFB6;
}

.toast.erro {
  background-color: #ff4d4f;
}

.toast.info {
  background-color: #4a90e2;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-active {
  position: absolute;
}

.header-pagina {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.titulo-principal {
  font-size: 1.8rem;
  color: #2CAFB6;
  font-weight: 700;
  margin: 0;
}

.subtitulo-secao {
  color: #2CAFB6;
  font-size: 1.3rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 15px;
}

.grid-solicitacoes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  position: relative;
}

.estado-lista {
  text-align: center;
  padding: 40px;
  color: #777;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}
</style>
