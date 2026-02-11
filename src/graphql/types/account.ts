export type StatusConta = "PENDENTE" | "PAGA" | "ATRASADA";

export type ContaGraphQL = {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string; // DateTime vem como string do GraphQL
  metodoPagamento: string;
  status: StatusConta;
  criadoEm: string;
  atualizadoEm: string;
  republicaId: string;
};

// Tipo adaptado para o componente (mantém compatibilidade com o mock)
export type ContaAdaptada = {
  id: string;
  descricao: string;
  valor: number;
  vencimento: Date;
  metodoPagamento: string;
  status: "aberta" | "paga"; // Status simplificado para UI
  mesReferencia: string; // formato: "2024-12"
  republicaId: string;
};

// Input para moradores responsáveis
export type ResponsavelInput = {
  moradorId: string;
  valor: number;
  pago?: boolean;
};

// Input para criar uma conta
export type CriarContaInput = {
  descricao: string;
  valor: number;
  vencimento: string; // DateTime em formato ISO
  metodoPagamento: string;
  republicaId: string;
  status?: StatusConta; // Opcional
  responsaveis?: ResponsavelInput[]; // Moradores responsáveis (será implementado no backend)
};

// Variáveis da mutation de criar conta
export type CriarContaVariables = {
  data: CriarContaInput;
};

// Resposta da mutation de criar conta
export type CriarContaResponse = {
  criarConta: ContaGraphQL;
};
