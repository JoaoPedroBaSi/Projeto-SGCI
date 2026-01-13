<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// 1. CRIAMOS UMA "INTERFACE" PARA O TYPESCRIPT ENTENDER O DADO
interface Profissional {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    status: 'pendente' | 'aprovado' | 'rejeitado';
    registro_conselho?: string;
    conselho_uf?: string;
}

// 2. AVISAMOS AO REF QUE ELE VAI GUARDAR UMA LISTA DE PROFISSIONAIS
const profissionais = ref<Profissional[]>([]); 
const loading = ref(true);

const buscarProfissionais = async () => {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            alert('Você precisa estar logado como admin!');
            router.push('/');
            return;
        }

        const response = await axios.get('http://localhost:3333/profissional', {
            headers: { Authorization: `Bearer ${token}` }
        });

        profissionais.value = response.data;
    } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        alert('Erro ao carregar lista.');
    } finally {
        loading.value = false;
    }
};

// Como tipamos o ref lá em cima, não precisamos mais usar "any" aqui
const pendentes = computed(() => {
    return profissionais.value.filter((p) => p.status === 'pendente');
});

const atualizarStatus = async (id: number, novoStatus: 'aprovado' | 'rejeitado') => {
    try {
        const token = localStorage.getItem('auth_token');
        
        await axios.patch(`http://localhost:3333/profissional/${id}/status`, 
            { status: novoStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(`Profissional ${novoStatus} com sucesso!`);
        buscarProfissionais();

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
        </header>

        <main class="admin-content">
            <div v-if="loading" class="loading">Carregando...</div>

            <div v-else-if="pendentes.length === 0" class="empty-state">
                <p>Nenhuma solicitação pendente no momento.</p>
            </div>

            <div v-else class="lista-solicitacoes">
                <h2>Solicitações Pendentes ({{ pendentes.length }})</h2>
                
                <div v-for="prof in pendentes" :key="prof.id" class="card-solicitacao">
                    <div class="info-prof">
                        <h3>{{ prof.nome }}</h3>
                        <p><strong>CPF:</strong> {{ prof.cpf }}</p>
                        <p><strong>Email:</strong> {{ prof.email }}</p>
                        <p v-if="prof.registro_conselho"><strong>Registro:</strong> {{ prof.registro_conselho }} - {{ prof.conselho_uf }}</p>
                    </div>
                    
                    <div class="acoes">
                        <button @click="atualizarStatus(prof.id, 'aprovado')" class="btn-aprovar">
                            Aprovar
                        </button>
                        <button @click="atualizarStatus(prof.id, 'rejeitado')" class="btn-rejeitar">
                            Rejeitar
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
/* MANTIVE SEU CSS ORIGINAL, POIS ESTAVA BOM */
.admin-layout { min-height: 100vh; background-color: #0e7490; color: white; font-family: 'Montserrat', sans-serif; padding: 20px; }
.admin-header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 20px; }
.admin-header h1 { color: #2dd4bf; margin: 0; }

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
}

.info-prof h3 { margin: 0 0 10px 0; color: #ccfbf1; }
.info-prof p { margin: 5px 0; font-size: 0.9rem; color: #e2e8f0; }

.acoes { display: flex; gap: 10px; }
button { padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
button:hover { transform: scale(1.05); }

.btn-aprovar { background-color: #2dd4bf; color: #0f766e; }
.btn-rejeitar { background-color: #f87171; color: #7f1d1d; }

.empty-state, .loading { text-align: center; margin-top: 50px; font-size: 1.2rem; color: #ccfbf1; }

@media (max-width: 600px) {
    .card-solicitacao { flex-direction: column; text-align: center; gap: 15px; }
}
</style>