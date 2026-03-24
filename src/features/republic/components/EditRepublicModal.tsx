import Feather from "@expo/vector-icons/Feather";
import type { FC } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useEditRepublicModal from "@/src/features/republic/hooks/useEditRepublicModal";

interface EditRepublicModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  currentImage?: string;
  onSave: (name: string, image?: string) => void;
}

export const EditRepublicModal: FC<EditRepublicModalProps> = ({
  visible,
  onClose,
  currentName,
  currentImage,
  onSave,
}) => {
  const {
    nome,
    setNome,
    imagemUri,
    isUploading,
    limpar,
    salvar,
    selecionarImagem,
  } = useEditRepublicModal({
    visible,
    onClose,
    currentName,
    currentImage,
    onSave,
  });

  const handleClose = () => {
    limpar();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className=" flex-1 justify-end bg-black/40">
          <SafeAreaView className="rounded-xl bg-white px-6 py-6">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Editar República</Text>

              <TouchableOpacity onPress={handleClose} className="p-2">
                <Feather name="x" size={24} color="#337176" />
              </TouchableOpacity>
            </View>

            {/* Foto da República */}

            <TouchableOpacity
              onPress={selecionarImagem}
              className="mb-6 items-center"
            >
              <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-teal/40 bg-teal/10">
                {imagemUri ? (
                  <Image
                    source={{ uri: imagemUri }}
                    className="h-28 w-28 rounded-full"
                  />
                ) : (
                  <Feather name="camera" size={40} color="#337176" />
                )}
              </View>
              <Text className="mt-2 text-sm text-teal">
                Toque para alterar a foto
              </Text>
            </TouchableOpacity>

            {/* Nome da República */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Nome da República
              </Text>
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: Casa Amarela"
                className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                editable={!isUploading}
              />
            </View>

            {/* Botões de Ação */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={salvar}
                className="flex-1 items-center rounded-lg bg-teal py-3"
              >
                <Text className="font-semibold text-white">Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 items-center rounded-lg border border-gray-300 bg-white py-3"
              >
                <Text className="font-semibold text-gray-700">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
