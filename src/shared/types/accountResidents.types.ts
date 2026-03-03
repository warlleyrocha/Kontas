import { StatusConta } from "@/src/features/accounts/types/account.types";

export interface ContaMorador {
  id: string;
  contaId: string;
  moradorId: string;
  moradorNome: string;
  status: StatusConta;
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

export interface ListarContasResponse {
  id: string;
  nome: string;
  valor: number;
  dataVencimento: string;
  moradores: ContaMorador[];
}
