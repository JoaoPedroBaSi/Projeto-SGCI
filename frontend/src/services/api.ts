import axios from 'axios';

// Define a URL base:
// 1. Tenta pegar da variável de ambiente do Vite (Vercel)
// 2. Se não tiver, usa o seu link direto do Render (Produção)
// 3. Se quiser testar local, troque para 'http://localhost:3333'
const API_URL = import.meta.env.VITE_API_URL || 'https://sgci-api.onrender.com';

console.log('🔗 Conectando na API:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// === INTERCEPTADOR DE REQUEST (O Segredo do Login) ===
api.interceptors.request.use((config) => {
  // CORREÇÃO CRUCIAL: O nome da chave no seu localStorage é 'auth_token', não 'token'
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// (Opcional) Interceptador de Resposta para limpar dados se o token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sessão expirada ou token inválido.');
      // Opcional: localStorage.clear(); window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;