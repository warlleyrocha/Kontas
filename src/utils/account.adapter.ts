import { ContaGraphQL, ContaAdaptada } from "@/src/graphql/types/account";

export function adaptarContaGraphQL(conta: ContaGraphQL): ContaAdaptada {
  const vencimento = new Date(conta.vencimento);
  const mesReferencia = `${vencimento.getFullYear()}-${String(vencimento.getMonth() + 1).padStart(2, "0")}`;

  // Adapta o status do GraphQL para o formato da UI
  const statusUI = conta.status === "PAGA" ? "paga" : "aberta";

  return {
    id: conta.id,
    descricao: conta.descricao,
    valor: conta.valor,
    vencimento,
    status: statusUI,
    mesReferencia,
    republicaId: conta.republicaId,
  };
}
