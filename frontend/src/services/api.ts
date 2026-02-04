import axios from 'axios';

// URL do Backend no Render
const API_URL = 'https://sgci-api.onrender.com';

// const API_URL = 'http://localhost:3333';

console.log('🔗 Conectando na API:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

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
