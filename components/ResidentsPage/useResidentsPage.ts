import type { Morador, Republica } from "@/types/resume";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

interface UseResidentsPageProps {
  republica: Republica;
  setRepublica: (rep: Republica) => void;
}

export const useResidentsPage = ({
  republica,
  setRepublica,
}: UseResidentsPageProps) => {
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [moradorParaEditar, setMoradorParaEditar] = useState<Morador | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{
    nome: string;
    chavePix: string;
    fotoPerfil?: string;
  }>({
    nome: "",
    chavePix: "",
    fotoPerfil: undefined,
  });

  const abrirNovoMorador = () => {
    setMoradorParaEditar(null);
    setEditForm({ nome: "", chavePix: "", fotoPerfil: undefined });
    setShowEditModal(true);
  };

  const copiarChavePix = async (morador: Morador) => {
    if (!morador.chavePix) {
      Alert.alert("Erro", "Morador não possui chave PIX cadastrada.");
      return;
    }

    await Clipboard.setStringAsync(morador.chavePix);
    setCopiadoId(morador.id);
    Alert.alert("Copiado", "Chave PIX copiada para a área de transferência.");
    setTimeout(() => setCopiadoId(null), 1500);
  };

  const calcularDividaPorMorador = (moradorId: string) => {
    return republica.contas.reduce((total, conta) => {
      const resp = conta.responsaveis.find((r) => r.moradorId === moradorId);
      // Só conta como dívida se o responsável específico não pagou
      if (resp && !resp.pago) {
        return total + resp.valor;
      }
      return total;
    }, 0);
  };

  const quantidadeContasPendentes = (moradorId: string) => {
    return republica.contas.filter((conta) =>
      conta.responsaveis.some((r) => r.moradorId === moradorId && !r.pago)
    ).length;
  };

  const abrirEdicaoMorador = (morador: Morador) => {
    setMoradorParaEditar(morador);
    setEditForm({
      nome: morador.nome,
      chavePix: morador.chavePix || "",
      fotoPerfil: morador.fotoPerfil,
    });
    setShowEditModal(true);
  };

  const salvarEdicaoMorador = () => {
    if (!editForm.nome.trim()) {
      Alert.alert("Erro", "Informe o nome do morador.");
      return;
    }

    if (moradorParaEditar) {
      // Editar morador existente
      setRepublica({
        ...republica,
        moradores: republica.moradores.map((m) =>
          m.id === moradorParaEditar.id
            ? {
                ...m,
                nome: editForm.nome.trim(),
                chavePix: editForm.chavePix?.trim() || undefined,
                fotoPerfil: editForm.fotoPerfil,
              }
            : m
        ),
      });
      Alert.alert("Sucesso", "Morador atualizado com sucesso!");
    } else {
      // Adicionar novo morador
      const novo: Morador = {
        id: Date.now().toString(),
        nome: editForm.nome.trim(),
        chavePix: editForm.chavePix?.trim() || undefined,
        fotoPerfil: editForm.fotoPerfil,
      };
      setRepublica({
        ...republica,
        moradores: [...republica.moradores, novo],
      });
      Alert.alert("Sucesso", "Morador adicionado com sucesso!");
    }

    setShowEditModal(false);
    setMoradorParaEditar(null);
    setEditForm({ nome: "", chavePix: "", fotoPerfil: undefined });
  };

  const fecharEdicaoMorador = () => {
    setShowEditModal(false);
    setMoradorParaEditar(null);
    setEditForm({ nome: "", chavePix: "", fotoPerfil: undefined });
  };

  const selecionarImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar suas fotos!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setEditForm((s) => ({ ...s, fotoPerfil: result.assets[0].uri }));
    }
  };

  const updateEditFormField = <K extends keyof typeof editForm>(
    field: K,
    value: (typeof editForm)[K]
  ) => {
    setEditForm((s) => ({ ...s, [field]: value }));
  };

  const deletarMorador = (morador: Morador) => {
    Alert.alert(
      "Confirmar exclusão",
      `Tem certeza que deseja excluir ${morador.nome}?`,
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
              moradores: republica.moradores.filter((m) => m.id !== morador.id),
            });
            Alert.alert("Sucesso", "Morador excluído com sucesso!");
          },
        },
      ]
    );
  };

  return {
    // Estados
    copiadoId,
    moradorParaEditar,
    showEditModal,
    editForm,

    // Funções de gerenciamento de moradores
    abrirNovoMorador,
    abrirEdicaoMorador,
    salvarEdicaoMorador,
    fecharEdicaoMorador,
    deletarMorador,

    // Funções de cálculo
    calcularDividaPorMorador,
    quantidadeContasPendentes,

    // Funções utilitárias
    copiarChavePix,
    selecionarImagem,
    updateEditFormField,
  };
};
