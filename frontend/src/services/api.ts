// src/services/api.ts

import axios from 'axios';

// Você pode configurar a URL base aqui, usando variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Se você precisar de interceptors para tokens, adicione aqui!

export default api;
