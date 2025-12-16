import type { Conta, Republica } from "@/types/resume";
import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

interface UseAccountsProps {
  republica: Republica;
  setRepublica: (rep: Republica) => void;
}

export function useAccounts({ republica, setRepublica }: UseAccountsProps) {
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
  const [contaParaEditar, setContaParaEditar] = useState<Conta | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mostrarContasPagas, setMostrarContasPagas] = useState(false);
  const [mostrarContasAbertas, setMostrarContasAbertas] = useState(true);

  // Obter meses únicos das contas
  const mesesDisponiveis = useMemo(() => {
    const meses = new Set<string>();
    for (const conta of republica.contas) {
      const data = new Date(conta.vencimento);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      meses.add(mesAno);
    }
    return Array.from(meses)
      .sort((a, b) => a.localeCompare(b))
      .reverse();
  }, [republica.contas]);

  const formatarMesAno = (mesAno: string) => {
    const [ano, mes] = mesAno.split("-");
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return `${meses[Number.parseInt(mes) - 1]} ${ano}`;
  };

  const marcarComoPago = (contaId: string) => {
    setRepublica({
      ...republica,
      contas: republica.contas.map((conta) =>
        conta.id === contaId
          ? {
              ...conta,
              pago: !conta.pago,
              pagoEm: conta.pago ? new Date().toISOString() : undefined,
            }
          : conta
      ),
    });
  };

  const marcarResponsavelComoPago = (contaId: string, moradorId: string) => {
    setRepublica({
      ...republica,
      contas: republica.contas.map((conta) =>
        conta.id === contaId
          ? {
              ...conta,
              responsaveis: conta.responsaveis.map((resp) =>
                resp.moradorId === moradorId
                  ? { ...resp, pago: !resp.pago }
                  : resp
              ),
            }
          : conta
      ),
    });
  };

  const copiarChavePix = async (conta: Conta) => {
    const responsavel = republica.moradores.find(
      (m) => m.id === conta.responsavelId
    );

    if (responsavel?.chavePix) {
      await Clipboard.setStringAsync(responsavel.chavePix);
      setCopiadoId(conta.id);
      Alert.alert("Pix copiado!", "Chave PIX copiada com sucesso.");
      setTimeout(() => setCopiadoId(null), 1500);
    } else {
      Alert.alert("Erro", "Nenhuma chave PIX cadastrada para este morador.");
    }
  };

  const abrirEdicao = (conta: Conta) => {
    setContaParaEditar(conta);
    setShowEditModal(true);
  };

  const fecharEdicao = () => {
    setShowEditModal(false);
    setContaParaEditar(null);
  };

  const deletarConta = (conta: Conta) => {
    Alert.alert(
      "Confirmar exclusão",
      `Tem certeza que deseja excluir a conta "${conta.descricao}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            setRepublica({
              ...republica,
              contas: republica.contas.filter((c) => c.id !== conta.id),
            });
            Alert.alert("Sucesso", "Conta excluída com sucesso!");
          },
        },
      ]
    );
  };

  const contasOrdenadas = useMemo(() => {
    const contas = [...republica.contas].filter((conta) => {
      if (mesSelecionado === "todos") return true;
      const data = new Date(conta.vencimento);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      return mesAno === mesSelecionado;
    });

    const abertas = contas
      .filter((c) => !c.pago)
      .sort(
        (a, b) =>
          new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()
      );

    const pagas = contas
      .filter((c) => c.pago)
      .sort(
        (a, b) =>
          new Date(b.vencimento).getTime() - new Date(a.vencimento).getTime()
      );

    return { abertas, pagas };
  }, [republica.contas, mesSelecionado]);

  return {
    copiadoId,
    expandidaId,
    setExpandidaId,
    mesSelecionado,
    setMesSelecionado,
    contaParaEditar,
    showEditModal,
    mesesDisponiveis,
    contasOrdenadas,
    mostrarContasPagas,
    setMostrarContasPagas,
    mostrarContasAbertas,
    setMostrarContasAbertas,
    formatarMesAno,
    marcarComoPago,
    marcarResponsavelComoPago,
    copiarChavePix,
    abrirEdicao,
    fecharEdicao,
    deletarConta,
  };
}
