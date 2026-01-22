<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { ref, onMounted, computed } from 'vue';
// CORREÇÃO 1: Usando a instância configurada da API (funciona no Render)
import api from '@/services/api';

const isLoading = ref(true);
const transacoes = ref<any[]>([]);

// Variável para DEBUG (ver o que chegou no console/tela)
const debugInfo = ref('');

const fetchFinanceiro = async () => {
    isLoading.value = true;
    try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const meuId = Number(userData.id); 
        
        console.log("=== DEBUG FINANCEIRO ===");
        console.log("Meu ID:", meuId);

        // CORREÇÃO 2: Chamada limpa usando api.get (já vai com token e URL certa)
        const response = await api.get('/transacao');
        const todas = response.data;
        
        console.log("Dados brutos do banco:", todas);

        // FILTRO INTELIGENTE
        transacoes.value = todas.filter((t: any) => {
            // Tenta ler userId (camelCase) ou user_id (snake_case)
            const idTransacao = Number(t.userId || t.user_id);
            return idTransacao === meuId;
        });

        // Debug visual se a lista estiver vazia
        if (transacoes.value.length === 0) {
            debugInfo.value = `O banco retornou ${todas.length} registros no total. Nenhum pertence ao ID ${meuId}.`;
        }

    } catch (error) {
        console.error("Erro ao carregar financeiro:", error);
    } finally {
        isLoading.value = false;
    }
};

// COMPUTEDS (Separa o que é dívida do que é histórico)
const contasAPagar = computed(() => {
    return transacoes.value.filter(t => {
        const st = (t.status || '').toUpperCase();
        const tp = (t.tipo || '').toUpperCase();
        // Só mostra se for SAIDA e estiver PENDENTE
        return st === 'PENDENTE' && tp === 'SAIDA';
    });
});

const historico = computed(() => {
    return transacoes.value.filter(t => {
        const st = (t.status || '').toUpperCase();
        // Mostra tudo que NÃO está pendente (Concluído, Cancelado, etc)
        return st !== 'PENDENTE';
    });
});

const pagarConta = async (transacao: any) => {
    if(!confirm(`Confirmar pagamento de R$ ${transacao.valor}?`)) return;

    try {
        // Tenta pegar o ID do profissional de várias formas
        const profId = transacao.profissionalId || transacao.profissional_id || transacao.user_id;

        await api.post('/pagamento/processar', {
            profissionalId: profId, 
            valor: transacao.valor,
            formaPagamento: 'PIX'
        });

        alert('Pagamento processado com sucesso!');
        // Atualiza a lista para sumir das pendências
        fetchFinanceiro();
        
    } catch (error) {
        console.error(error);
        alert('Erro ao processar pagamento. Tente novamente.');
    }
};

// Helper de Data
const formatarData = (dataIso: string) => {
    if (!dataIso) return '--/--/----';
    return new Date(dataIso).toLocaleDateString('pt-BR');
}

onMounted(() => {
    fetchFinanceiro();
});
</script>

<template>
    <DashboardLayout>
        <div class="page-content">
            <h1 class="page-title">Financeiro</h1>

            <div class="section-block">
                <h3 class="section-title text-red">🔻 Contas a Pagar</h3>
                
                <div v-if="isLoading" class="loading">Carregando financeiro...</div>
                
                <div v-else-if="contasAPagar.length === 0" class="empty-state">
                    <p>Nenhuma conta pendente.</p>
                    <small v-if="debugInfo" style="color: gray; display: block; margin-top: 10px;">
                        Debug: {{ debugInfo }}
                    </small>
                </div>

                <div v-else class="grid-cards">
                    <div v-for="item in contasAPagar" :key="item.id" class="card-divida">
                        <div class="info">
                            <h4>{{ item.finalidade || item.descricao || 'Pagamento Pendente' }}</h4>
                            <span class="data">Vencimento: {{ formatarData(item.createdAt || item.created_at) }}</span>
                        </div>
                        <div class="valor-box">
                            <span class="valor">R$ {{ Number(item.valor).toFixed(2) }}</span>
                            <button @click="pagarConta(item)" class="btn-pagar">
                                PAGAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <hr class="divider">

            <div class="section-block">
                <h3 class="section-title text-gray">📜 Histórico de Movimentações</h3>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in historico" :key="item.id">
                                <td>{{ formatarData(item.createdAt || item.created_at) }}</td>
                                <td>{{ item.finalidade || item.descricao || 'Transação' }}</td>
                                <td>
                                    <span :class="(item.tipo || '').toUpperCase() === 'ENTRADA' ? 'tag-green' : 'tag-red'">
                                        {{ item.tipo }}
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge" :class="item.status">{{ item.status }}</span>
                                </td>
                                <td><strong>R$ {{ Number(item.valor).toFixed(2) }}</strong></td>
                            </tr>
                            <tr v-if="historico.length === 0">
                                <td colspan="5" class="text-center">Nenhum histórico disponível.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </DashboardLayout>
</template>

<style scoped>
.page-content { padding: 30px; font-family: 'Montserrat', sans-serif; color: #334155; }
.page-title { color: #117a8b; font-size: 1.8rem; font-weight: 800; margin-bottom: 30px; }
.section-title { font-size: 1.2rem; margin-bottom: 20px; font-weight: 700; }
.text-red { color: #ef4444; }
.text-gray { color: #64748b; }
.divider { border: 0; border-top: 1px solid #e2e8f0; margin: 40px 0; }

/* Cards de Dívida */
.grid-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.card-divida { background: white; border-left: 5px solid #ef4444; border-radius: 10px; padding: 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.card-divida h4 { margin: 0; color: #334155; font-size: 1rem; }
.card-divida .data { font-size: 0.8rem; color: #94a3b8; display: block; margin-top: 5px; }

.valor-box { text-align: right; }
.valor { font-size: 1.2rem; font-weight: 800; color: #ef4444; display: block; margin-bottom: 8px; }

.btn-pagar { background-color: #ef4444; color: white; border: none; padding: 8px 20px; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 0.8rem; }
.btn-pagar:hover { background-color: #dc2626; transform: scale(1.05); }

/* Tabela */
.table-container { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 15px; border-bottom: 2px solid #f1f5f9; color: #117a8b; font-size: 0.85rem; text-transform: uppercase; }
td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; vertical-align: middle; }
.text-center { text-align: center; color: #94a3b8; padding: 30px; }

/* Tags */
.tag-green { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
.tag-red { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }

.status-badge { background: #f3f4f6; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-badge.CONCLUIDA { background: #d1fae5; color: #065f46; }
.status-badge.PENDENTE { background: #ffedd5; color: #9a3412; }

.loading { text-align: center; font-size: 1.1rem; color: #117a8b; padding: 20px; font-weight: bold; }
.empty-state { text-align: center; background: #f8fafc; padding: 30px; border-radius: 10px; border: 2px dashed #e2e8f0; color: #64748b; }
</style>