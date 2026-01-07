// src/types/index.ts

export interface User {
  id: number,
  email: string,
  userId: number,
}
// Interface básica para o Cliente
export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  fotoPerfil?: string;
  userId: number,
  genero: string,
  dataNascimento: string
}

export interface Sala {
  id: number;
  nome: string;
  capacidadePacientes: number;
}

// Se for usar Pedidos novamente, mantenha esta interface
export interface Pedido {
  id: number,
  descricao: string,
  valor: number,
  clienteId: number,
  cliente?: Cliente,
}

export interface Atendimento {
  id: number,
  clienteId: number,
  profissionalId: number,
  observacoes: string,
  valor: number | string,
  status: string,
  statusPagamento: string,
  dataHoraInicio: string,
  dataHoraFim: string,
  salaId: number,
  formaPagamento: string,

  nomeSala?: string,
  nomeProfissional?: string,
  funcaoProfissional?: string
}

export interface Profissional {
  id: number,
  nome: string,
  fotoPerfil?: string,
  funcaoId: number
}

export interface Parceria {
  id: number,
  nome: string,
  tipoConvenio: string,
  dataInicio: string,
  status: string,
  tipoRelacionamento: string,
  porcentagemDesconto: number,
  cep: string,
  cnpj: string,
  url: string
}

export interface Disponibilidade {
  id: number,
  profissionalId: number,
  status: string,
  dataHoraInicio: string,
  dataHoraFim: string,
}
