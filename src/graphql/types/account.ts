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
