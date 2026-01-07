import api from '@/services/api';

// Tipagem exata do retorno do Backend
export interface InventarioItem {
  id: number;
  nome: string;
  tipo: 'MEDICAMENTO' | 'EQUIPAMENTO' | 'MATERIAL_ESCRITORIO' | 'MATERIAL_LIMPEZA';
  quantidade: number;
  unidadeMedida: string;
  validade: string;
  lote: string | null;
  fornecedor: string | null;
  pontoReposicao: number;
}

export interface MovimentacaoDTO {
  id_item: number;
  id_profissional: number;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  observacao?: string;
}

export interface MovimentacaoHistorico {
  id: number;
  idItem: number;
  idProfissional: number;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  observacao: string | null;
  createdAt: string;
  inventario?: InventarioItem;
  profissional?: { nome: string };
}

export const estoqueService = {
  // GET /inventario
  listarItens: async () => {
    const response = await api.get<InventarioItem[]>('/inventario');
    return response.data;
  },

  // GET /mov_inventario
  listarHistorico: async () => {
    const response = await api.get<MovimentacaoHistorico[]>('/mov_inventario');
    return response.data;
  },

  // POST /mov_inventario
  novaMovimentacao: async (dados: MovimentacaoDTO) => {
    const response = await api.post('/mov_inventario', dados);
    return response.data;
  }
};
