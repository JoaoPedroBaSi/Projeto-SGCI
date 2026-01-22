<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { ref, onMounted, reactive, computed } from 'vue';
// CORREÇÃO 1: Usando a instância 'api' configurada (importante para o Render!)
import api from '@/services/api';

const user = reactive({
    id: null,
    fullName: '',
    email: '',
    perfil_tipo: '', 
    cpf: '',
    telefone: '',
    dataNascimento: '',
    genero: '',
    registro_conselho: '', 
    conselho_uf: '',
    biografia: ''
});

const isEditing = ref(false);
const originalData = ref({}); 
const showPasswordModal = ref(false);
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });

// COMPUTED
const isProfissional = computed(() => {
    return user.perfil_tipo && user.perfil_tipo.toLowerCase() === 'profissional';
});
const isAdmin = computed(() => {
    return user.perfil_tipo && user.perfil_tipo.toLowerCase() === 'admin';
});

// --- CORREÇÃO 2: BUSCA ROBUSTA DE DADOS ---
const fetchPerfil = async () => {
    try {
        // Usa api.get (já envia token e URL correta)
        const response = await api.get('/me');
        const data = response.data;
        
        console.log("DADOS RECEBIDOS:", data); // Debug no console

        user.id = data.id;
        user.email = data.email;
        user.perfil_tipo = data.perfil_tipo || data.perfilTipo || 'CLIENTE';

        // Tenta pegar dados do objeto 'perfil' ou da raiz 'user'
        // Isso resolve o problema de vir vazio se o backend mudar a estrutura
        const perfilData = data.perfil || {};
        
        user.fullName = perfilData.nome || perfilData.fullName || data.nome || data.fullName || 'Usuário Sem Nome';
        user.cpf = perfilData.cpf || data.cpf || '';
        user.telefone = perfilData.telefone || data.telefone || '';
        user.genero = perfilData.genero || data.genero || 'MASCULINO';
        
        // Dados específicos de Profissional
        user.registro_conselho = perfilData.registro_conselho || perfilData.registroConselho || '';
        user.conselho_uf = perfilData.conselho_uf || perfilData.conselhoUf || '';
        user.biografia = perfilData.biografia || '';

        // Tratamento de Data
        const rawDate = perfilData.data_nascimento || perfilData.dataNascimento || data.data_nascimento;
        if (rawDate) {
            user.dataNascimento = rawDate.toString().split('T')[0];
        }

    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
    }
};

const enableEdit = () => {
    originalData.value = JSON.parse(JSON.stringify(user));
    isEditing.value = true;
};

const cancelEdit = () => {
    Object.assign(user, originalData.value);
    isEditing.value = false;
};

const saveEdit = async () => {
    try {
        const payload = {
            nome: user.fullName,
            telefone: user.telefone,
            data_nascimento: user.dataNascimento,
            genero: user.genero,
            biografia: user.biografia,
            registro_conselho: user.registro_conselho,
            conselho_uf: user.conselho_uf
        };

        // Usa api.put (ou patch)
        await api.put('/me', payload);
        alert('Dados atualizados com sucesso!');
        isEditing.value = false;
        await fetchPerfil(); 
    } catch (error: any) {
        console.error(error);
        alert(error.response?.data?.message || 'Erro ao atualizar.');
    }
};

const openPasswordModal = () => { passwordForm.currentPassword = ''; passwordForm.newPassword = ''; passwordForm.confirmPassword = ''; showPasswordModal.value = true; };
const closePasswordModal = () => { showPasswordModal.value = false; };

const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return alert("Senhas não conferem.");
    try {
        await api.put('/auth/change-password', {
            current_password: passwordForm.currentPassword,
            new_password: passwordForm.newPassword
        });
        alert("Senha alterada com sucesso!");
        closePasswordModal();
    } catch (e) { alert("Erro ao alterar senha. Verifique sua senha atual."); }
};

onMounted(() => { fetchPerfil(); });
</script>

