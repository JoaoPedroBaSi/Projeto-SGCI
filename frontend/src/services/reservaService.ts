import api from '@/services/api';

export interface CriarReservaDTO {
  salaId: number;
  profissionalId: number;
  dataHoraInicio: string;
  dataHoraFim: string;
}

export const reservaService = {
  criar: async (dados: CriarReservaDTO) => {
    const response = await api.post('/reserva', dados);
    return response.data;
  }
};
