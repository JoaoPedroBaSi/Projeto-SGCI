<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const cobrancas = ref<any[]>([]);
const historico = ref<any[]>([]);
const metodoSelecionado = ref('PIX');
const itemSelecionadoParaPagar = ref<any>(null);
const isLoading = ref(false);

const carregarDados = async () => {
  isLoading.value = true;
  try {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const meuId = Number(userData.id || userData.profissionalId);

    console.log("Meu ID:", meuId);

    const response = await api.get('/transacao');

    const todas = Array.isArray(response.data) ? response.data : (response.data.data || []);

    console.log("Todas as transações:", todas);

    const minhas = todas.filter((t: any) => {
      const transacaoUserId = Number(t.userId || t.user_id || t.profissional_id || t.profissionalId);
      return transacaoUserId === meuId;
    });

    cobrancas.value = minhas.filter((t: any) => {
      const status = (t.status || '').toUpperCase();
      const isPendente = ['PENDENTE', 'ABERTO', 'AGUARDANDO', 'ATRASADO'].includes(status);

      return isPendente;
    });

    historico.value = minhas.filter((t: any) => {
      const status = (t.status || '').toUpperCase();
      return ['PAGO', 'CONCLUIDO', 'CANCELADO'].includes(status);
    });

    if (cobrancas.value.length > 0 && !itemSelecionadoParaPagar.value) {
      itemSelecionadoParaPagar.value = cobrancas.value[0];
    }

  } catch (error) {
    console.error("Erro ao buscar finanças:", error);
    alert("Erro ao carregar lista de pagamentos.");
  } finally {
    isLoading.value = false;
  }
};

const confirmarPagamento = async () => {
  if (!itemSelecionadoParaPagar.value) return alert('Selecione uma cobrança.');

  isLoading.value = true;
  try {
    const item = itemSelecionadoParaPagar.value;
    const profId = item.userId || item.user_id || item.profissionalId || item.profissional_id;

    await api.post('/pagamento/processar', {
      profissionalId: profId,
      valor: item.valor,
      formaPagamento: metodoSelecionado.value,
      transacaoId: item.id
    });

    alert(`Pagamento confirmado com sucesso via ${metodoSelecionado.value}!`);

    itemSelecionadoParaPagar.value = null;
    await carregarDados();

  } catch (error: any) {
    console.error(error);
    const msg = error.response?.data?.message || 'Erro ao processar pagamento.';
    alert(msg);
  } finally {
    isLoading.value = false;
  }
};

const totalPendente = computed(() => {
  return cobrancas.value.reduce((acc, item) => acc + Number(item.valor), 0);
});

const proximoVencimento = computed(() => {
  if (cobrancas.value.length > 0) {
    const data = cobrancas.value[0].createdAt || cobrancas.value[0].created_at;
    return formatDate(data);
  }
  return '--';
});

const selecionarCobranca = (item: any) => {
  itemSelecionadoParaPagar.value = item;
};