<template>
    <DashboardLayout>
        <div class="page-content">
            <h1 class="page-title">Meu Perfil</h1>

            <div class="profile-card">
                <div class="card-header">
                    <div class="avatar-area">
                        <div class="avatar-circle">
                            <span v-if="isProfissional">🩺</span>
                            <span v-else-if="isAdmin">🛡️</span>
                            <span v-else>👤</span>
                        </div>
                    </div>
                    <div class="user-info">
                        <h2>{{ user.fullName || 'Carregando...' }}</h2>
                        <span class="role-text">
                            {{ isProfissional ? 'Profissional de Saúde' : (isAdmin ? 'Administrador' : 'Cliente / Paciente') }}
                        </span>
                    </div>
                    <button v-if="!isEditing" class="btn-edit" @click="enableEdit">✎ EDITAR</button>
                </div>

                <hr class="divider" />

                <div class="form-row">
                    <div class="form-col" v-if="!isAdmin">
                        <h3 class="section-title">Dados Pessoais</h3>
                        <div class="input-wrapper">
                            <label>Nome Completo</label>
                            <input type="text" v-model="user.fullName" :disabled="!isEditing" class="input-pill" placeholder="Seu nome aqui" />
                        </div>
                        <div class="input-wrapper">
                            <label>CPF</label>
                            <input type="text" v-model="user.cpf" disabled class="input-pill locked" placeholder="000.000.000-00" />
                        </div>
                        <div class="input-wrapper">
                            <label>Data de Nascimento</label>
                            <input type="date" v-model="user.dataNascimento" :disabled="!isEditing" class="input-pill" />
                        </div>
                        <div class="input-wrapper">
                            <label>Gênero</label>
                            <select v-model="user.genero" :disabled="!isEditing" class="input-pill">
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMININO">Feminino</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-col border-left">
                        <h3 class="section-title">Contato</h3>
                        <div class="input-wrapper">
                            <label>E-mail (Login)</label>
                            <input type="email" v-model="user.email" disabled class="input-pill locked" />
                        </div>
                        <div class="input-wrapper" v-if="!isAdmin">
                            <label>Telefone</label>
                            <input type="tel" v-model="user.telefone" :disabled="!isEditing" class="input-pill" placeholder="(00) 00000-0000" />
                        </div>
                    </div>
                </div>

                <div v-if="isProfissional" class="full-width-section">
                    <hr class="divider-light" />
                    <h3 class="section-title">Dados Profissionais</h3>
                    
                    <div class="form-row">
                        <div class="form-col">
                            <div class="row-dupla">
                                <div class="input-wrapper">
                                    <label>Registro do Conselho</label>
                                    <input type="text" v-model="user.registro_conselho" :disabled="!isEditing" class="input-pill" placeholder="Ex: CRM 12345" />
                                </div>
                                <div class="input-wrapper pequeno">
                                    <label>UF</label>
                                    <input type="text" v-model="user.conselho_uf" :disabled="!isEditing" class="input-pill" placeholder="RN" />
                                </div>
                            </div>
                        </div>
                        <div class="form-col">
                            <div class="input-wrapper">
                                <label>Documentação</label>
                                <div class="doc-badge">📄 Status: Em análise / Aprovado</div>
                            </div>
                        </div>
                    </div>

                    <div class="input-wrapper mt-3">
                        <label>Biografia Profissional</label>
                        <textarea v-model="user.biografia" :disabled="!isEditing" class="input-pill area" placeholder="Fale sobre sua experiência..."></textarea>
                    </div>
                </div>

                <div class="footer-actions">
                    <div v-if="isEditing" class="edit-buttons">
                        <button @click="cancelEdit" class="btn-action btn-discard">Cancelar</button>
                        <button @click="saveEdit" class="btn-action btn-save">Salvar Alterações</button>
                    </div>

                    <div class="security-box">
                        <h3 class="section-title center">Segurança</h3>
                        <div class="input-wrapper center-width">
                            <label>Senha</label>
                            <input type="password" value="********" disabled class="input-pill text-center locked" />
                            <a href="#" @click.prevent="openPasswordModal" class="link-alterar">Alterar Senha →</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
            <div class="modal-card">
                <div class="modal-header"><h3>Alterar Senha</h3></div>
                <div class="modal-body">
                    <div class="input-wrapper"><label>Senha Atual</label><input class="input-pill" type="password" v-model="passwordForm.currentPassword" /></div>
                    <div class="input-wrapper"><label>Nova Senha</label><input class="input-pill" type="password" v-model="passwordForm.newPassword" /></div>
                    <div class="input-wrapper"><label>Confirmar Senha</label><input class="input-pill" type="password" v-model="passwordForm.confirmPassword" /></div>
                    <div class="modal-actions">
                        <button @click="closePasswordModal" class="btn-modal btn-modal-cancel">Cancelar</button>
                        <button @click="changePassword" class="btn-modal btn-modal-save">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
