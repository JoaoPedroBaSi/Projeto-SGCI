import axios from 'axios';

// Define a URL base: usa a variável da Vercel OU localhost se não encontrar
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

// Console log para ajudar a debugar (vai aparecer no F12 do navegador)
console.log('🔗 API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar o Token automaticamente (se tiver login)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;