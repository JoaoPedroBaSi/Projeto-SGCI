<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router'; // <--- 1. Importando o roteador
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import api from '@/services/api';

const router = useRouter(); // <--- 2. Iniciando o roteador

const form = reactive({
    nome: '',
    genero: '',
    dataNascimento: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: '',
    registro_conselho: '',
    uf: '',
    especializacao: '',
    biografia: '',
    comprovante: null as File | null 
});

const isLoading = ref(false);

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        form.comprovante = target.files[0];
    }
};

const cadastrar = async () => {
    if (form.senha !== form.confirmarSenha) {
        return alert('As senhas não conferem!');
    }

    try {
        isLoading.value = true;

        const payload = {
            ...form,
            comprovante: undefined 
        };

        await api.post('/profissionais', payload);
        
        alert('Profissional cadastrado com sucesso!');
        
        // --- AQUI ESTAVA O ERRO ---
        // ANTES: window.location.href = '/user'; (Isso levava para a tela branca)
        
        // AGORA (CORRIGIDO):
        router.push('/admin/aprovacoes'); // Leva para a lista de aprovações

    } catch (error: any) {
        console.error(error);
        alert(error.response?.data?.message || 'Erro ao cadastrar profissional.');
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <DashboardLayout>
        <div class="page-container">
            <div class="header-area">
                <h1 class="page-title">Cadastrar Profissional</h1>
            </div>

            <div class="form-card">
                <div class="photo-upload-area">
                    <div class="photo-circle">
                        <span class="plus-icon">+</span>
                        <input type="file" class="hidden-input" accept="image/*">
                    </div>
                </div>

                <form @submit.prevent="cadastrar">
                    <div class="input-group">
                        <label>Nome</label>
                        <input type="text" v-model="form.nome" placeholder="Digite seu nome" required class="input-field" />
                    </div>

                    <div class="row-dupla">
                        <div class="input-group">
                            <label>Gênero</label>
                            <select v-model="form.genero" required class="input-field">
                                <option value="" disabled selected>Selecione</option>
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMININO">Feminino</option>
                                <option value="OUTRO">Outro</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Nascimento</label>
                            <input type="date" v-model="form.dataNascimento" required class="input-field" />
                        </div>
                    </div>

                    <div class="input-group">
                        <label>E-mail</label>
                        <input type="email" v-model="form.email" placeholder="Digite seu e-mail" required class="input-field" />
                    </div>

                    <div class="row-dupla">
                        <div class="input-group">
                            <label>Senha</label>
                            <input type="password" v-model="form.senha" placeholder="Digite sua senha" required class="input-field" />
                        </div>
                        <div class="input-group">
                            <label>Confirmar Senha</label>
                            <input type="password" v-model="form.confirmarSenha" placeholder="Confirmar a senha" required class="input-field" />
                        </div>
                    </div>

                    <div class="row-dupla">
                        <div class="input-group">
                            <label>Telefone</label>
                            <input type="tel" v-model="form.telefone" placeholder="Digite seu telefone" class="input-field" />
                        </div>
                        <div class="input-group">
                            <label>CPF</label>
                            <input type="text" v-model="form.cpf" placeholder="Digite seu CPF" required class="input-field" />
                        </div>
                    </div>

                    <div class="row-dupla">
                        <div class="input-group flex-2">
                            <label>Registro do Conselho</label>
                            <input type="text" v-model="form.registro_conselho" placeholder="Digite seu registro" required class="input-field" />
                        </div>
                        <div class="input-group flex-1">
                            <label>UF</label>
                            <input type="text" v-model="form.uf" placeholder="UF (Ex: RN)" maxlength="2" required class="input-field" />
                        </div>
                    </div>

                    <div class="input-group">
                        <label>Especializações</label>
                        <select v-model="form.especializacao" class="input-field">
                            <option value="" disabled selected>Selecione</option>
                            <option value="CLINICO_GERAL">Clínico Geral</option>
                            <option value="CARDIOLOGIA">Cardiologia</option>
                            <option value="PEDIATRIA">Pediatria</option>
                            </select>
                    </div>

                    <div class="input-group">
                        <label>Biografia</label>
                        <textarea v-model="form.biografia" placeholder="Adicione aqui uma breve descrição sobre você" class="input-field textarea"></textarea>
                    </div>

                    <div class="input-group">
                        <label>Comprovante de Credenciamento</label>
                        <div class="file-upload-wrapper">
                            <label for="file-upload" class="custom-file-upload">
                                Escolha um arquivo
                            </label>
                            <span class="file-name">{{ form.comprovante ? form.comprovante.name : 'Nenhum arquivo selecionado' }}</span>
                            <input id="file-upload" type="file" @change="handleFileUpload" />
                        </div>
                    </div>

                    <button type="submit" class="btn-cadastrar" :disabled="isLoading">
                        {{ isLoading ? 'Cadastrando...' : 'Cadastrar' }}
                    </button>
                </form>
            </div>
        </div>
    </DashboardLayout>
</template>

<style scoped>
/* CORES DO FIGMA (Aproximadas) */
:root {
    --primary-teal: #2dd4bf; /* Cor do botão e detalhes */
    --text-color: #334155;
    --border-color: #cbd5e1;
}

.page-container {
    padding: 20px 40px;
    font-family: 'Montserrat', sans-serif;
    background-color: #f8fafc;
    min-height: 100vh;
}

.page-title {
    color: #117a8b; /* Azul do SGCI */
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 20px;
}

.form-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    max-width: 900px;
    margin: 0 auto;
}

/* ÁREA DA FOTO */
.photo-upload-area {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
}
.photo-circle {
    width: 60px;
    height: 60px;
    background-color: #e2e8f0;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.plus-icon {
    font-size: 24px;
    color: #117a8b;
    font-weight: bold;
}
.hidden-input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

/* INPUTS */
.input-group {
    margin-bottom: 20px;
    width: 100%;
}
.input-group label {
    display: block;
    color: #117a8b;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 8px;
}
.input-field {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #2dd4bf; /* Borda Teal conforme Figma */
    border-radius: 8px; /* Arredondado */
    outline: none;
    font-size: 1rem;
    color: #333;
    transition: 0.3s;
    background: white;
}
.input-field::placeholder {
    color: #94a3b8;
}
.input-field:focus {
    box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2);
}

/* GRID LAYOUT */
.row-dupla {
    display: flex;
    gap: 20px;
    width: 100%;
}
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

@media (max-width: 768px) {
    .row-dupla { flex-direction: column; gap: 0; }
}

.textarea {
    min-height: 100px;
    resize: vertical;
}

/* FILE UPLOAD ESTILIZADO */
.file-upload-wrapper {
    border: 1px solid #2dd4bf;
    border-radius: 8px;
    padding: 5px;
    display: flex;
    align-items: center;
    background: white;
}
input[type="file"] {
    display: none;
}
.custom-file-upload {
    background-color: #2dd4bf;
    color: white;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    margin-right: 15px;
    font-size: 0.9rem;
}
.file-name {
    color: #94a3b8;
    font-size: 0.9rem;
}

/* BOTÃO CADASTRAR */
.btn-cadastrar {
    width: 100%;
    background-color: #2dd4bf; /* Cor Teal do Figma */
    color: white;
    padding: 15px;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: 20px;
    transition: background 0.3s;
}
.btn-cadastrar:hover {
    background-color: #14b8a6;
}
.btn-cadastrar:disabled {
    background-color: #ccc;
}
</style>