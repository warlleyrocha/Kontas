import { CRIAR_CONTA, REMOVER_CONTA } from "@/src/graphql/mutations/account";
import { GET_CONTAS_POR_REPUBLICA } from "@/src/graphql/queries/accounts";
import type { CriarContaInput } from "@/src/graphql/types/account";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

export function useAccountActions(republicId: string) {
  const [showAccountModal, setShowAccountModal] = useState(false);

  const [criarConta] = useMutation(CRIAR_CONTA, {
    refetchQueries: [
      {
        query: GET_CONTAS_POR_REPUBLICA,
        variables: { republicaId: republicId },
      },
    ], // Atualiza lista automaticamente
    onCompleted: (result) => {
      console.log("retorno criarConta", JSON.stringify(result, null, 2));
      setShowAccountModal(false);
      // Mostrar toast de sucesso
    },

    onError: (error) => {
      // Mostrar toast de erro
      console.error(error);
    },
  });

  const [deletarConta] = useMutation(REMOVER_CONTA, {
    refetchQueries: [
      {
        query: GET_CONTAS_POR_REPUBLICA,
        variables: { republicaId: republicId },
      },
    ],
  });

  const handleSubmit = async (data: CriarContaInput) => {
    console.log("data enviada", JSON.stringify(data, null, 2));
    await criarConta({ variables: { data } });
  };

  const handleDelete = async (accountId: string) => {
    console.log("Deletar conta", accountId);
    await deletarConta({ variables: { contaId: accountId } });
  };
  return {
    showAccountModal,
    setShowAccountModal,
    handleSubmit,
    handleDelete,
  };
}
