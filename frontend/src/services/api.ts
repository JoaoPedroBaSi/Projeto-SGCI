import axios from 'axios';

// Usa a variável de ambiente ou o link do Render direto
const API_URL = import.meta.env.VITE_API_URL || 'https://sgci-api.onrender.com';

console.log('🔗 Conectando na API:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // === A CORREÇÃO ESTÁ AQUI ===
  // Seu navegador salvou como 'auth_token', então temos que ler 'auth_token'
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;