const formatMoney = (val: any) => {
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

onMounted(() => {
  carregarDados();
});
</script>

<template>
  <DashboardLayout>
    <div class="financeiro-layout">

      <div class="header-area">
        <h1 class="page-title">Pagamento de Salas</h1>
        <span class="breadcrumb">Finanças / <span class="active">Pagar Aluguel</span></span>
      </div>

      <div class="resumo-top">
        <div class="card-resumo">
          <div class="icon-circle red">💰</div>
          <div>
            <span class="label">TOTAL PENDENTE</span>
            <h3 class="valor red">{{ formatMoney(totalPendente) }}</h3>
          </div>
        </div>
        <div class="card-resumo">
          <div class="icon-circle orange">📅</div>
          <div>
            <span class="label">PRÓXIMO VENCIMENTO</span>
            <h3 class="valor orange">{{ proximoVencimento }}</h3>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="left-column">
          <h3 class="section-title">Cobranças em Aberto</h3>

          <div v-if="isLoading && cobrancas.length === 0" class="text-muted">Carregando...</div>
          <div v-else-if="cobrancas.length === 0" class="empty-state">
            Nenhuma cobrança pendente.
          </div>

          <div v-for="item in cobrancas" :key="item.id" class="cobranca-card"
            :class="{ 'selected': itemSelecionadoParaPagar?.id === item.id }" @click="selecionarCobranca(item)">
            <div class="cobranca-info">
              <h4>{{ item.finalidade || item.descricao || 'Pagamento Pendente' }}</h4>
              <span class="ref">Data: {{ formatDate(item.createdAt || item.created_at) }}</span>
              <span class="badge bg-red">PENDENTE</span>
            </div>
            <div class="cobranca-valor">
              <h3>{{ formatMoney(item.valor) }}</h3>
            </div>
          </div>

          <h3 class="section-title mt-4">Histórico Recente</h3>
          <div v-if="historico.length === 0" class="text-muted">Sem histórico recente.</div>

          <div v-for="hist in historico" :key="hist.id" class="historico-item">
            <div class="hist-info">
              <span class="hist-desc">{{ hist.finalidade || hist.descricao }}</span>
              <span class="hist-ref">Status: {{ hist.status }} - {{ formatDate(hist.updatedAt || hist.updated_at)
              }}</span>
            </div>
            <div class="hist-valor">
              {{ formatMoney(hist.valor) }}
              <div class="icon-file">📄</div>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="checkout-card" v-if="itemSelecionadoParaPagar">
            <h3>{{ itemSelecionadoParaPagar.finalidade || itemSelecionadoParaPagar.descricao }}</h3>
            <p class="total-pagar">Total a pagar: <strong>{{ formatMoney(itemSelecionadoParaPagar.valor) }}</strong></p>

            <div class="metodos-pagamento">
              <button class="btn-metodo" :class="{ active: metodoSelecionado === 'CARTAO' }"
                @click="metodoSelecionado = 'CARTAO'">
                💳<br>Cartão
              </button>
              <button class="btn-metodo" :class="{ active: metodoSelecionado === 'PIX' }"
                @click="metodoSelecionado = 'PIX'">
                💠<br>PIX
              </button>
              <button class="btn-metodo" :class="{ active: metodoSelecionado === 'BOLETO' }"
                @click="metodoSelecionado = 'BOLETO'">
                📄<br>Boleto
              </button>
            </div>

            <div v-if="metodoSelecionado === 'PIX'" class="pix-area">
              <div class="qr-placeholder">QR CODE</div>
              <p class="pix-instrucao">Escaneie o QR Code acima para pagar.</p>
              <div class="copy-paste">
                <input type="text" value="00020126580014BR.GOV.BCB.PIX..." readonly>
                <button>Copiar</button>
              </div>
            </div>

            <div v-if="metodoSelecionado === 'CARTAO'" class="cartao-area">
              <input type="text" placeholder="Número do Cartão" class="input-flat">
              <div class="row">
                <input type="text" placeholder="Validade" class="input-flat">
                <input type="text" placeholder="CVV" class="input-flat">
              </div>
              <input type="text" placeholder="Nome no Cartão" class="input-flat">
            </div>

            <button class="btn-confirmar" @click="confirmarPagamento" :disabled="isLoading">
              {{ isLoading ? 'Processando...' : 'Confirmar Pagamento' }}
            </button>
          </div>

          <div v-else class="checkout-card empty">
            <p>Selecione uma conta ao lado para pagar.</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.financeiro-layout {
  padding: 30px;
  font-family: 'Montserrat', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-area {
  margin-bottom: 25px;
}

.page-title {
  color: #117a8b;
  font-size: 1.8rem;
  font-weight: 700;
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

.resumo-top {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.card-resumo {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.icon-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.icon-circle.red {
  background: #fee2e2;
  color: #dc2626;
}

.icon-circle.orange {
  background: #ffedd5;
  color: #ea580c;
}

.label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 700;
}

.valor {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.valor.red {
  color: #dc2626;
}

.valor.orange {
  color: #ea580c;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
}

.section-title {
  font-size: 1rem;
  color: #334155;
  margin-bottom: 15px;
  font-weight: 700;
}

.cobranca-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  cursor: pointer;
  transition: 0.2s;
  border-left: 4px solid transparent;
}

.cobranca-card:hover {
  border-color: #94a3b8;
}

.cobranca-card.selected {
  border-left-color: #117a8b;
  background-color: #f0fdfa;
  border-color: #2dd4bf;
}

.cobranca-info h4 {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 1rem;
}

.ref {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 8px;
}

.badge {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
}

.bg-red {
  background: #fee2e2;
  color: #991b1b;
}

.cobranca-valor {
  text-align: right;
}

.cobranca-valor h3 {
  margin: 0;
  color: #1e293b;
}

.text-muted {
  color: #94a3b8;
  font-size: 0.9rem;
  font-style: italic;
}

.historico-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  opacity: 0.7;
}

.hist-desc {
  display: block;
  font-weight: 600;
  color: #94a3b8;
}

.hist-ref {
  font-size: 0.75rem;
  color: #166534;
}

.hist-valor {
  font-weight: 700;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-file {
  cursor: pointer;
  color: #117a8b;
}

.right-column {
  position: sticky;
  top: 20px;
}

.checkout-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.checkout-card.empty {
  text-align: center;
  color: #94a3b8;
  padding: 50px;
  border: 2px dashed #e2e8f0;
}

.checkout-card h3 {
  margin-top: 0;
  font-size: 1.1rem;
}

.total-pagar {
  font-size: 0.9rem;
  color: #334155;
  margin-bottom: 25px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
}

.metodos-pagamento {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.btn-metodo {
  flex: 1;
  padding: 15px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  color: #64748b;
  font-size: 0.8rem;
}

.btn-metodo.active {
  border-color: #2dd4bf;
  background: #f0fdfa;
  color: #117a8b;
  font-weight: 700;
}

.btn-metodo:hover {
  border-color: #cbd5e1;
}

.pix-area {
  text-align: center;
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.qr-placeholder {
  background: #e0f2fe;
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0284c7;
  font-weight: 700;
  font-size: 0.8rem;
}

.pix-instrucao {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 10px;
}

.copy-paste {
  display: flex;
  gap: 5px;
}

.copy-paste input {
  flex: 1;
  font-size: 0.7rem;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: white;
  color: #64748b;
}

.copy-paste button {
  background: #117a8b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 10px;
  cursor: pointer;
  font-size: 0.7rem;
}

.cartao-area {
  margin-bottom: 20px;
}

.input-flat {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.row {
  display: flex;
  gap: 10px;
}

.btn-confirmar {
  width: 100%;
  padding: 15px;
  background: #2dd4bf;
  color: white;
  font-weight: 800;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s;
  text-transform: uppercase;
}

.btn-confirmar:hover {
  background: #14b8a6;
}

.btn-confirmar:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.mt-4 {
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 20px;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .right-column {
    position: static;
  }
}
</style>
