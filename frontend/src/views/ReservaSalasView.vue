<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SalaCard from '@/components/cards/ReservaSalaCard.vue';
import ReservaModal from '@/components/modals/ReservaModal.vue';
import { salaService } from '@/services/salaService';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

interface Sala {
  id: number;
  nome: string;
  tipo: 'consultorio' | 'exames' | 'terapia';
  capacidade: number;
  preco: number;
  status: 'disponivel' | 'ocupada';
}

interface Toast {
  id: number;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'info';
}

const router = useRouter();
const dataFiltro = ref('2025-12-23');
const buscaSala = ref('');
const modalAberto = ref(false);
const salaSelecionada = ref<Sala | null>(null);
const listaSalas = ref<Sala[]>([]);
const carregando = ref(true);
const toasts = ref<Toast[]>([]);

function adicionarToast(mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso') {
  const id = Date.now();
  toasts.value.push({ id, mensagem, tipo });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4000);
}

// Recebe notificações de erro/info vindas do Modal
function lidarComNotificacaoModal(payload: { mensagem: string, tipo: 'sucesso' | 'erro' | 'info' }) {
  adicionarToast(payload.mensagem, payload.tipo);
}

function definirDataHoje() {
  const hoje = new Date();
  dataFiltro.value = hoje.toLocaleDateString('en-CA');
}

function abrirModalReserva(sala: Sala) {
  salaSelecionada.value = sala;
  modalAberto.value = true;
}

async function buscarSalas() {
  carregando.value = true;
  try {
    const salasBackend = await salaService.listarTodas();

    listaSalas.value = salasBackend.map((s: any) => {
      let tipoIcone = 'consultorio';
      if (s.nome.toLowerCase().includes('exame')) tipoIcone = 'exames';
      if (s.nome.toLowerCase().includes('terapia') || s.nome.toLowerCase().includes('psico')) tipoIcone = 'terapia';

      return {
        id: s.id,
        nome: s.nome,
        tipo: tipoIcone,
        capacidade: s.capacidadePacientes,
        preco: Number(s.precoAluguel),
        status: s.status === 'DISPONIVEL' ? 'disponivel' : 'ocupada'
      };
    });
  } catch (error) {
    console.error('Erro ao buscar salas:', error);
    adicionarToast('Erro ao carregar as salas. Verifique sua conexão.', 'erro');
  } finally {
    carregando.value = false;
  }
}

// --- LÓGICA REDIRECIONAMENTO ---
function processarSucessoReserva(payload: { total: string }) {
  modalAberto.value = false;

  adicionarToast('Reserva criada! Redirecionando para pagamento...', 'sucesso');

  setTimeout(() => {
    if (salaSelecionada.value) {
      router.push({
        path: '/checkout-reserva',
        query: {
          salaId: salaSelecionada.value.id,
          total: payload.total
        }
      });
    }
  }, 1500);
}

onMounted(() => {
  definirDataHoje();
  buscarSalas();
});
</script>

<template>
  <DashboardLayout>
    <div class="layout-wrapper">

      <Teleport to="body">
        <div class="toast-container">
          <TransitionGroup name="toast">
            <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.tipo">
              <span class="icon" v-if="toast.tipo === 'sucesso'">✅</span>
              <span class="icon" v-else-if="toast.tipo === 'erro'">❌</span>
              <span class="icon" v-else>ℹ️</span>
              {{ toast.mensagem }}
            </div>
          </TransitionGroup>
        </div>
      </Teleport>

      <header class="header-pagina">
        <div class="header-content">
          <div class="titulos">
            <h1 class="titulo-principal">Reserva de Salas</h1>
            <div class="breadcrumbs">Recursos / <span class="active">Reserva de Salas</span></div>
          </div>
        </div>
      </header>

      <main class="conteudo-pagina">
        <div class="container-limite">

          <section class="filtros-container">
            <div class="filtro-item">
              <label>DATA DESEJADA</label>
              <div class="input-icon-wrapper">
                <input type="date" v-model="dataFiltro" class="input-filtro">
              </div>
            </div>

            <div class="filtro-item flex-grow">
              <label>BUSCAR SALA</label>
              <div class="search-wrapper">
                <input type="text" v-model="buscaSala" placeholder="Ex: Sala 01..." class="input-filtro">
                <button class="btn-hoje" @click="definirDataHoje">Hoje</button>
              </div>
            </div>
          </section>

          <div v-if="carregando" class="loading-state">Carregando salas...</div>

          <section v-else class="grid-salas">
            <SalaCard v-for="sala in listaSalas" :key="sala.id" :dados="sala" @ao-reservar="abrirModalReserva" />
          </section>

        </div>
      </main>

      <ReservaModal :visivel="modalAberto" :sala="salaSelecionada" @ao-fechar="modalAberto = false"
        @ao-confirmar="processarSucessoReserva" @ao-notificar="lidarComNotificacaoModal" />
    </div>
  </DashboardLayout>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
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

.layout-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #F0F2F5;
  width: 100%;
  min-height: 100%;
}

.header-pagina {
  background-color: #FFFFFF;
  padding: 15px 40px;
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.titulo-principal {
  font-size: 1.6rem;
  color: #2CAFB6;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.breadcrumbs {
  color: #888;
  font-size: 0.85rem;
  margin-top: 2px;
}

.breadcrumbs .active {
  color: #2CAFB6;
  font-weight: 600;
}

.conteudo-pagina {
  flex-grow: 1;

  padding: 30px 0;
  width: 100%;
  box-sizing: border-box;
}

.container-limite {
  width: 100%;
  max-width: 100%;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #888;
  font-weight: 600;
}

.filtros-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  gap: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  margin-bottom: 30px;
  align-items: flex-end;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}

.filtro-item label {
  display: block;
  font-size: 0.75rem;
  color: #999;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.input-filtro {
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 6px;
  color: #555;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 0.9rem;
}

.flex-grow {
  flex-grow: 1;
  min-width: 250px;
}

.search-wrapper {
  display: flex;
  gap: 10px;
  width: 100%;
}

.search-wrapper .input-filtro {
  width: auto;
  flex: 1;
}

.btn-hoje {
  background-color: #00838F;
  color: white;
  border: none;
  padding: 0 25px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.grid-salas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  width: 100%;
}
</style>
