<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

interface ItemEstoque {
  id: number;
  item: string;
  nome?: string;
  quantidade: number;
  unidade?: string;
  lote?: string;
  qtySolicitada: number;
}

interface HistoricoPedido {
  id: number;
  inventario?: { nome: string };
  item_nome?: string;
  created_at: string;
  status: string;
  quantidade: number;
}

const estoque = ref<ItemEstoque[]>([]);
const historico = ref<HistoricoPedido[]>([]);
const loading = ref(true);
const termoBusca = ref('');

const mockEstoque = [
  { id: 1, item: 'Luva Látex (Tam. M)', quantidade: 2, unidade: 'Cx. 100un', lote: '2901', qtySolicitada: 1 },
  { id: 2, item: 'Seringa 5ml Descartável', quantidade: 10, unidade: 'Pct 50un', lote: '8821', qtySolicitada: 1 },
  { id: 3, item: 'Máscara Cirúrgica N95', quantidade: 45, unidade: 'Unidade', lote: '1102', qtySolicitada: 1 },
  { id: 4, item: 'Papel Lençol Hospitalar', quantidade: 12, unidade: 'Rolo 50m', lote: '3321', qtySolicitada: 1 },
];

const carregarDados = async () => {
  loading.value = true;
  try {
    const resEstoque = await api.get('/inventario');

    if (resEstoque.data && resEstoque.data.length > 0) {
      estoque.value = resEstoque.data.map((i: any) => ({
        ...i,
        item: i.nome || i.item,
        qtySolicitada: 1
      }));
    } else {
      estoque.value = mockEstoque;
    }

    const resHistorico = await api.get('/pedidos-reposicao');
    historico.value = resHistorico.data;

  } catch (error) {
    console.error("Erro ao carregar dados (API pode estar offline ou rota inexistente). Usando fallback visual.", error);
    estoque.value = mockEstoque;
  } finally {
    loading.value = false;
  }
};

const estoqueFiltrado = computed(() => {
  if (!termoBusca.value) return estoque.value;
  return estoque.value.filter(i =>
    (i.item || '').toLowerCase().includes(termoBusca.value.toLowerCase())
  );
});

const getEstoqueStatus = (qtd: number) => {
  if (qtd <= 5) return { label: `Crítico (${qtd}un)`, class: 'tag-critico' };
  if (qtd <= 15) return { label: `Baixo (${qtd}un)`, class: 'tag-baixo' };
  return { label: `Normal (${qtd}un)`, class: 'tag-normal' };
};

const incrementar = (item: ItemEstoque) => { item.qtySolicitada++; };
const decrementar = (item: ItemEstoque) => { if (item.qtySolicitada > 1) item.qtySolicitada--; };

const solicitarItem = async (item: ItemEstoque) => {
  try {
    await api.post('/pedidos-reposicao', {
      inventarioId: item.id,
      quantidade: item.qtySolicitada
    });

    alert(`Solicitação de ${item.qtySolicitada}x ${item.item} enviada com sucesso!`);
    carregarDados();
  } catch (error: any) {
    console.error(error);
    const msg = error.response?.data?.message || 'Erro ao solicitar reposição.';
    alert(msg);
  }
};

const dataFormatada = (data: string) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const statusClass = (status: string) => {
  if (status === 'aprovado') return 'text-aprovado';
  if (status === 'rejeitado') return 'text-rejeitado';
  return 'text-pendente';
};

const getNomeItemHistorico = (ped: any) => {
  return ped.inventario?.nome || ped.item_nome || 'Item do Estoque';
}

onMounted(() => {
  carregarDados();
});
</script>

