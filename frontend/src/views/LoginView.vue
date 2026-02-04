<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();

const form = reactive({
  email: '',
  senha: ''
});

const erroLogin = ref('');
const carregando = ref(false);

const fazerLogin = async () => {
  erroLogin.value = '';
  carregando.value = true;

  if (!form.email || !form.senha) {
    erroLogin.value = 'Por favor, preencha todos os campos.';
    carregando.value = false;
    return;
  }

  try {
    const response = await api.post('/login', {
      email: form.email,
      password: form.senha
    });

    const token = response.data.token;
    const usuario = response.data.user;

    const tokenValue = typeof token === 'object' && token.token ? token.token : token;
    localStorage.setItem('auth_token', tokenValue);

    if (usuario) {
      localStorage.setItem('user_data', JSON.stringify(usuario));

      const tipo = (usuario.perfil_tipo || usuario.perfilTipo || '').toLowerCase();

      if (tipo === 'admin') {
        router.push('/admin/aprovacoes');
      } else if (tipo === 'profissional') {
        router.push('/dashboard/profissional');
      } else if (tipo === 'cliente') {
        router.push('/dashboard/cliente');
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }

  } catch (error: any) {
    console.error('Erro no login:', error);

    if (error.response) {
      if (error.response.status === 401 || error.response.status === 400) {
        erroLogin.value = 'E-mail ou senha incorretos.';
      } else {
        erroLogin.value = error.response.data.message || 'Erro ao processar login.';
      }
    } else if (error.request) {
      erroLogin.value = 'Erro de conexão: O servidor parece estar offline.';
    } else {
      erroLogin.value = 'Ocorreu um erro inesperado.';
    }
  } finally {
    carregando.value = false;
  }
}
</script>

<template>
  <div class="login-layout">
    <div class="lado-esquerdo">
      <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
        alt="Equipe Médica" />
      <div class="filtro-verde"></div>
    </div>

    <div class="lado-direito">
      <div class="card-login">
        <h1>LOGIN</h1>

        <form @submit.prevent="fazerLogin">
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" v-model="form.email" placeholder="Digite seu e-mail" required />
          </div>

          <div class="form-group">
            <label>Senha</label>
            <div class="senha-container">
              <input type="password" v-model="form.senha" placeholder="Sua senha" required />
            </div>
          </div>

          <div v-if="erroLogin" class="msg-erro">⚠️ {{ erroLogin }}</div>

          <button type="submit" class="btn-entrar" :disabled="carregando">
            {{ carregando ? 'ENTRANDO...' : 'ENTRAR' }}
          </button>

          <div class="links">
            <router-link to="/esqueci-senha" class="link-esqueci">
              Esqueceu a senha?
            </router-link>
          </div>

          <router-link to="/" class="btn-cadastro">CRIAR NOVA CONTA</router-link>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-layout {
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
  background: linear-gradient(to right, rgba(45, 212, 191, 0.4), rgba(13, 148, 136, 0.9));
}

.lado-direito {
  flex: 1;
  background-color: #0e7490;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card-login {
  width: 100%;
  max-width: 400px;
  background-color: transparent;
  color: white;
  text-align: center;
}

h1 {
  background-color: #2dd4bf;
  color: #0f766e;
  padding: 15px;
  border-radius: 8px 8px 0 0;
  margin-bottom: 20px;
  font-weight: 800;
  letter-spacing: 1px;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #ccfbf1;
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: none;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  outline: none;
  transition: background 0.3s;
  box-sizing: border-box;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

input:focus {
  background-color: rgba(255, 255, 255, 0.3);
  border: 1px solid #2dd4bf;
}

.msg-erro {
  color: #fecaca;
  background-color: rgba(185, 28, 28, 0.3);
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  border: 1px solid #f87171;
}

.btn-entrar {
  width: 100%;
  padding: 14px;
  margin-bottom: 15px;
  background-color: #2dd4bf;
  color: #0f766e;
  font-weight: 800;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: transform 0.2s;
}

.btn-entrar:hover {
  transform: scale(1.02);
  background-color: #5eead4;
}

.btn-entrar:disabled {
  background-color: #99f6e4;
  cursor: not-allowed;
  opacity: 0.7;
}

.links {
  margin-bottom: 20px;
}

.link-esqueci {
  color: #ccfbf1;
  text-decoration: none;
  font-size: 0.9rem;
  cursor: pointer;
}

.link-esqueci:hover {
  text-decoration: underline;
  color: white;
}

.btn-cadastro {
  display: block;
  width: 100%;
  padding: 14px;
  background-color: rgba(17, 94, 89, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 800;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  text-transform: uppercase;
  transition: all 0.2s;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.btn-cadastro:hover {
  background-color: #134e4a;
  border-color: #2dd4bf;
}

@media (max-width: 768px) {
  .login-layout {
    flex-direction: column;
    overflow-y: auto;
  }

  .lado-esquerdo {
    display: none;
  }

  .lado-direito {
    padding: 40px 20px;
    height: 100vh;
  }
}
</style>
