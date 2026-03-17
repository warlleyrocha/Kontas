export enum StatusPagamento {
  PENDENTE = "PENDENTE",
  AGUARDANDO_CONFIRMACAO = "AGUARDANDO_CONFIRMACAO",
  PAGO = "PAGO",
}
export interface ContaMorador {
  id: string;
  contaId: string;
  moradorId: string;
  moradorNome: string;
  status: StatusPagamento;
  valor: number;
  visivel: boolean;
  pagoEm: string | null;
  metodoPagamento: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

// POST /contas-moradores
export interface VincularMoradoresRequest {
  contaId: string;
  moradorIds: string[];
  valorTotal: number;
}

export interface ContaMoradorIdParams {
  id: string;
}

export interface AtualizarVisibilidadeContaMoradorRequest extends ContaMoradorIdParams {
  visivel: boolean;
}
