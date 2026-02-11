import { gql } from "@apollo/client";

export const GET_CONTAS_POR_REPUBLICA = gql`
  query GetContasPorRepublica($republicaId: String!) {
    contasPorRepublica(republicaId: $republicaId) {
      id
      descricao
      valor
      vencimento
      metodoPagamento
      status
      criadoEm
      atualizadoEm
      republicaId
    }
  }
`;
