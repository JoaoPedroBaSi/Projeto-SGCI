<!-- João gabriel -->

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api'; // O JEITO CERTO 
const router = useRouter();

// DADOS DO FORMULÁRIO (Cliente)
const form = reactive({
    nome: '',
    genero: '',
    dataNascimento: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    telefone: '',
    // Endereço
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    // Saúde
    tipoSanguineo: '',
    alergias: '',
    observacoes: ''
});

// Lista de estados para o select
const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// --- A LÓGICA DE CADASTRO REAL ---
const fazerCadastro = async () => {
    // 1. Validação local
    if(form.senha !== form.confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        // 2. Preparar o pacote para o Back-end
        const dados = {
            full_name: form.nome,
            email: form.email,
            password: form.senha,
            password_confirmation: form.confirmarSenha, // CORRIGIDO: snake_case para o Adonis
            cpf: form.cpf,
            telefone: form.telefone,
            genero: form.genero,
            dataNascimento: form.dataNascimento,
            perfil_tipo: 'cliente',
        };

        // 3. Enviar para o Adonis
        const resposta = await api.post('/register', dados);

        // 4. Sucesso
        if (resposta.status === 201) {
            alert('Sucesso! Usuário cadastrado.');
            router.push('/login');
        }

    } catch (error: any) {
        // 5. Tratamento de Erros
        console.error("Erro capturado:", error);

        if (error.response) {
            const mensagemErro = error.response.data.message || 'Erro ao cadastrar.';
            alert(`Falha no cadastro: ${mensagemErro}`);
            
            if (error.response.data.errors) {
                console.log('Erros de validação:', error.response.data.errors);
            }
        } else if (error.request) {
            alert('Erro de conexão: O servidor Back-end não respondeu.');
        } else {
            alert('Erro desconhecido ao configurar a requisição.');
        }
    }
}

// Função simulada de CEP
const buscarCep = () => {
    if (form.cep.length >= 8) {
        form.rua = 'Rua Exemplo (Simulação)';
        form.bairro = 'Centro';
        form.cidade = 'Cidade Teste';
        form.estado = 'SP';
    } else {
        alert('CEP inválido');
    }
}
</script>

<!-- (Mantenha o <template> e o <style> exatamente como você já tem) -->

<template>
    <div class="cadastro-layout">
        <!-- LADO ESQUERDO -->
        <div class="lado-esquerdo">
            <img src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1932&auto=format&fit=crop" alt="Paciente e Médico" />
            <div class="filtro-verde"></div>
        </div>

        <!-- LADO DIREITO -->
        <div class="lado-direito">
            <div class="card-cadastro">
                <h1>Cadastro de Cliente</h1>
                <p class="subtitulo">Preencha seus dados para criar sua conta.</p>

                <!-- O .prevent evita que a página recarregue -->
                <form @submit.prevent="fazerCadastro">
                    
                    <h3 class="secao-titulo">Dados Pessoais</h3>
                    <div class="form-group">
                        <label>Nome Completo</label>
                        <input type="text" v-model="form.nome" placeholder="Digite seu nome completo" required />
                    </div>

                    <div class="form-row">
                        <div class="form-group metade">
                            <label>Gênero</label>
                            <select v-model="form.genero" required>
                                <option value="" disabled selected>Selecione</option>
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMININO">Feminino</option>
                                <option value="OUTRO">Outro</option>
                            </select>
                        </div>
                        <div class="form-group metade">
                            <label>Nascimento</label>
                            <input type="date" v-model="form.dataNascimento" required />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group metade">
                            <label>CPF</label>
                            <input type="text" v-model="form.cpf" placeholder="000.000.000-00" required />
                        </div>
                        <div class="form-group metade">
                            <label>Telefone / Celular</label>
                            <input type="tel" v-model="form.telefone" placeholder="(00) 00000-0000" required />
                        </div>
                    </div>

                    <h3 class="secao-titulo">Dados de Acesso</h3>
                    <div class="form-group">
                        <label>E-mail</label>
                        <input type="email" v-model="form.email" placeholder="seu@email.com" required />
                    </div>

                    <div class="form-row">
                        <div class="form-group metade">
                            <label>Senha</label>
                            <input type="password" v-model="form.senha" placeholder="Crie uma senha" required />
                        </div>
                        <div class="form-group metade">
                            <label>Confirmar Senha</label>
                            <input type="password" v-model="form.confirmarSenha" placeholder="Repita a senha" required />
                        </div>
                    </div>

                    <h3 class="secao-titulo">Endereço</h3>
                    <div class="form-group">
                        <label>CEP</label>
                        <div class="input-com-botao">
                            <input type="text" v-model="form.cep" placeholder="00000-000" />
                            <button type="button" class="btn-buscar" @click="buscarCep">Buscar</button>
                        </div>
                    </div>
                    <!-- Campos de endereço continuam aqui (apenas visuais por enquanto) -->
                    <div class="form-row">
                        <div class="form-group dois-tercos">
                            <label>Rua</label>
                            <input type="text" v-model="form.rua" />
                        </div>
                        <div class="form-group um-terco">
                            <label>Nº</label>
                            <input type="text" v-model="form.numero" />
                        </div>
                    </div>
                     <div class="form-row">
                        <div class="form-group metade">
                            <label>Bairro</label>
                            <input type="text" v-model="form.bairro" />
                        </div>
                        <div class="form-group metade">
                            <label>Cidade</label>
                            <input type="text" v-model="form.cidade" />
                        </div>
                    </div>

                    <button type="submit" class="btn-cadastrar">Finalizar Cadastro</button>

                    <div class="links">
                        <router-link to="/">Voltar para a tela inicial</router-link>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* (Mantenha o seu CSS original aqui, ele estava ótimo!) */
