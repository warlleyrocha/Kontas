// Enums
export enum StatusConta {
  PENDENTE = "PENDENTE",
  PAGO = "PAGO",
  ATRASADO = "ATRASADO",
}

// Types base
export type Conta = {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string; // ISO 8601 date string
  status: StatusConta;
  republicaId: string;
  criadoEm: string; // ISO 8601 datetime string
  atualizadoEm: string; // ISO 8601 datetime string
};

// POST /contas
export type CriarContaRequest = {
  descricao: string;
  valor: number;
  vencimento: string; // Formato: "DD/MM/YYYY" ou ISO 8601
  republicaId: string;
  status: StatusConta;
};

// GET /contas/republica/{republicaId}
export type ListarContasParams = {
  republicaId: string;
};

export type ListarContasResponse = Conta[];

// PATCH /contas/{id}/status
export type AtualizarStatusContaParams = {
  id: string;
};

export type AtualizarStatusContaRequest = {
  status: StatusConta;
};

export type AtualizarStatusContaResponse = {
  id: string;
  status: StatusConta;
};

// DELETE /contas/{id}
export type RemoverContaParams = {
  id: string;
};

// Tipos de erro (opcionais, mas úteis)
export type ErroAPI = {
  message: string;
  statusCode: number;
};
