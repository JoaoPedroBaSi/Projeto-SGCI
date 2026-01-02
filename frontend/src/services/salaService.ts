import api from '@/services/api';

export const salaService = {
  listarTodas: async () => {
    const response = await api.get('/sala');
    return response.data;
  }
};