<template>
  <DashboardLayout>
    <div class="page-container">

      <div class="header-section">
        <div>
          <h2 class="page-title">Solicitar Estoque</h2>
          <p class="subtitle">Estoque / <span class="highlight">Solicitar Reposição</span></p>
        </div>
      </div>

      <div class="main-layout">

        <div class="panel catalog-panel">
          <div class="panel-header">
            <h3>Catálogo de Insumos</h3>
            <button class="btn-outline">Relatar item novo</button>
          </div>

          <div class="search-box">
            <input type="text" v-model="termoBusca" placeholder="Busca por nome, lote ou categoria" />
            <button class="search-btn">🔍</button>
          </div>

          <div class="table-header">
            <span class="col-item">ITEM</span>
            <span class="col-stock">ESTOQUE ATUAL</span>
            <span class="col-qty">QUANTIDADE</span>
            <span class="col-action">AÇÃO</span>
          </div>

          <div v-if="loading && estoque.length === 0" class="loading-state">Carregando catálogo...</div>

          <div v-else class="items-list">
            <div v-for="item in estoqueFiltrado" :key="item.id" class="item-row">

              <div class="col-item info">
                <span class="item-name">{{ item.item }}</span>
                <span class="item-desc">{{ item.unidade || 'Unidade' }} • Lote {{ item.lote || 'N/A' }}</span>
              </div>

              <div class="col-stock">
                <span :class="['status-badge', getEstoqueStatus(item.quantidade).class]">
                  ● {{ getEstoqueStatus(item.quantidade).label }}
                </span>
              </div>

              <div class="col-qty counter-wrapper">
                <button @click="decrementar(item)" class="btn-count">-</button>
                <input type="number" v-model="item.qtySolicitada" readonly />
                <button @click="incrementar(item)" class="btn-count">+</button>
              </div>

              <div class="col-action">
                <button @click="solicitarItem(item)" class="btn-request">Solicitar</button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel history-panel">
          <h3>Histórico Recente</h3>

          <div v-if="historico.length === 0" class="empty-history">
            Sem pedidos recentes.
          </div>

          <div v-else class="history-list">
            <div v-for="ped in historico" :key="ped.id" class="history-item">
              <div class="icon-box">🕒</div>
              <div class="history-info">
                <span class="history-name">{{ ped.quantidade }}x {{ getNomeItemHistorico(ped) }}</span>
                <span class="history-date">{{ dataFormatada(ped.created_at) }}</span>
              </div>
              <span :class="['history-status', statusClass(ped.status)]">
                {{ ped.status ? ped.status.toUpperCase() : 'PENDENTE' }}
              </span>
            </div>
          </div>

          <a href="#" class="link-see-all">Ver todos os pedidos →</a>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-container {
  padding: 30px;
  font-family: 'Montserrat', sans-serif;
  color: #4b5563;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  color: #2dd4bf;
  font-weight: 800;
  font-size: 1.8rem;
  margin: 0;
}

.subtitle {
  color: #9ca3af;
  font-size: 0.9rem;
  margin-top: 5px;
}

.highlight {
  color: #2dd4bf;
  font-weight: bold;
}

.main-layout {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 25px;
}

.panel {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  font-size: 1.1rem;
  color: #374151;
  font-weight: 700;
  margin: 0;
}

.btn-outline {
  border: 1px solid #2dd4bf;
  color: #2dd4bf;
  background: none;
  padding: 6px 15px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
}

.search-box {
  display: flex;
  margin-bottom: 25px;
}

.search-box input {
  flex: 1;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px 0 0 8px;
  outline: none;
  font-family: 'Montserrat';
  font-size: 0.9rem;
}

.search-box input:focus {
  border-color: #2dd4bf;
}

.search-btn {
  background: #2dd4bf;
  border: none;
  padding: 0 20px;
  border-radius: 0 8px 8px 0;
  color: white;
  cursor: pointer;
}

.table-header {
  display: grid;
  grid-template-columns: 3fr 1.5fr 1.5fr 1fr;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 15px;
}

.item-row {
  display: grid;
  grid-template-columns: 3fr 1.5fr 1.5fr 1fr;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 700;
  color: #374151;
  font-size: 0.95rem;
}

.item-desc {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 3px;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  display: inline-block;
}

.tag-critico {
  background: #fef2f2;
  color: #ef4444;
}

.tag-baixo {
  background: #fefce8;
  color: #eab308;
}

.tag-normal {
  background: #f0fdf4;
  color: #22c55e;
}

.counter-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-count {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 4px;
  cursor: pointer;
  color: #374151;
  font-weight: bold;
}

.counter-wrapper input {
  width: 35px;
  text-align: center;
  border: none;
  font-weight: bold;
  color: #374151;
  outline: none;
}

.btn-request {
  background: white;
  border: 1px solid #2dd4bf;
  color: #2dd4bf;
  padding: 8px 15px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.btn-request:hover {
  background: #2dd4bf;
  color: white;
}

.history-panel h3 {
  font-size: 1rem;
  color: #374151;
  margin-bottom: 20px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.icon-box {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
}

.history-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.history-status {
  font-size: 0.7rem;
  font-weight: 800;
}

.text-pendente {
  color: #f59e0b;
}

.text-aprovado {
  color: #10b981;
}

.text-rejeitado {
  color: #ef4444;
}

.link-see-all {
  display: block;
  text-align: center;
  margin-top: 20px;
  color: #2dd4bf;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
}

.empty-history {
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
  margin-top: 20px;
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}
</style>
