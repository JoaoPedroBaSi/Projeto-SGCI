<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();

const novaSenha = ref('');
const confirmarSenha = ref('');

const redefinirSenha = async () => {
    if (novaSenha.value !== confirmarSenha.value) {
        alert("As senhas não coincidem!");
        return;
    }

    const token = route.query.token;

    if (!token) {
        alert("Erro: Token de redefinição não encontrado na URL. Use o link do seu e-mail.");
        return;
    }

    try {
        await api.post('/redefinir-senha', {
            token: token,
            password: novaSenha.value
        });

        alert("Senha redefinida com sucesso! Agora você pode logar.");

        router.push('/');

    } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.message || "Erro ao redefinir senha.";
        alert(msg);
    }
}
</script>

<template>
    <div class="page-layout">

        <div class="lado-esquerdo">
            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop" alt="Médica" />
            <div class="filtro-verde"></div>
        </div>

        <div class="lado-direito">
            <div class="card-redefinir">

                <h2 class="titulo">Redefinição de senha</h2>

                <form @submit.prevent="redefinirSenha">
                    <div class="campo">
                        <label>Nova senha</label>
                        <input
                            type="password"
                            v-model="novaSenha"
                            placeholder="Digite sua nova senha"
                            required
                        />
                    </div>

                    <div class="campo">
                        <label>Confirme a senha</label>
                        <input
                            type="password"
                            v-model="confirmarSenha"
                            placeholder="Digite sua nova senha novamente"
                            required
                        />
                    </div>

                    <button type="submit" class="btn-redefinir">
                        Redefinir senha
                    </button>

                    <div class="links">
                        <router-link to="/">Voltar para login</router-link>
                    </div>
                </form>

            </div>
        </div>

    </div>
</template>

<style scoped>

.page-layout {
    display: flex;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    font-family: 'Montserrat', sans-serif;
}

.lado-esquerdo {
    flex: 1.2;
    position: relative;
    background-color: #000;
}

.lado-esquerdo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.filtro-verde {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgba(45, 212, 191, 0.4), rgba(13, 148, 136, 0.8));
}

.lado-direito {
    flex: 1;
    background-color: #0e7490;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.card-redefinir {
    width: 100%;
    max-width: 450px;
    background-color: #2197ac;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2.5rem;
    border-radius: 16px;
    text-align: center;
    color: white;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    backdrop-filter: blur(10px);
}

.titulo {
    margin-top: 0;
    margin-bottom: 2rem;
    font-size: 1.8rem;
    font-weight: bold;
    color: white;
}

.campo {
    margin-bottom: 1.5rem;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #ccfbf1;
    font-size: 0.95rem;
}

input {
    width: 100%;
    padding: 14px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
    outline: none;
    box-sizing: border-box;
    font-family: 'Montserrat', sans-serif;
}

input:focus {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: #2dd4bf;
}

input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.btn-redefinir {
    width: 100%;
    padding: 16px;
    margin-top: 10px;
    background-color: #2dd4bf;
    color: #0f766e;
    font-weight: 800;
    font-size: 1.1rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    text-transform: uppercase;
    transition: transform 0.2s;
}

.btn-redefinir:hover {
    background-color: #5eead4;
    transform: scale(1.02);
}

.links {
    margin-top: 20px;
}

.links a {
    color: white;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
}

.links a:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .page-layout { flex-direction: column; }
    .lado-esquerdo { display: none; }
}
</style>
