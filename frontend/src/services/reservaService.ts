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
  buscarOcupados: async (salaId: number, data: string) => {
    const response = await api.get('/reserva/ocupados', {
      params: { salaId, data }
    });
    return response.data;
  },

  criarEmLote: async (dados: CriarReservaLoteDTO) => {
    const response = await api.post('/reserva', dados);
    return response.data;
  }
};
