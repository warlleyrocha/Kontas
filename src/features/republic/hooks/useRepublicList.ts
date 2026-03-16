// hooks/useRepublicList.ts
import { useRepublicListContext } from "@/src/features/republic/contexts/RepublicListContext";

export function useRepublicList() {
  return useRepublicListContext();
}
