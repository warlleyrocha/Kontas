export type StatusConta = "PENDENTE" | "PAGA" | "ATRASADA";

export type ContaGraphQL = {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string; // DateTime vem como string do GraphQL
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
  status: "aberta" | "paga"; // Status simplificado para UI
  mesReferencia: string; // formato: "2024-12"
  republicaId: string;
};

// Input para criar uma conta
export type CriarContaInput = {
  descricao: string;
  valor: number;
  vencimento: string; // DateTime em formato ISO
  republicaId: string;
  status?: StatusConta; // Opcional
};

// Variáveis da mutation de criar conta
export type CriarContaVariables = {
  data: CriarContaInput;
};

// Resposta da mutation de criar conta
export type CriarContaResponse = {
  criarConta: ContaGraphQL;
};
