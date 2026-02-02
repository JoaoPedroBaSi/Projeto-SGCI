<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();

// === ESTADO DE NAVEGAÇÃO ===
const expandirLogin = ref(false);
const expandirCadastro = ref(false);

// === DADOS ===
const loginData = reactive({ email: '', senha: '' });

const formCliente = reactive({
    nome: '', genero: '', dataNascimento: '', email: '', senha: '', confirmarSenha: '',
    cpf: '', telefone: '', cep: '', rua: '', numero: '', complemento: '',
    bairro: '', cidade: '', estado: '', tipoSanguineo: '', alergias: '', observacoes: ''
});

// === FUNÇÕES AUXILIARES ===
const limparFormatacao = (valor: string) => valor ? valor.replace(/\D/g, '') : '';

// === TOGGLES ===
const toggleLogin = () => {
    if (!expandirLogin.value) {
        expandirCadastro.value = false;
    }
    expandirLogin.value = !expandirLogin.value;
}

const toggleCadastro = () => {
    if (!expandirCadastro.value) {
        expandirLogin.value = false;
    }
    expandirCadastro.value = !expandirCadastro.value;
}

// === LOGIN (CORRIGIDO) ===
const fazerLogin = async () => {
    try {
        const response = await api.post('/login', {
            email: loginData.email,
            password: loginData.senha
        });
        
        const tokenObj = response.data.token;
        const user = response.data.user;

        if (tokenObj) {
            const tokenValue = tokenObj.token || tokenObj;
            localStorage.setItem('auth_token', tokenValue);
        }
        
        if (user) {
            localStorage.setItem('user_data', JSON.stringify(user));
        }

        // Tratamento de tipo para redirecionamento
        let tipo = user.perfil_tipo || user.perfilTipo || '';
        tipo = String(tipo).toLowerCase().trim();

        if (tipo === 'cliente') {
            router.push('/dashboard/cliente');
        } 
        else if (tipo === 'profissional') {
            router.push('/dashboard/profissional');
        } 
        else if (tipo === 'admin') {
            router.push('/admin/aprovacoes'); 
        } 
        else {
            router.push('/');
        }

    } catch (error: any) {
        console.error(error);
        alert(error.response?.data?.message || 'Erro ao fazer login. Verifique e-mail e senha.');
    }
}

// === CADASTRO CLIENTE ===
const fazerCadastroCliente = async () => {
    if (formCliente.senha !== formCliente.confirmarSenha) return alert('As senhas não coincidem!');
    try {
        const payload = {
            fullName: formCliente.nome,
            email: formCliente.email,
            password: formCliente.senha,
            password_confirmation: formCliente.confirmarSenha,
            perfil_tipo: 'cliente',
            cpf: limparFormatacao(formCliente.cpf),
            telefone: limparFormatacao(formCliente.telefone),
            genero: formCliente.genero,
            dataNascimento: formCliente.dataNascimento ? new Date(formCliente.dataNascimento).toISOString().split('T')[0] : null,
        };
        
        const resposta = await api.post('/register', payload);
        
        if (resposta.status === 201 || resposta.status === 200) {
            alert('Conta criada com sucesso! Faça login para continuar.');
            expandirCadastro.value = false;
            expandirLogin.value = true;
        }
    } catch (error: any) {
        const msg = error.response?.data?.message || 'Erro ao cadastrar. Verifique os dados.';
        alert(msg);
    }
}
</script>