.cadastro-layout { display: flex; height: 100vh; width: 100%; overflow: hidden; font-family: 'Montserrat', sans-serif; }
.lado-esquerdo { flex: 1; position: relative; background-color: #000; }
.lado-esquerdo img { width: 100%; height: 100%; object-fit: cover; }
.filtro-verde { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(45, 212, 191, 0.4), rgba(13, 148, 136, 0.8)); }
.lado-direito { flex: 1.5; background-color: #0e7490; display: flex; align-items: flex-start; justify-content: center; padding: 30px; overflow-y: auto; }
.card-cadastro { width: 100%; max-width: 600px; background-color: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 2.5rem; border-radius: 16px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2); color: white; margin-bottom: 30px; }
h1 { text-align: center; margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700; color: #2dd4bf; }
.subtitulo { text-align: center; margin-bottom: 2rem; color: #ccfbf1; }
.secao-titulo { color: #2dd4bf; border-bottom: 1px solid rgba(45, 212, 191, 0.3); padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; font-size: 1.1rem; }
.form-group { margin-bottom: 1.2rem; text-align: left; }
.form-row { display: flex; gap: 15px; }
.metade { flex: 1; }
.dois-tercos { flex: 2; }
.um-terco { flex: 1; }
label { display: block; margin-bottom: 6px; font-size: 0.9rem; color: #ccfbf1; font-weight: 600; }
input, select, textarea { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.25); background-color: rgba(0, 0, 0, 0.25); color: white; font-size: 0.95rem; outline: none; box-sizing: border-box; transition: all 0.3s; font-family: 'Montserrat', sans-serif; }
textarea { resize: vertical; height: 80px; }
select option { background-color: #111827; color: white; }
input:focus, select:focus, textarea:focus { border-color: #2dd4bf; background-color: rgba(0, 0, 0, 0.35); }
.input-com-botao { display: flex; gap: 10px; }
.btn-buscar { padding: 0 15px; border: 1px solid #2dd4bf; background-color: transparent; color: #2dd4bf; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.btn-buscar:hover { background-color: #2dd4bf; color: #0f766e; }
.btn-cadastrar { width: 100%; padding: 16px; margin-top: 2rem; background-color: #2dd4bf; color: #0f766e; font-weight: 800; font-size: 1.1rem; border: none; border-radius: 10px; cursor: pointer; text-transform: uppercase; transition: transform 0.2s, background-color 0.2s; }
.btn-cadastrar:hover { background-color: #5eead4; transform: scale(1.02); }
.links { margin-top: 20px; text-align: center; font-size: 0.9rem; }
.links a { color: #ccfbf1; text-decoration: none; }
.links a:hover { color: white; text-decoration: underline; }
@media (max-width: 768px) { .cadastro-layout { flex-direction: column; height: auto; } .lado-esquerdo { display: none; } .lado-direito { padding: 15px; } .form-row { flex-direction: column; gap: 0; } .card-cadastro { padding: 1.5rem; } }
</style>