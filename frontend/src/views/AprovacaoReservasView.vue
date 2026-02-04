<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const activeTab = ref<'pendentes' | 'historico'>('pendentes');
const reservas = ref<any[]>([]);
const isLoading = ref(true);

const fetchReservas = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/reserva');
    reservas.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
  } finally {
    isLoading.value = false;
  }
};

const pendentes = computed(() => {
  return reservas.value.filter(r => (r.status || '').toUpperCase() === 'PENDENTE');
});

const historico = computed(() => {
  return reservas.value.filter(r => (r.status || '').toUpperCase() !== 'PENDENTE');
});

const atualizarStatus = async (id: number, novoStatus: 'APROVADA' | 'REJEITADO') => {
  const acao = novoStatus === 'APROVADA' ? 'APROVAR' : 'REJEITAR';
  if (!confirm(`Confirma ${acao} esta reserva?`)) return;

  try {
    await api.put(`/reserva/${id}`, { status: novoStatus });

    alert(`Reserva ${novoStatus === 'APROVADA' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    fetchReservas();
  } catch (error) {
    console.error(error);
    alert('Erro ao atualizar status. Tente novamente.');
  }
};

const formatMoney = (val: any) => {
  if (val === undefined || val === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchReservas();
});
</script>

<template>
  <DashboardLayout>
    <div class="page-content">
      <div class="header-section">
        <div class="header-left">
          <h1 class="page-title">Gerenciamento de Salas</h1>
          <span class="breadcrumb">Recursos / <span class="active">Aprovar Reservas</span></span>
        </div>
      </div>

      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'pendentes' }" @click="activeTab = 'pendentes'">
          Solicitações Pendentes
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'historico' }" @click="activeTab = 'historico'">
          Histórico & Recibos
        </button>
        <div class="tab-line"></div>
      </div>

      <div v-if="activeTab === 'pendentes'" class="tab-content">
        <div class="card-white">
          <div class="card-header">
            <h3>Aguardando Aprovação <span class="badge-count">{{ pendentes.length }}</span></h3>
          </div>

          <div class="table-responsive">
            <table class="styled-table">
              <thead>
                <tr>
                  <th>PROFISSIONAL</th>
                  <th>SALA SOLICITADA</th>
                  <th>DATA / HORÁRIO</th>
                  <th>VALOR TOTAL</th>
                  <th>STATUS</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in pendentes" :key="item.id">
                  <td>
                    <div class="user-info">
                      <div class="avatar-circle">{{ item.profissional?.nome?.charAt(0) || 'U' }}</div>
                      <div>
                        <strong>{{ item.profissional?.nome || 'Usuário' }}</strong>
                        <span class="sub-text">Profissional</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ item.sala?.nome || 'Sala Indisponível' }}</td>
                  <td>{{ formatDate(item.dataHoraInicio) }}</td>
                  <td><strong>{{ formatMoney(item.valorTotal) }}</strong></td>
                  <td><span class="status-badge yellow">PENDENTE</span></td>
                  <td class="actions-cell">
                    <button class="btn-reject" @click="atualizarStatus(item.id, 'REJEITADO')">✖ Rejeitar</button>
                    <button class="btn-approve" @click="atualizarStatus(item.id, 'APROVADA')">✔ Aprovar</button>
                  </td>
                </tr>
                <tr v-if="pendentes.length === 0">
                  <td colspan="6" class="empty-state">
                    {{ isLoading ? 'Carregando...' : 'Nenhuma solicitação pendente.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'historico'" class="tab-content">
        <div class="card-white">
          <div class="card-header">
            <h3>Histórico Recente</h3>
          </div>

          <div class="table-responsive">
            <table class="styled-table">
              <thead>
                <tr>
                  <th>PROFISSIONAL</th>
                  <th>SALA SOLICITADA</th>
                  <th>DATA / HORÁRIO</th>
                  <th>VALOR</th>
                  <th>STATUS</th>
                  <th>DETALHES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in historico" :key="item.id">
                  <td>
                    <div class="user-info">
                      <div class="avatar-circle gray">{{ item.profissional?.nome?.charAt(0) || 'U' }}</div>
                      <div>
                        <strong>{{ item.profissional?.nome || 'Usuário' }}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{{ item.sala?.nome || 'Sala' }}</td>
                  <td>{{ formatDate(item.dataHoraInicio) }}</td>
                  <td>{{ formatMoney(item.valorTotal) }}</td>
                  <td>
                    <span class="status-badge"
                      :class="item.status === 'APROVADA' ? 'green' : (item.status === 'REJEITADO' ? 'red' : 'yellow')">
                      {{ item.status }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-outline">Ver Detalhes</button>
                  </td>
                </tr>
                <tr v-if="historico.length === 0">
                  <td colspan="6" class="empty-state">Histórico vazio.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-content {
  padding: 30px;
  font-family: 'Montserrat', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 30px;
}

.page-title {
  color: #117a8b;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
}

.breadcrumb {
  color: #64748b;
  font-size: 0.9rem;
}

.active {
  color: #117a8b;
  font-weight: 600;
}

.tabs {
  display: flex;
  gap: 30px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 30px;
  position: relative;
}

.tab-btn {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #94a3b8;
  padding-bottom: 10px;
  cursor: pointer;
  position: relative;
  transition: 0.3s;
}

.tab-btn:hover {
  color: #117a8b;
}

.tab-btn.active {
  color: #117a8b;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #117a8b;
  border-radius: 3px 3px 0 0;
}

.card-white {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
}

.card-header h3 {
  color: #334155;
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge-count {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
}

.table-responsive {
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.styled-table th {
  text-align: left;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 15px 10px;
  border-bottom: 1px solid #e2e8f0;
}

.styled-table td {
  padding: 15px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  font-size: 0.9rem;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 35px;
  height: 35px;
  background: #e0f2fe;
  color: #0ea5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.avatar-circle.gray {
  background: #f1f5f9;
  color: #64748b;
}

.sub-text {
  font-size: 0.75rem;
  color: #94a3b8;
  display: block;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.yellow {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.green {
  background: #dcfce7;
  color: #166534;
}

.status-badge.red {
  background: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  display: flex;
  gap: 10px;
}

.btn-reject {
  background: #fee2e2;
  color: #991b1b;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
  transition: 0.2s;
}

.btn-reject:hover {
  background: #fecaca;
}

.btn-approve {
  background: #dcfce7;
  color: #166534;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
  transition: 0.2s;
}

.btn-approve:hover {
  background: #bbf7d0;
}

.btn-outline {
  border: 1px solid #cbd5e1;
  background: white;
  color: #64748b;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-outline:hover {
  background-color: #f8fafc;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 30px;
  font-style: italic;
}
</style>
