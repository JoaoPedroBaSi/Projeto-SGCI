import api from '@/services/api';

export interface CriarReservaLoteDTO {
  salaId: number;
  profissionalId: number;
  horarios: {
    inicio: string;
    fim: string;
  }[];
}

export const reservaService = {
  buscarOcupados: async () => {
    const response = await api.get('/reserva');
    return response.data;
  },

  criarEmLote: async (dados: CriarReservaLoteDTO) => {
    const response = await api.post('/reserva', dados);
    return response.data;
  }
};
