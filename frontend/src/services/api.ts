import axios from 'axios';

// URL do Backend no Render
const API_URL = 'https://sgci-api.onrender.com';

console.log('🔗 Conectando na API:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de Requisição
api.interceptors.request.use((config) => {
  // CORREÇÃO: Busca a chave certa 'auth_token'
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptador de Erro (Debug)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('⛔ Erro de Autenticação:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;