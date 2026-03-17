// hooks/useRepublicActions.ts

import { useRouter } from "expo-router";
import { useState } from "react";
import { showToast } from "@/src/shared/utils/showToast";
import { republicService } from "../services/republic.service";
import type { RepublicPost } from "../types/republic.types";

export function useRepublicActions() {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);

  async function createRepublic(data: RepublicPost) {
    const republic = await republicService.createRepublic(data);
    showToast.success("República criada com sucesso");
    router.replace(`/(republics)/${republic.id}`);
    return republic;
  }

  async function updateRepublic(id: string, data: RepublicPost) {
    await republicService.updateRepublic(id, data);
    showToast.success("República atualizada");
  }

  async function deleteRepublic(id: string) {
    await republicService.deleteRepublic(id);
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
