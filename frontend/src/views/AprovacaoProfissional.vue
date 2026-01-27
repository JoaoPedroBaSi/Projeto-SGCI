<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

// Controle de Modais
const modalDetalhesAberto = ref(false);
const modalRejeicaoAberto = ref(false);
const profissionalSelecionado = ref<Profissional | null>(null);

// Texto da observação
const textoObservacao = ref('');

// Formatador de Data
const formatarData = (dataIso: string) => {
    if (!dataIso) return 'Data não disponível';
    return new Date(dataIso).toLocaleDateString('pt-BR');
}

// Buscar API
const carregarPendentes = async () => {
    loading.value = true;
    try {
        const token = localStorage.getItem('auth_token');
        // URL CORRIGIDA: Aponta para o servidor de produção no Render
        const response = await axios.get('https://sgci-api.onrender.com/profissionais', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filtra apenas os pendentes no front (ou no back se tiver filtro)
        profissionais.value = response.data.filter((p: Profissional) => p.status === 'pendente');
        
    } catch (error) {
        console.error("Erro ao carregar:", error);
    } finally {
        loading.value = false;
    }
}

// === LÓGICA DE MODAIS ===

const abrirDetalhes = (prof: Profissional) => {
    profissionalSelecionado.value = prof;
    modalDetalhesAberto.value = true;
}

const fecharTudo = () => {
    modalDetalhesAberto.value = false;
    modalRejeicaoAberto.value = false;
    profissionalSelecionado.value = null;
    textoObservacao.value = '';
}

// === LÓGICA DE APROVAÇÃO/REJEIÇÃO ===

const confirmarAprovacao = async () => {
    await enviarStatus('aprovado');
}

const iniciarRejeicao = () => {
    // Troca de modal: Fecha Detalhes -> Abre Observação
    modalDetalhesAberto.value = false;
    modalRejeicaoAberto.value = true;
}

const enviarRejeicao = async (comJustificativa: boolean) => {
    // Se o user clicou em "Não justificar", limpamos o texto
    if (!comJustificativa) {
        textoObservacao.value = '';
    }
    await enviarStatus('rejeitado');
}

const enviarStatus = async (status: 'aprovado' | 'rejeitado') => {
    if (!profissionalSelecionado.value) return;

    try {
        const token = localStorage.getItem('auth_token');
        
        // URL CORRIGIDA: Aponta para o servidor de produção no Render
        await axios.patch(`https://sgci-api.onrender.com/profissionais/${profissionalSelecionado.value.id}/status`, {
            status: status,
            observacoes_admin: textoObservacao.value // Envia o texto (vazio ou preenchido)
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const msg = status === 'aprovado' ? 'Profissional Aprovado! ✅' : 'Profissional Rejeitado. ⛔';
        alert(msg);
        
        fecharTudo();
        carregarPendentes(); 
    } catch (error) {
        console.error(error);
        alert("Erro ao atualizar status. Verifique se você é Admin.");
    }
}

onMounted(() => {
    carregarPendentes();
});
</script>

<template>
    <DashboardLayout>
        <div class="page-container">
            <h2 class="page-title">Solicitações Pendentes</h2>

            <div v-if="loading" class="loading">Carregando solicitações...</div>

            <div v-else-if="profissionais.length === 0" class="empty-state">
                <p>Nenhuma solicitação pendente no momento. Tudo limpo! ✅</p>
            </div>

            <div v-else class="cards-grid">
                <div v-for="prof in profissionais" :key="prof.id" class="card-profissional">
                    <h3 class="card-header">Aprovar Profissional</h3>
                    <div class="card-body">
                        <div class="info-row"><span class="label">Nome Completo:</span><span class="value">{{ prof.nome }}</span></div>
                        <div class="info-row"><span class="label">Email:</span><span class="value">{{ prof.user?.email }}</span></div>
                        <div class="info-row"><span class="label">Especialidade:</span><span class="value">{{ prof.funcao?.nome }}</span></div>
                        <div class="info-row"><span class="label">Data da Solicitação:</span><span class="value">{{ formatarData(prof.created_at) }}</span></div>
                    </div>
                    <div class="card-footer">
                        <button @click="abrirDetalhes(prof)" class="btn-detalhes">Ver detalhes <span class="arrow">→</span></button>
                    </div>
                </div>
            </div>

            <div v-if="modalDetalhesAberto && profissionalSelecionado" class="modal-overlay" @click.self="fecharTudo">
                <div class="modal-content">
                    <button class="btn-close" @click="fecharTudo">×</button>
                    <h2 class="modal-title">Aprovar Profissional</h2>

                    <div class="modal-grid">
                        <div class="modal-left">
                            <div class="foto-circle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                        </div>
                        <div class="modal-right">
                            <div class="data-group"><p><strong>Nome Completo:</strong> {{ profissionalSelecionado.nome }}</p><p><strong>CPF:</strong> {{ profissionalSelecionado.cpf || '---' }}</p></div>
                            <div class="data-group"><p><strong>E-mail:</strong> {{ profissionalSelecionado.user?.email }}</p><p><strong>Tel:</strong> {{ profissionalSelecionado.telefone || '---' }}</p></div>
                            <div class="data-group"><p><strong>Data de Nascimento:</strong> {{ formatarData(profissionalSelecionado.dataNascimento || '') }}</p><p><strong>Sexo:</strong> {{ profissionalSelecionado.genero || '---' }}</p></div>
                        </div>
                    </div>

                    <div class="modal-bottom-info">
                        <div class="info-line">
                            <strong>Registro do Conselho:</strong> {{ profissionalSelecionado.registro_conselho }} 
                            <span class="separator">|</span> <strong>UF:</strong> {{ profissionalSelecionado.conselho_uf }}
                            <span class="separator">|</span> <strong>Especialização:</strong> {{ profissionalSelecionado.funcao?.nome }}
                        </div>
                        <div class="bio-box"><strong>Biografia:</strong><p>{{ profissionalSelecionado.biografia || 'Nenhuma biografia informada.' }}</p></div>
                        <div class="comprovante-link"><strong>Comprovante de Credenciamento: </strong><a href="#" class="link-teal" @click.prevent>comprovante_credenciamento.pdf</a></div>
                    </div>

                    <div class="modal-actions">
                        <button @click="iniciarRejeicao" class="btn-action btn-rejeitar">Rejeitar</button>
                        <button @click="confirmarAprovacao" class="btn-action btn-aprovar">Aprovar</button>
                    </div>
                </div>
            </div>

            <div v-if="modalRejeicaoAberto" class="modal-overlay" @click.self="fecharTudo">
                <div class="modal-content modal-pequeno">
                    <button class="btn-close" @click="fecharTudo">×</button>
                    
                    <h2 class="modal-title">Adicionar Observação?</h2>
                    
                    <div class="input-container">
                        <textarea 
                            v-model="textoObservacao" 
                            placeholder="Ex: Documentação incompleta ou inválida..." 
                            rows="4"
                            class="textarea-obs"
                        ></textarea>
                    </div>

                    <div class="modal-actions">
                        <button @click="enviarRejeicao(false)" class="btn-action btn-rejeitar">Não justificar</button>
                        <button @click="enviarRejeicao(true)" class="btn-action btn-enviar">Enviar</button>
                    </div>
                </div>
            </div>

        </div>
    </DashboardLayout>
</template>

<style scoped>
.page-container { padding: 40px; font-family: 'Montserrat', sans-serif; color: #4b5563; }
.page-title { color: #2dd4bf; font-weight: 800; font-size: 1.8rem; margin-bottom: 30px; }

/* Cards */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }
.card-profissional { background: white; border-radius: 12px; border: 1px solid #e5e7eb; display: flex; flex-direction: column; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.card-profissional:hover { transform: translateY(-3px); }
.card-header { text-align: center; color: #2dd4bf; font-weight: 700; padding: 20px 0 10px 0; margin: 0 20px; border-bottom: 1px solid #f0f0f0; font-size: 1.1rem; }
.card-body { padding: 20px; font-size: 0.9rem; flex: 1; }
.info-row { margin-bottom: 8px; display: flex; gap: 5px; }
.label { font-weight: 700; color: #6b7280; }
.value { color: #374151; }
.card-footer { padding: 15px; text-align: center; }
.btn-detalhes { background: none; border: none; color: #2dd4bf; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
.btn-detalhes:hover { text-decoration: underline; }

/* Modais Comuns */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; width: 650px; max-width: 90%; border-radius: 16px; padding: 40px; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.2); text-align: left; }
.modal-pequeno { width: 450px; } /* Estilo específico para o modal de obs */

.btn-close { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 2rem; color: #9ca3af; cursor: pointer; }
.modal-title { color: #2dd4bf; text-align: center; font-weight: 800; margin-bottom: 30px; font-size: 1.5rem; }

/* Layout Detalhes */
.modal-grid { display: grid; grid-template-columns: 100px 1fr; gap: 20px; margin-bottom: 20px; align-items: start; }
.foto-circle { width: 90px; height: 90px; border-radius: 50%; border: 2px solid #2dd4bf; display: flex; align-items: center; justify-content: center; background-color: #f0fdfa; }
.modal-right { display: flex; flex-direction: column; gap: 8px; }
.data-group { display: grid; grid-template-columns: 1.5fr 1fr; gap: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
.data-group p { margin: 0; font-size: 0.9rem; color: #4b5563; }
.data-group strong { color: #6b7280; font-weight: 700; margin-right: 5px; }

.modal-bottom-info { margin-top: 15px; font-size: 0.9rem; color: #4b5563; }
.info-line { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
.separator { margin: 0 10px; color: #d1d5db; }
.bio-box { margin-bottom: 15px; }
.bio-box p { font-size: 0.85rem; margin-top: 5px; line-height: 1.4; }
.link-teal { color: #2dd4bf; text-decoration: underline; cursor: pointer; font-weight: 600; }

/* Botoes */
.modal-actions { display: flex; justify-content: center; gap: 20px; margin-top: 30px; }
.btn-action { padding: 10px 40px; border-radius: 50px; font-weight: 700; font-size: 1rem; cursor: pointer; background: white; transition: all 0.2s; }
.btn-rejeitar { border: 2px solid #f87171; color: #f87171; }
.btn-rejeitar:hover { background-color: #fef2f2; }
.btn-aprovar, .btn-enviar { border: 2px solid #2dd4bf; color: #2dd4bf; }
.btn-aprovar:hover, .btn-enviar:hover { background-color: #f0fdfa; }

/* Input Textarea */
.input-container { width: 100%; }
.textarea-obs { 
    width: 100%; 
    padding: 15px; 
    border-radius: 12px; 
    border: 1px solid #d1d5db; 
    font-family: 'Montserrat', sans-serif;
    font-size: 0.95rem;
    resize: none;
    outline: none;
    box-sizing: border-box;
}
.textarea-obs:focus { border-color: #2dd4bf; }

.empty-state { text-align: center; color: #9ca3af; font-size: 1.2rem; margin-top: 50px; }
.loading { text-align: center; color: #2dd4bf; font-weight: bold; }
</style>