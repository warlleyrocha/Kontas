import { ContaMorador } from "@/src/shared/types/accountResidents.types";

// Enums
export enum StatusConta {
  PENDENTE = "PENDENTE",
  PAGO = "PAGO",
  ATRASADO = "ATRASADO",
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
  metodoPagamento: string;
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
  metodoPagamento: string;
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

// Tipos de erro (opcionais, mas úteis)
export type ErroAPI = {
  message: string;
  statusCode: number;
};
