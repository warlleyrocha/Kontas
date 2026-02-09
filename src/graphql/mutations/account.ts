import { gql } from "@apollo/client";

// Criar uma nova conta
export const CRIAR_CONTA = gql`
  mutation CriarConta($data: CriarContaInput!) {
    criarConta(data: $data) {
      id
      descricao
      valor
      vencimento
      status
      criadoEm
      atualizadoEm
      republicaId
    }
  }
`;

// Atualizar status de uma conta
export const ATUALIZAR_STATUS_CONTA = gql`
  mutation AtualizarStatusConta($contaId: String!, $data: AtualizarContaInput!) {
    atualizarStatus(contaId: $contaId, data: $data) {
      id
      descricao
      valor
      vencimento
      status
      criadoEm
      atualizadoEm
      republicaId
    }
  }
`;

// Remover uma conta
export const REMOVER_CONTA = gql`
  mutation RemoverConta($contaId: String!) {
    removerConta(contaId: $contaId)
  }
`;
