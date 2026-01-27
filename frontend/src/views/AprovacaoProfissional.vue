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

// Estados
const profissionais = ref<Profissional[]>([]);
const loading = ref(true);
const termoBusca = ref('');

// Controle de Modais
const modalDetalhesAberto = ref(false);
const profissionalSelecionado = ref<Profissional | null>(null);
const textoObservacao = ref('');

// Formatador de Data
const formatarData = (dataIso: string) => {
    if (!dataIso) return 'Data não disponível';
    return new Date(dataIso).toLocaleDateString('pt-BR');
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

// Buscar API (Carrega os ATIVOS/APROVADOS)
const carregarProfissionais = async () => {
    loading.value = true;
    try {
        const token = localStorage.getItem('auth_token');
        // URL da API de Produção
        const response = await axios.get('https://sgci-api.onrender.com/profissionais', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // AGORA FILTRA OS "APROVADO" (Para gerenciar quem já está dentro)
        profissionais.value = response.data.filter((p: Profissional) => p.status === 'aprovado');
        
    } catch (error) {
        console.error("Erro ao carregar:", error);
    } finally {
        loading.value = false;
    }
}

// === AÇÕES ===

const abrirHistorico = (prof: Profissional) => {
    // Por enquanto abre o modal de detalhes, futuro pode ser uma tela de logs
    profissionalSelecionado.value = prof;
    modalDetalhesAberto.value = true;
}

const desativarProfissional = async (prof: Profissional) => {
    if (!confirm(`Tem certeza que deseja DESATIVAR o acesso de ${prof.nome}?`)) return;

    try {
        const token = localStorage.getItem('auth_token');
        
        // Define como 'rejeitado' (ou 'inativo' se você mudar o enum no backend)
        // Isso bloqueia o login dele
        await axios.patch(`https://sgci-api.onrender.com/profissionais/${prof.id}/status`, {
            status: 'rejeitado', 
            observacoes_admin: 'Conta desativada pelo gerenciador de usuários.'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        alert('Profissional desativado com sucesso! 🚫');
        carregarProfissionais(); // Recarrega a lista
    } catch (error) {
        console.error(error);
        alert("Erro ao desativar. Verifique suas permissões.");
    }
}

const fecharModal = () => {
    modalDetalhesAberto.value = false;
    profissionalSelecionado.value = null;
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
                <div class="modal-content">
                    <button class="btn-close" @click="fecharModal">×</button>
                    <h2 class="modal-title">Detalhes do Profissional</h2>
                    
                    <div class="modal-body">
                        <p><strong>Nome:</strong> {{ profissionalSelecionado.nome }}</p>
                        <p><strong>CPF:</strong> {{ profissionalSelecionado.cpf }}</p>
                        <p><strong>Registro:</strong> {{ profissionalSelecionado.registro_conselho }} ({{ profissionalSelecionado.conselho_uf }})</p>
                        <p><strong>Entrou em:</strong> {{ formatarData(profissionalSelecionado.created_at) }}</p>
                        <p><strong>Biografia:</strong> {{ profissionalSelecionado.biografia || 'Sem biografia' }}</p>
                    </div>
                </div>
            </div>

        </div>
    </DashboardLayout>
</template>

<style scoped>
.page-container { padding: 40px; font-family: 'Montserrat', sans-serif; color: #4b5563; }
.page-title { color: #117a8b; font-weight: 800; font-size: 1.8rem; margin-bottom: 20px; }

/* SEARCH BAR */
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
.cards-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); /* Cards mais largos */
    gap: 25px; 
}

/* CARD DESIGN */
.card-user { 
    background: white; 
    border-radius: 12px; 
    border: 1px solid #e2e8f0; 
    display: flex; 
    flex-direction: column; 
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    transition: transform 0.2s;
}
.card-user:hover { transform: translateY(-2px); box-shadow: 0 10px 15px rgba(0,0,0,0.05); }

.card-content {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
}

/* AVATAR */
.avatar-circle {
    width: 70px;
    height: 70px;
    background-color: #cbd5e1; /* Cinza do Figma */
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
}

/* TEXTOS */
.user-info { display: flex; flex-direction: column; }
.user-name { color: #117a8b; margin: 0 0 5px 0; font-size: 1.1rem; }
.user-role { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; }
.user-detail { font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px; }

/* BOTOES */
.card-actions {
    display: flex;
    gap: 15px;
    margin-top: auto;
}
.btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 20px; /* Bem arredondado */
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    color: white;
    transition: opacity 0.2s;
}
.btn:hover { opacity: 0.9; }

.btn-desativar { background-color: #ff5722; /* Laranja/Vermelho */ }
.btn-historico { background-color: #007bff; /* Azul */ }

/* Modal Simples */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 500px; position: relative; }
.btn-close { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-title { color: #117a8b; margin-top: 0; }
.modal-body p { margin: 10px 0; color: #334155; }

.loading, .empty-state { text-align: center; color: #94a3b8; margin-top: 40px; font-size: 1.1rem; }

@media (max-width: 600px) {
    .cards-grid { grid-template-columns: 1fr; }
    .card-actions { flex-direction: column; }
}
</style>