import type { Morador, Republica } from "@/types/resume";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ResidentCard } from "./ResidentCard";
import { useResidentsPage } from "./useResidentsPage";

interface ResidentsTabProps {
  republica: Republica;
  setRepublica: (rep: Republica) => void;
}

export const ResidentsTab: React.FC<ResidentsTabProps> = ({
  republica,
  setRepublica,
}) => {
  const {
    copiadoId,
    moradorParaEditar,
    showEditModal,
    editForm,
    abrirNovoMorador,
    abrirEdicaoMorador,
    salvarEdicaoMorador,
    fecharEdicaoMorador,
    deletarMorador,
    calcularDividaPorMorador,
    quantidadeContasPendentes,
    copiarChavePix,
    selecionarImagem,
    updateEditFormField,
  } = useResidentsPage({ republica, setRepublica });

  const renderMorador = ({ item: morador }: { item: Morador }) => {
    const divida = calcularDividaPorMorador(morador.id);
    const qtd = quantidadeContasPendentes(morador.id);

    return (
      <ResidentCard
        morador={morador}
        divida={divida}
        qtdContasPendentes={qtd}
        copiadoId={copiadoId}
        onPress={abrirEdicaoMorador}
        onCopyPix={copiarChavePix}
        onDelete={deletarMorador}
      />
    );
  };

  const renderItemSeparator = () => <View className="h-4" />;

  return (
    <View className="space-y-4">
      {/* botão adicionar */}
      <TouchableOpacity
        onPress={abrirNovoMorador}
        className="mb-5 mt-2 items-center rounded-md bg-indigo-600 py-3"
      >
        <View className="flex-row items-center">
          <Feather name="plus" size={16} color="#fff" />
          <Text className="ml-2 font-medium text-white">Adicionar Morador</Text>
        </View>
      </TouchableOpacity>

      {/* lista de moradores */}
      <FlatList
        data={republica.moradores}
        keyExtractor={(m) => m.id}
        renderItem={renderMorador}
        ItemSeparatorComponent={renderItemSeparator}
        contentContainerStyle={{ paddingBottom: 130 }}
      />

      {/* Modal de Edição de Morador */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={fecharEdicaoMorador}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="rounded-t-2xl bg-white px-6 py-6">
              {/* Header */}
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-xl font-semibold">
                  {moradorParaEditar ? "Editar Morador" : "Novo Morador"}
                </Text>
                <TouchableOpacity onPress={fecharEdicaoMorador}>
                  <Feather name="x" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Foto de Perfil */}
              <TouchableOpacity
                onPress={selecionarImagem}
                className="mb-6 items-center"
              >
                <View className="h-28 w-28 items-center justify-center rounded-full bg-indigo-100">
                  {editForm.fotoPerfil ? (
                    <Image
                      source={{ uri: editForm.fotoPerfil }}
                      className="h-28 w-28 rounded-full"
                    />
                  ) : (
                    <Feather name="user" size={56} color="#4f46e5" />
                  )}
                </View>
                <Text className="mt-2 text-sm text-indigo-600">
                  Toque para alterar a foto
                </Text>
              </TouchableOpacity>

              {/* Nome */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-700">
                  Nome
                </Text>
                <TextInput
                  value={editForm.nome}
                  onChangeText={(t) => updateEditFormField("nome", t)}
                  placeholder="Nome do morador"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                />
              </View>

              {/* Chave PIX */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-semibold text-gray-700">
                  Chave PIX (opcional)
                </Text>
                <TextInput
                  value={editForm.chavePix}
                  onChangeText={(t) => updateEditFormField("chavePix", t)}
                  placeholder="Email, CPF ou telefone"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                />
              </View>

              {/* Botões */}
              <View className="flex-row gap-3 pb-6">
                <TouchableOpacity
                  onPress={salvarEdicaoMorador}
                  className="flex-1 items-center rounded-lg bg-indigo-600 py-3"
                >
                  <Text className="font-semibold text-white">Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={fecharEdicaoMorador}
                  className="flex-1 items-center rounded-lg border border-gray-300 bg-white py-3"
                >
                  <Text className="font-semibold text-gray-700">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ResidentsTab;
