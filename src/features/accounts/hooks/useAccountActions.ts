import { CRIAR_CONTA } from "@/src/graphql/mutations/account";
import { GET_CONTAS_POR_REPUBLICA } from "@/src/graphql/queries/accounts";
import type { CriarContaInput } from "@/src/graphql/types/account";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

export function useAccountActions() {
  const [showAccountModal, setShowAccountModal] = useState(false);

  const [criarConta] = useMutation(CRIAR_CONTA, {
    refetchQueries: [GET_CONTAS_POR_REPUBLICA], // Atualiza lista automaticamente
    onCompleted: (result) => {
      console.log("retorno criarConta", result);
      setShowAccountModal(false);
      // Mostrar toast de sucesso
    },
    onError: (error) => {
      // Mostrar toast de erro
      console.error(error);
    },
  });

  const handleSubmit = async (data: CriarContaInput) => {
    console.log("data enviada", data);
    await criarConta({ variables: { data } });
  };

  return {
    showAccountModal,
    setShowAccountModal,
    handleSubmit,
  };
}
