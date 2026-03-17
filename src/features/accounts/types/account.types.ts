import { ContaMorador } from "@/src/features/accounts/types/accountResidents.types";

// Enums
export enum StatusConta {
  PENDENTE = "PENDENTE",
  PAGA = "PAGA",
  ATRASADA = "ATRASADA",
}

export enum MetodoPagamento {
  PIX = "PIX",
  DINHEIRO = "DINHEIRO",
  CARTAO = "CARTAO",
}

// Tipo base
export type Conta = {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: StatusConta;
  republicaId: string;
  criadoPorId: string;
  criadoPorNome: string;
  metodoPagamento: string | null;
  pago: boolean;
  pagoEm?: Date | null;
  criadoEm: string;
  atualizadoEm: string;
};

// POST /contas
export type CriarContaRequest = {
  descricao: string;
  valor: number;
  vencimento: string;
  republicaId: string;
  status: StatusConta;
  metodoPagamento: MetodoPagamento;
};

export type CriarContaComMoradoresRequest = CriarContaRequest & {
  moradorIds: string[];
};

export type ListarContasResponse = ContaMorador[];
export type ListarContasRepublic = Conta[];

// DELETE /contas/{id}
export type RemoverContaParams = {
  id: string;
};

export type MarcarContaPaga = {
  id: string;
  metodoPagamento: MetodoPagamento;
};

// Tipos de erro (opcionais, mas úteis)
export type ErroAPI = {
  message: string;
  statusCode: number;
};