<template>
    <div class="home-layout">
        <div class="lado-esquerdo">
            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop" alt="Médica" />
            <div class="filtro-verde"></div>
        </div>

        <div class="lado-direito">
            <div class="container-central">
                
                <div class="bloco-extensivel">
                    <button @click="toggleLogin" class="btn-grande btn-login" :class="{ 'ativo': expandirLogin }">Login</button>
                    <transition name="expand">
                        <div v-if="expandirLogin" class="painel-interno">
                            <div class="conteudo-padding">
                                <form @submit.prevent="fazerLogin">
                                    <div class="campo"><label>E-mail</label><input type="email" v-model="loginData.email" required /></div>
                                    <div class="campo"><label>Senha</label><input type="password" v-model="loginData.senha" required /></div>
                                    <button class="btn-entrar">Entrar</button>
                                    <div class="links"><router-link to="/esqueci-senha">Esqueceu a senha?</router-link></div>
                                </form>
                            </div>
                        </div>
                    </transition>
                </div>

                <div class="bloco-extensivel">
                    <button @click="toggleCadastro" class="btn-grande btn-cadastro" :class="{ 'ativo': expandirCadastro }">
                        Criar Conta (Paciente)
                    </button>
                    <transition name="expand">
                        <div v-if="expandirCadastro" class="painel-interno">
                            <div class="conteudo-padding">
                                <form @submit.prevent="fazerCadastroCliente" class="form-interno">
                                    <h4 class="subtitulo-form">Seus Dados</h4>
                                    <div class="campo"><label>Nome Completo</label><input type="text" v-model="formCliente.nome" required /></div>
                                    <div class="linha-dupla">
                                        <div class="campo metade"><label>Gênero</label><select v-model="formCliente.genero" required><option value="MASCULINO">Masculino</option><option value="FEMININO">Feminino</option></select></div>
                                        <div class="campo metade"><label>Nascimento</label><input type="date" v-model="formCliente.dataNascimento" required /></div>
                                    </div>
                                    <div class="linha-dupla">
                                        <div class="campo metade"><label>CPF</label><input type="text" v-model="formCliente.cpf" required /></div>
                                        <div class="campo metade"><label>Telefone</label><input type="tel" v-model="formCliente.telefone" required /></div>
                                    </div>
                                    <h4 class="subtitulo-form">Dados de Acesso</h4>
                                    <div class="campo"><label>E-mail</label><input type="email" v-model="formCliente.email" required /></div>
                                    <div class="linha-dupla">
                                        <div class="campo metade"><label>Senha</label><input type="password" v-model="formCliente.senha" required /></div>
                                        <div class="campo metade"><label>Confirmar</label><input type="password" v-model="formCliente.confirmarSenha" required /></div>
                                    </div>
                                    <button class="btn-entrar mt-2">Cadastrar</button>
                                </form>
                                <p class="nota-rodape">
                                    É um profissional de saúde? Entre em contato com a administração para solicitar seu credenciamento.
                                </p>
                            </div>
                        </div>
                    </transition>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
/* CONFIGURAÇÕES GERAIS */
.home-layout { display: flex; height: 100vh; width: 100%; overflow: hidden; font-family: 'Montserrat', sans-serif; }
.lado-esquerdo { flex: 1.2; position: relative; background-color: #000; }
.lado-esquerdo img { width: 100%; height: 100%; object-fit: cover; }
.filtro-verde { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(45, 212, 191, 0.4), rgba(13, 148, 136, 0.8)); }

/* DIREITA */
.lado-direito { flex: 1; background-color: #0e6472; display: flex; align-items: flex-start; justify-content: center; padding: 40px 20px; overflow-y: auto; }
.container-central { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 20px; margin-top: auto; margin-bottom: auto; }

/* BOTÕES */
.btn-grande { width: 100%; padding: 18px; font-size: 1.1rem; font-weight: 800; text-transform: uppercase; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; position: relative; z-index: 2; box-shadow: 0 4px 15px rgba(0,0,0,0.25); letter-spacing: 0.5px; }
.ativo { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; filter: brightness(0.9); }
.btn-login { background-color: #2dd4bf; color: #0f766e; }
.btn-login:hover { background-color: #14b8a6; transform: translateY(-2px); }
.btn-cadastro { background-color: #11acac; color: white; border: none; }
.btn-cadastro:hover { background-color: #0e9494; transform: translateY(-2px); }

/* PAINEL */
.painel-interno { background-color: #2197ac; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; border: 1px solid rgba(255,255,255,0.1); border-top: none; margin-top: -1px; position: relative; z-index: 1; overflow: hidden; }
.conteudo-padding { padding: 20px; }
.subtitulo-form { color: #2dd4bf; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; margin: 15px 0 10px 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }

/* FORM */
.campo { margin-bottom: 10px; text-align: left; }
.linha-dupla { display: flex; gap: 10px; margin-bottom: 10px; }
.metade { flex: 1; }
.maior { flex: 2; }
.menor { flex: 1; }
label { display: block; margin-bottom: 4px; color: #ccfbf1; font-size: 0.8rem; font-weight: bold; }
input, select, textarea { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.2); background-color: rgba(255, 255, 255, 0.1); color: white; outline: none; box-sizing: border-box; font-size: 0.9rem; font-family: 'Montserrat', sans-serif; }
input:focus, select:focus, textarea:focus { background-color: rgba(255, 255, 255, 0.2); border-color: #2dd4bf; }
select option { background-color: #111827; }
.btn-entrar { width: 100%; padding: 12px; margin-top: 10px; background-color: #2dd4bf; color: #0f766e; font-weight: 800; border-radius: 8px; border: none; cursor: pointer; text-transform: uppercase; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.btn-entrar:hover { background-color: #5eead4; }
.links { margin-top: 15px; text-align: center; font-size: 0.8rem; } .links a { color: #ccfbf1; text-decoration: none; cursor: pointer; }
.nota-rodape { font-size: 0.75rem; color: #ccfbf1; text-align: center; margin-top: 15px; opacity: 0.8; }

/* TRANSIÇÕES */
.expand-enter-active, .expand-leave-active { transition: all 0.5s ease; max-height: 1000px; opacity: 1; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }
</style>