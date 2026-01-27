<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

// Interfaces
interface User { email: string; }
interface Funcao { nome: string; }
interface Profissional {
    id: number;
    nome: string;
    cpf?: string;
    telefone?: string;
    registro_conselho?: string;
    conselho_uf?: string;
    biografia?: string;
    status: string;
    created_at: string;
    dataNascimento?: string;
    genero?: string;
    user: User;
    funcao: Funcao;
}

interface Atendimento {
    id: number;
    data_hora_inicio: string; // <-- CORRIGIDO AQUI PARA O NOME DO BANCO
    status: string;
    cliente?: { nome: string }; // Suponto que o back traga o cliente
    tipo?: string;
    profissional_id?: number;
}

// Estados
const profissionais = ref<Profissional[]>([]);
const historicoConsultas = ref<Atendimento[]>([]);
const loading = ref(true);
const loadingHistorico = ref(false);
const termoBusca = ref('');

// Controle de Modais
const modalDetalhesAberto = ref(false);
const profissionalSelecionado = ref<Profissional | null>(null);

// Formatador de Data
const formatarData = (dataIso: string) => {
    if (!dataIso) return '--/--/----';
    return new Date(dataIso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// Computada: Filtro de Busca
const profissionaisFiltrados = computed(() => {
    if (!termoBusca.value) return profissionais.value;
    const termo = termoBusca.value.toLowerCase();
    return profissionais.value.filter(p => 
        p.nome.toLowerCase().includes(termo) || 
        p.user?.email.toLowerCase().includes(termo)
    );
});

// Buscar Profissionais (ATIVOS/APROVADOS)
const carregarProfissionais = async () => {
    loading.value = true;
    try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('https://sgci-api.onrender.com/profissionais', {
            headers: { Authorization: `Bearer ${token}` }
        });
        profissionais.value = response.data.filter((p: Profissional) => p.status === 'aprovado');
    } catch (error) {
        console.error("Erro ao carregar profissionais:", error);
    } finally {
        loading.value = false;
    }
}

// Buscar Histórico do Profissional
const carregarHistorico = async (profId: number) => {
    loadingHistorico.value = true;
    historicoConsultas.value = [];
    try {
        const token = localStorage.getItem('auth_token');
        // Tenta buscar todos os atendimentos e filtrar no front (solução temporária)
        // O ideal seria um endpoint /profissionais/:id/atendimentos no back
        const response = await axios.get('https://sgci-api.onrender.com/atendimento', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filtra apenas os atendimentos deste médico
        // NOTA: Se o endpoint /atendimento bloquear Admin, precisaremos ajustar o Backend.
        if (Array.isArray(response.data)) {
            historicoConsultas.value = response.data.filter((a: any) => a.profissionalId === profId || a.profissional_id === profId);
        }
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        // Não mostra alerta para não travar a tela, apenas loga
    } finally {
        loadingHistorico.value = false;
    }
}

// === AÇÕES ===

const abrirHistorico = (prof: Profissional) => {
    profissionalSelecionado.value = prof;
    modalDetalhesAberto.value = true;
    carregarHistorico(prof.id); // Chama a busca ao abrir
}

const desativarProfissional = async (prof: Profissional) => {
    if (!confirm(`Tem certeza que deseja DESATIVAR o acesso de ${prof.nome}?`)) return;

    try {
        const token = localStorage.getItem('auth_token');
        await axios.patch(`https://sgci-api.onrender.com/profissionais/${prof.id}/status`, {
            status: 'rejeitado', 
            observacoes_admin: 'Desativado pelo Gerenciador.'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        alert('Profissional desativado com sucesso! 🚫');
        carregarProfissionais();
    } catch (error) {
        console.error(error);
        alert("Erro ao desativar.");
    }
}

const fecharModal = () => {
    modalDetalhesAberto.value = false;
    profissionalSelecionado.value = null;
    historicoConsultas.value = [];
}

onMounted(() => {
    carregarProfissionais();
});
</script>

<template>
    <DashboardLayout>
        <div class="page-container">
            <h2 class="page-title">Gerenciar Usuários</h2>

            <div class="search-area">
                <input 
                    type="text" 
                    v-model="termoBusca" 
                    placeholder="Digite o nome do usuário..." 
                    class="search-input"
                />
            </div>

            <div v-if="loading" class="loading">Carregando usuários...</div>

            <div v-else-if="profissionaisFiltrados.length === 0" class="empty-state">
                <p>Nenhum profissional ativo encontrado.</p>
            </div>

            <div v-else class="cards-grid">
                <div v-for="prof in profissionaisFiltrados" :key="prof.id" class="card-user">
                    <div class="card-content">
                        <div class="user-avatar">
                            <div class="avatar-circle">
                                <span class="avatar-initial">{{ prof.nome.charAt(0) }}</span>
                            </div>
                        </div>
                        <div class="user-info">
                            <h3 class="user-name">{{ prof.nome }}</h3>
                            <span class="user-role">Função: {{ prof.funcao?.nome || 'MÉDICO' }}</span>
                            <span class="user-detail">E-Mail: {{ prof.user?.email }}</span>
                            <span class="user-detail">Telefone: {{ prof.telefone || '---' }}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button @click="desativarProfissional(prof)" class="btn btn-desativar">
                            Desativar Profissional
                        </button>
                        <button @click="abrirHistorico(prof)" class="btn btn-historico">
                            Visualizar Histórico
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="modalDetalhesAberto && profissionalSelecionado" class="modal-overlay" @click.self="fecharModal">
                <div class="modal-content modal-largo">
                    <button class="btn-close" @click="fecharModal">×</button>
                    <h2 class="modal-title">Histórico: {{ profissionalSelecionado.nome.split(' ')[0] }}</h2>
                    
                    <div class="modal-body-historico">
                        <div v-if="loadingHistorico" class="loading-small">Buscando consultas...</div>
                        
                        <div v-else-if="historicoConsultas.length === 0" class="empty-history">
                            <p>Nenhuma consulta encontrada para este profissional.</p>
                        </div>

                        <div v-else class="table-container">
                            <table class="history-table">
                                <thead>
                                    <tr>
                                        <th>Data/Hora</th>
                                        <th>Paciente</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="consulta in historicoConsultas" :key="consulta.id">
                                        <td>{{ formatarData(consulta.data_hora_inicio) }}</td>
                                        <td>{{ consulta.cliente?.nome || 'Cliente Removido' }}</td>
                                        <td>
                                            <span class="status-badge" :class="consulta.status.toLowerCase()">
                                                {{ consulta.status }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </DashboardLayout>
</template>

<style scoped>
.page-container { padding: 40px; font-family: 'Montserrat', sans-serif; color: #4b5563; }
.page-title { color: #117a8b; font-weight: 800; font-size: 1.8rem; margin-bottom: 20px; }

/* SEARCH */
.search-area { margin-bottom: 30px; }
.search-input {
    width: 100%;
    padding: 15px 20px;
    border: 1px solid #2dd4bf;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: box-shadow 0.3s;
}
.search-input:focus { box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2); }

/* GRID */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 25px; }
.card-user { background: white; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: transform 0.2s; }
.card-user:hover { transform: translateY(-2px); box-shadow: 0 10px 15px rgba(0,0,0,0.05); }
.card-content { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }

/* AVATAR */
.avatar-circle { width: 70px; height: 70px; background-color: #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold; }
.user-info { display: flex; flex-direction: column; }
.user-name { color: #117a8b; margin: 0 0 5px 0; font-size: 1.1rem; }
.user-role { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; }
.user-detail { font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px; }

/* ACTIONS */
.card-actions { display: flex; gap: 15px; margin-top: auto; }
.btn { flex: 1; padding: 10px; border: none; border-radius: 20px; font-weight: 600; font-size: 0.85rem; cursor: pointer; color: white; transition: opacity 0.2s; }
.btn:hover { opacity: 0.9; }
.btn-desativar { background-color: #ff5722; }
.btn-historico { background-color: #007bff; }

/* MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 500px; position: relative; max-height: 80vh; display: flex; flex-direction: column; }
.modal-largo { width: 700px; } /* Modal mais largo para a tabela */
.btn-close { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-title { color: #117a8b; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }

/* TABELA DE HISTÓRICO */
.modal-body-historico { flex: 1; overflow-y: auto; }
.table-container { width: 100%; overflow-x: auto; }
.history-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.history-table th { text-align: left; padding: 10px; background-color: #f8fafc; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
.history-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }

/* STATUS BADGES */
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-badge.pendente { background-color: #fef9c3; color: #854d0e; } /* Amarelo */
.status-badge.aprovado, .status-badge.confirmado { background-color: #dcfce7; color: #166534; } /* Verde */
.status-badge.concluido { background-color: #dbeafe; color: #1e40af; } /* Azul */
.status-badge.cancelado, .status-badge.recusado { background-color: #fee2e2; color: #991b1b; } /* Vermelho */

.loading, .loading-small, .empty-state, .empty-history { text-align: center; color: #94a3b8; margin-top: 20px; font-size: 1rem; }
</style>