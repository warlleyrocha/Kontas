import { useRouter } from "expo-router";
import { useState } from "react";
import {
  buildRepublicChanges,
  isLocalPhotoUri,
} from "@/src/shared/utils/helpers";
import { showToast } from "@/src/shared/utils/showToast";
import type { RepublicPost, RepublicResponse } from "../types/republic.types";
import {
  useCreateRepublicMutation,
  useDeleteRepublicMutation,
  useUpdateRepublicMutation,
  useUploadRepublicImageMutation,
} from "./useRepublicQueries";

export function useRepublicActions() {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const createRepublicMutation = useCreateRepublicMutation();
  const updateRepublicMutation = useUpdateRepublicMutation();
  const deleteRepublicMutation = useDeleteRepublicMutation();
  const uploadRepublicImageMutation = useUploadRepublicImageMutation();

  async function createRepublic(data: RepublicPost) {
    const republic = await createRepublicMutation.mutateAsync(data);

    const result =
      data.imagemRepublica && isLocalPhotoUri(data.imagemRepublica)
        ? await uploadRepublicImageMutation.mutateAsync({
            id: republic.id,
            uri: data.imagemRepublica,
          })
        : republic;

    showToast.success("República criada com sucesso");
    router.replace(`/(republics)/${republic.id}`);
    return result;
  }

  async function updateRepublic(
    id: string,
    currentRepublic: RepublicResponse,
    data: RepublicPost
  ) {
    const changes = buildRepublicChanges(currentRepublic, data);
    const hasNewImage =
      data.imagemRepublica && isLocalPhotoUri(data.imagemRepublica);

    // Nada mudou
    if (Object.keys(changes).length === 0 && !hasNewImage) {
      return currentRepublic;
    }

    let updatedRepublic = currentRepublic;

    // Atualizar nome se mudou
    if (changes.nome) {
      updatedRepublic = await updateRepublicMutation.mutateAsync({
        id,
        data: changes,
      });
    }

    // Upload imagem se mudou
    if (hasNewImage) {
      updatedRepublic = await uploadRepublicImageMutation.mutateAsync({
        id: updatedRepublic.id,
        uri: data.imagemRepublica!,
      });
    }

    showToast.success("República atualizada");
    return updatedRepublic;
  }

  async function deleteRepublic(id: string) {
    await deleteRepublicMutation.mutateAsync(id);
    showToast.success("República removida");
  }

  return {
    createRepublic,
    updateRepublic,
    deleteRepublic,
    showEditModal,
    setShowEditModal,
  };
}