</template>

<style scoped>
/* ESTILOS REFINADOS */
.page-content { padding: 30px 50px; font-family: 'Montserrat', sans-serif; color: #334155; }
.page-title { color: #117a8b; font-size: 1.8rem; font-weight: 800; margin-bottom: 20px; }
.profile-card { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

/* Header */
.card-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
.avatar-circle { width: 90px; height: 90px; border-radius: 50%; background: #f0f9ff; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; border: 3px solid #2dd4bf; }
.user-info h2 { color: #0284c7; font-size: 1.6rem; margin: 0; font-weight: 700; }
.role-text { color: #117a8b; font-weight: 600; font-size: 0.95rem; }
.btn-edit { margin-left: auto; border: 2px solid #117a8b; color: #117a8b; background: transparent; padding: 8px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-edit:hover { background-color: #117a8b; color: white; }

.divider { border: 0; border-top: 2px solid #e2e8f0; margin-bottom: 30px; }
.divider-light { border: 0; border-top: 1px dashed #cbd5e1; margin: 30px 0; }

/* Form Layout */
.form-row { display: flex; gap: 60px; margin-bottom: 20px; }
.form-col { flex: 1; display: flex; flex-direction: column; }
.border-left { border-left: 2px solid #e2e8f0; padding-left: 60px; }
.full-width-section { width: 100%; margin-top: 10px; }

.section-title { color: #0ea5e9; font-size: 1rem; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 0.5px; }
.input-wrapper { margin-bottom: 15px; }
.input-wrapper label { display: block; color: #117a8b; font-weight: 700; font-size: 0.8rem; margin-bottom: 5px; margin-left: 15px; }
.input-pill { width: 100%; padding: 12px 25px; border: 1px solid #2dd4bf; border-radius: 50px; outline: none; color: #334155; font-size: 0.95rem; background-color: white; box-sizing: border-box; transition: 0.3s; }
.input-pill:disabled { background-color: #f8fafc; border-color: #e2e8f0; color: #94a3b8; }
.locked { background-color: #f1f5f9; cursor: not-allowed; }
.area { border-radius: 20px; min-height: 100px; resize: vertical; line-height: 1.5; }
.row-dupla { display: flex; gap: 15px; }
.pequeno { width: 100px; }
.mt-3 { margin-top: 20px; }

/* Document Badge */
.doc-badge { background: #e0f2fe; color: #0369a1; padding: 12px 20px; border-radius: 50px; font-weight: 600; font-size: 0.9rem; display: inline-block; border: 1px solid #bae6fd; }

/* Footer */
.footer-actions { margin-top: 40px; }
.edit-buttons { display: flex; justify-content: center; gap: 20px; margin-bottom: 40px; }
.btn-action { padding: 12px 40px; border-radius: 50px; font-weight: 700; cursor: pointer; background: white; text-transform: uppercase; }
.btn-discard { border: 2px solid #ef4444; color: #ef4444; }
.btn-discard:hover { background-color: #ef4444; color: white; }
.btn-save { border: 2px solid #0ea5e9; color: #0ea5e9; }
.btn-save:hover { background-color: #0ea5e9; color: white; }

.security-section { text-align: center; }
.security-box { border-top: 2px solid #e2e8f0; padding-top: 30px; display: flex; flex-direction: column; align-items: center; }
.center-width { width: 400px; max-width: 100%; text-align: center; }
.text-center { text-align: center; letter-spacing: 3px; }
.link-alterar { display: block; margin-top: 10px; color: #0ea5e9; font-weight: 700; text-decoration: none; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(3px); }
.modal-card { background: white; width: 90%; max-width: 450px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
.modal-header { background: #117a8b; padding: 20px; text-align: center; color: white; font-weight: 800; text-transform: uppercase; font-size: 1.1rem; }
.modal-body { padding: 30px; }
.modal-actions { display: flex; gap: 15px; margin-top: 20px; }
.btn-modal { flex: 1; padding: 10px; border-radius: 50px; font-weight: 600; cursor: pointer; border: 2px solid transparent; }
.btn-modal-cancel { border-color: #ef4444; color: #ef4444; background: white; }
.btn-modal-save { border-color: #117a8b; color: #117a8b; background: white; }

@media (max-width: 900px) { .form-row { flex-direction: column; gap: 30px; } .border-left { border-left: none; padding-left: 0; border-top: 2px solid #e2e8f0; padding-top: 30px; } }
</style>