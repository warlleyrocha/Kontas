import { useRouter } from "expo-router";
import { useState } from "react";
import { showToast } from "@/src/shared/utils/showToast";
import type { RepublicPost } from "../types/republic.types";
import {
  useCreateRepublicMutation,
  useDeleteRepublicMutation,
  useUpdateRepublicMutation,
} from "./useRepublicQueries";

export function useRepublicActions() {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const createRepublicMutation = useCreateRepublicMutation();
  const updateRepublicMutation = useUpdateRepublicMutation();
  const deleteRepublicMutation = useDeleteRepublicMutation();

  async function createRepublic(data: RepublicPost) {
    const republic = await createRepublicMutation.mutateAsync(data);
    showToast.success("República criada com sucesso");
    router.replace(`/(republics)/${republic.id}`);
    return republic;
  }

  async function updateRepublic(id: string, data: RepublicPost) {
    const updatedRepublic = await updateRepublicMutation.mutateAsync({
      id,
      data,
    });
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
