import { republicService } from "@/src/features/republic/services/republic.service";
import type {
  RepublicPost,
  RepublicResponse,
} from "@/src/features/republic/types/republic.types";
import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/utils/showToast";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

type UseRepublicState = {
  republicName: string;
  republicImage?: string;
  republics: RepublicResponse[];
  showEditModal: boolean;
};

type UseRepublicActions = {
  setRepublicName: (name: string) => void;
  setRepublicImage: (uri?: string) => void;
  setRepublics: (republics: RepublicResponse[]) => void;
  setShowEditModal: (visible: boolean) => void;
  fetchRepublics: () => Promise<void>;
  fetchRepublicById: (id: string) => Promise<RepublicResponse | null>;
  updatedRepublic: (id: string, data: RepublicPost) => Promise<boolean>;
  deleteRepublic?: (id: string) => Promise<boolean>;
  handleSelectImageRepublic: () => Promise<void>;
  handlePress: () => Promise<void>;
};

type UseRepublicReturn = UseRepublicState & UseRepublicActions;

export function useRepublic(): UseRepublicReturn {
  const router = useRouter();

  const [republics, setRepublics] = useState<RepublicResponse[]>([]);
  const [republicName, setRepublicName] = useState("");
  const [republicImage, setRepublicImage] = useState<string | undefined>(
    undefined
  );
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSelectImageRepublic = async () => {
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
      setRepublicImage(result.assets[0].uri);
    }
  };

  const handlePress = async () => {
    try {
      console.log("Salvando republica...");

      const newRepublic: RepublicPost = {
        nome: republicName,
        imagemRepublica: republicImage,
      };

      const republicCreated = await republicService.createRepublic(newRepublic);

      console.log("República cadastrada com sucesso", republicCreated.nome);

      // Navega para a página da república criada
      router.push(`/(republics)/${republicCreated.id}`);
    } catch (error) {
      console.error("Erro ao salvar republica:", error);
      showToast.error(getErrorMessage(error, "Não foi possível salvar a república."));
    }
  };

  // Função para buscar repúblicas
  const fetchRepublics = useCallback(async () => {
    try {
      const data = await republicService.getRepublics();
      setRepublics(data);
    } catch (error) {
      console.error("Erro ao buscar repúblicas:", error);
      showToast.error(
        getErrorMessage(error, "Não foi possível carregar as repúblicas.")
      );
      setRepublics([]);
    } finally {
      console.log("Busca de repúblicas finalizada.");
    }
  }, []);

  // Função para buscar repúblicas por ID
  const fetchRepublicById = useCallback(async (id: string) => {
    try {
      const republic = await republicService.getRepublicById(id);
      return republic;
    } catch (error) {
      console.warn("Não foi possível buscar república por ID:", error);
      return null;
    }
  }, []);

  // Função para atualizar república
  const updateRepublic = useCallback(
    async (id: string, data: RepublicPost): Promise<boolean> => {
      try {
        await republicService.updateRepublic(id, data);
        console.log("República atualizada:", data.nome, data.imagemRepublica);

        // Atualizar a lista de repúblicas após a atualização
        const updatedRepublics = republics.map((r) =>
          r.id === id ? { ...r, ...data } : r
        );
        setRepublics(updatedRepublics);

        showToast.success("República atualizada com sucesso");
        return true;
      } catch (error) {
        console.error("Erro ao atualizar república:", error);
        showToast.error(getErrorMessage(error, "Erro ao atualizar república"));
        return false;
      }
    },
    [republics]
  );

  // Função para deletar república
  const deleteRepublic = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await republicService.deleteRepublic(id);
        console.log("República deletada:", id);

        // Atualizar a lista de repúblicas após a deleção
        const updatedRepublics = republics.filter((r) => r.id !== id);
        setRepublics(updatedRepublics);

        showToast.success("República deletada com sucesso");
        return true;
      } catch (error) {
        console.error("Erro ao deletar república:", error);
        showToast.error(getErrorMessage(error, "Erro ao deletar república"));
        return false;
      }
    },
    [republics]
  );

  // Wrapper para setRepublicImage
  const setRepublicImageWrapper = (uri?: string) => {
    setRepublicImage(uri ?? "");
  };

  return {
    // Estados dos dados da república
    republicName,
    republicImage,
    republics,
    showEditModal,

    // Funções para atualizar os estados
    setRepublicName,
    setRepublicImage: setRepublicImageWrapper,
    handleSelectImageRepublic,
    setRepublics,
    setShowEditModal,

    // Funções de ação
    handlePress,
    fetchRepublics,
    fetchRepublicById,
    updatedRepublic: updateRepublic,
    deleteRepublic,
  };
}
