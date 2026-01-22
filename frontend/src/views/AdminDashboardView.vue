<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// CORREÇÃO: Usando a instância configurada da API
import api from '@/services/api';

const router = useRouter();

// 1. Interface para garantir a tipagem correta
interface Profissional {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    status: 'pendente' | 'aprovado' | 'rejeitado';
    registro_conselho?: string;
    conselho_uf?: string;
}

// 2. Estado
const profissionais = ref<Profissional[]>([]); 
const loading = ref(true);

const buscarProfissionais = async () => {
    loading.value = true;
    try {
        // CORREÇÃO: Chamada limpa usando api.get (já envia o token)
        const response = await api.get('/profissionais'); // Verifique se a rota no back é plural ou singular
        
        // Mapeamento para garantir que os campos apareçam mesmo se o back mandar diferente
        profissionais.value = response.data.map((p: any) => ({
            id: p.id,
            nome: p.nome || p.user?.nome || 'Sem Nome',
            cpf: p.cpf,
            email: p.email || p.user?.email,
            status: p.status,
            // Tenta pegar de snake_case OU camelCase
            registro_conselho: p.registro_conselho || p.registroConselho,
            conselho_uf: p.conselho_uf || p.conselhoUf
        }));

    } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        alert('Erro ao carregar lista. Verifique se você é Administrador.');
    } finally {
        loading.value = false;
    }
};

// Filtro computado para mostrar apenas os pendentes
const pendentes = computed(() => {
    return profissionais.value.filter((p) => p.status === 'pendente');
});

const atualizarStatus = async (id: number, novoStatus: 'aprovado' | 'rejeitado') => {
    if (!confirm(`Tem certeza que deseja marcar como ${novoStatus.toUpperCase()}?`)) return;

    try {
        // CORREÇÃO: Usando PATCH para atualizar status
        await api.patch(`/profissionais/${id}/status`, { status: novoStatus });

        alert(`Profissional ${novoStatus} com sucesso!`);
        buscarProfissionais(); // Recarrega a lista

    } catch (error) {
        console.error('Erro ao atualizar:', error);
        alert('Erro ao atualizar status.');
    }
};

onMounted(() => {
    buscarProfissionais();
});
</script>

<template>
    <div class="admin-layout">
        <header class="admin-header">
            <h1>Painel do Administrador</h1>
            <p>Gerenciamento de solicitações de acesso</p>
            <router-link to="/dashboard" class="btn-voltar">Voltar ao Dashboard</router-link>
        </header>

        <main class="admin-content">
            <div v-if="loading" class="loading">Carregando solicitações...</div>

            <div v-else-if="pendentes.length === 0" class="empty-state">
                <p>Nenhuma solicitação pendente no momento. Tudo limpo! ✅</p>
            </div>

            <div v-else class="lista-solicitacoes">
                <h2>Solicitações Pendentes ({{ pendentes.length }})</h2>
                
                <div v-for="prof in pendentes" :key="prof.id" class="card-solicitacao">
                    <div class="info-prof">
                        <h3>{{ prof.nome }}</h3>
                        <p><strong>CPF:</strong> {{ prof.cpf || '---' }}</p>
                        <p><strong>Email:</strong> {{ prof.email }}</p>
                        <p v-if="prof.registro_conselho">
                            <strong>Conselho:</strong> {{ prof.registro_conselho }} / {{ prof.conselho_uf }}
                        </p>
                    </div>
                    
                    <div class="acoes">
                        <button @click="atualizarStatus(prof.id, 'aprovado')" class="btn-aprovar">
                            ✔ Aprovar
                        </button>
                        <button @click="atualizarStatus(prof.id, 'rejeitado')" class="btn-rejeitar">
                            ✖ Rejeitar
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.admin-layout { min-height: 100vh; background-color: #0e7490; color: white; font-family: 'Montserrat', sans-serif; padding: 20px; }
.admin-header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 20px; position: relative; }
.admin-header h1 { color: #2dd4bf; margin: 0; font-size: 1.8rem; font-weight: 800; }
.btn-voltar { position: absolute; top: 0; left: 0; color: #ccfbf1; text-decoration: none; font-size: 0.9rem; border: 1px solid #ccfbf1; padding: 5px 10px; border-radius: 6px; }
.btn-voltar:hover { background: rgba(255,255,255,0.1); }

.lista-solicitacoes { max-width: 800px; margin: 0 auto; }
.card-solicitacao { 
    background-color: rgba(0,0,0,0.3); 
    border: 1px solid rgba(255,255,255,0.1); 
    border-radius: 12px; 
    padding: 20px; 
    margin-bottom: 15px; 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    backdrop-filter: blur(5px);
}

.info-prof h3 { margin: 0 0 10px 0; color: #2dd4bf; font-size: 1.2rem; }
.info-prof p { margin: 5px 0; font-size: 0.9rem; color: #e2e8f0; }

.acoes { display: flex; gap: 10px; }
button { padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: transform 0.2s; text-transform: uppercase; font-size: 0.8rem; }
button:hover { transform: scale(1.05); }

.btn-aprovar { background-color: #2dd4bf; color: #0f766e; }
.btn-rejeitar { background-color: rgba(248, 113, 113, 0.2); color: #fecaca; border: 1px solid #f87171; }
.btn-rejeitar:hover { background-color: #f87171; color: white; }

.empty-state, .loading { text-align: center; margin-top: 50px; font-size: 1.2rem; color: #ccfbf1; }

@media (max-width: 600px) {
    .card-solicitacao { flex-direction: column; text-align: center; gap: 20px; }
    .acoes { width: 100%; justify-content: center; }
    .btn-voltar { position: static; display: inline-block; margin-top: 10px; }
}
</style>