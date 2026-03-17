// hooks/useRepublicActions.ts

import { useRouter } from "expo-router";
import { useState } from "react";
import { useRepublicList } from "@/src/features/republic/hooks/useRepublicList";
import { showToast } from "@/src/shared/utils/showToast";
import { republicService } from "../services/republic.service";
import type { RepublicPost } from "../types/republic.types";

export function useRepublicActions() {
  const router = useRouter();
  const { setRepublics } = useRepublicList();
  const [showEditModal, setShowEditModal] = useState(false);

  async function createRepublic(data: RepublicPost) {
    const republic = await republicService.createRepublic(data);
    setRepublics((current) => {
      if (current.some((item) => item.id === republic.id)) {
        return current;
      }
      return [...current, republic];
    });
    showToast.success("República criada com sucesso");
    router.replace(`/(republics)/${republic.id}`);
    return republic;
  }

  async function updateRepublic(id: string, data: RepublicPost) {
    const updatedRepublic = await republicService.updateRepublic(id, data);
    setRepublics((current) =>
      current.map((republic) =>
        republic.id === id ? updatedRepublic : republic
      )
    );
    showToast.success("República atualizada");
  }

  async function deleteRepublic(id: string) {
    await republicService.deleteRepublic(id);
    setRepublics((current) => current.filter((republic) => republic.id !== id));
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
