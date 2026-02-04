<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();

const email = ref('');
const loading = ref(false);

const enviarSolicitacao = async () => {
    if (!email.value) {
        alert("Por favor, digite seu e-mail.");
        return;
    }

    loading.value = true;

    try {
        await api.post('/esqueci-senha', {
            email: email.value
        });

        alert("Se o e-mail estiver cadastrado, você receberá um link em breve!");

        router.push('/');

    } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.message || "Erro ao enviar solicitação.";
        alert(msg);
    } finally {
        loading.value = false;
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
            <div class="card-esqueci">

                <h2 class="titulo">Esqueceu a senha?</h2>

                <form @submit.prevent="enviarSolicitacao">
                    <div class="campo">
                        <label>E-mail</label>
                        <input
                            type="email"
                            v-model="email"
                            placeholder="Digite o e-mail vinculado à sua conta"
                            required
                        />
                    </div>

                    <p class="texto-auxiliar">
                        Um link para recuperar sua senha será enviado a você por e-mail.
                    </p>

                    <button type="submit" class="btn-enviar" :disabled="loading">
                        {{ loading ? 'Enviando...' : 'ENVIAR SOLICITAÇÃO' }}
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

.card-esqueci {
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
    margin-bottom: 1rem;
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
    font-size: 0.9rem;
}

.texto-auxiliar {
    text-align: left;
    font-size: 0.85rem;
    color: #ccfbf1;
    margin-bottom: 1.5rem;
    line-height: 1.4;
}

.btn-enviar {
    width: 100%;
    padding: 16px;
    margin-top: 5px;
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

.btn-enviar:hover:not(:disabled) {
    background-color: #5eead4;
    transform: scale(1.02);
}

.btn-enviar:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
