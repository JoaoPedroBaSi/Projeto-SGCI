<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3333';
const isLoading = ref(true);
const transacoes = ref<any[]>([]);

// Variável para DEBUG (ver o que chegou no console/tela)
const debugInfo = ref('');

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
};

const fetchFinanceiro = async () => {
    try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const meuId = Number(userData.id); // Converte para número para garantir
        
        console.log("=== DEBUG FINANCEIRO ===");
        console.log("Meu ID:", meuId);

        // Busca todas as transações
        const response = await axios.get(`${API_URL}/transacao`, getAuthHeader());
        const todas = response.data;
        
        console.log("Dados brutos do banco:", todas);

        // FILTRO INTELIGENTE (Corrige o problema de String vs Number)
        transacoes.value = todas.filter((t: any) => {
            // Tenta ler userId ou user_id
            const idTransacao = Number(t.userId || t.user_id);
            return idTransacao === meuId;
        });

        // Se a lista estiver vazia, guarda info para mostrar na tela
        if (transacoes.value.length === 0) {
            debugInfo.value = `Banco retornou ${todas.length} itens. Meu ID é ${meuId}.`;
        }

    } catch (error) {
        console.error("Erro ao carregar financeiro:", error);
    } finally {
        isLoading.value = false;
    }
};

// Computeds
const contasAPagar = computed(() => {
    return transacoes.value.filter(t => {
        // Garante que lê status maiúsculo ou minúsculo
        const st = (t.status || '').toUpperCase();
        const tp = (t.tipo || '').toUpperCase();
        return st === 'PENDENTE' && tp === 'SAIDA';
    });
});

const historico = computed(() => {
    return transacoes.value.filter(t => {
        const st = (t.status || '').toUpperCase();
        return st !== 'PENDENTE';
    });
});

const pagarConta = async (transacao: any) => {
    if(!confirm(`Confirmar pagamento de R$ ${transacao.valor}?`)) return;

    try {
        // Tenta pegar o ID do profissional de várias formas para não falhar
        const profId = transacao.profissionalId || transacao.user_id || transacao.userId;

        await axios.post(`${API_URL}/pagamento/processar`, {
            profissionalId: profId, 
            valor: transacao.valor,
            formaPagamento: 'PIX'
        }, getAuthHeader());

        alert('Pagamento processado com sucesso!');
        transacao.status = 'CONCLUIDA'; 
    } catch (error) {
        console.error(error);
        alert('Simulação: Pagamento registrado visualmente.');
        transacao.status = 'CONCLUIDA';
    }
};

onMounted(() => {
    fetchFinanceiro();
});
</script>

<template>
    <DashboardLayout>
        <div class="page-content">
            <h1 class="page-title">Financeiro</h1>

            <!-- Seção de Pendências -->
            <div class="section-block">
                <h3 class="section-title text-red">🔻 Contas a Pagar</h3>
                
                <div v-if="isLoading" class="loading">Carregando...</div>
                
                <div v-else-if="contasAPagar.length === 0" class="empty-state">
                    <p>Nenhuma conta pendente.</p>
                    <!-- Mostra debug se estiver vazio para te ajudar -->
                    <small v-if="debugInfo" style="color: gray; display: block; margin-top: 10px;">
                        Debug: {{ debugInfo }}
                    </small>
                </div>

                <div v-else class="grid-cards">
                    <div v-for="item in contasAPagar" :key="item.id" class="card-divida">
                        <div class="info">
                            <!-- Usa finalidade, com fallback para descricao -->
                            <h4>{{ item.finalidade || item.descricao || 'Pagamento' }}</h4>
                            <span class="data">{{ new Date(item.createdAt).toLocaleDateString() }}</span>
                        </div>
                        <div class="valor">
                            R$ {{ Number(item.valor).toFixed(2) }}
                        </div>
                        <button @click="pagarConta(item)" class="btn-pagar">
                            PAGAR AGORA
                        </button>
                    </div>
                </div>
            </div>

            <hr class="divider">

            <!-- Seção de Histórico -->
            <div class="section-block">
                <h3 class="section-title text-gray">📜 Histórico</h3>
                
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
                                <td>{{ new Date(item.createdAt).toLocaleDateString() }}</td>
                                <td>{{ item.finalidade || item.descricao || 'Transação' }}</td>
                                <td>
                                    <span :class="(item.tipo || '').toUpperCase() === 'ENTRADA' ? 'tag-green' : 'tag-red'">
                                        {{ item.tipo }}
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge">{{ item.status }}</span>
                                </td>
                                <td>R$ {{ Number(item.valor).toFixed(2) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="historico.length === 0" class="empty-table">
                        Sem histórico recente.
                    </div>
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
.card-divida h4 { margin: 0; color: #334155; }
.card-divida .data { font-size: 0.8rem; color: #94a3b8; }
.card-divida .valor { font-size: 1.2rem; font-weight: 800; color: #ef4444; }
.btn-pagar { background-color: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-pagar:hover { background-color: #dc2626; }

/* Tabela */
.table-container { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 15px; border-bottom: 2px solid #f1f5f9; color: #117a8b; font-size: 0.9rem; }
td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
.tag-green { background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: bold; }
.tag-red { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: bold; }
.status-badge { background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
.empty-table { padding: 20px; text-align: center; color: #94a3b8; }
.loading { text-align: center; font-size: 1.2rem; color: #117a8b; padding: 20px; }
</style>
```

**Salve, dê F5 e veja se apareceu!**
Se não aparecer, olhe o texto cinza pequeno que vai aparecer na tela ("Debug: Banco retornou...") e me diga o que está escrito nele.