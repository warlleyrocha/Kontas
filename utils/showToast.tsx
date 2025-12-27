// utils/showToast.tsx
import { Toast } from "@/components/ui/toast-custom";
import { ReactNode } from "react";
import { toast } from "sonner-native";

const DEFAULT_DURATION = 2000;

export const showToast = {
  success(message: string, icon?: ReactNode) {
    toast.custom(<Toast variant="success" message={message} icon={icon} />, {
      duration: DEFAULT_DURATION,
    });
  },

  error(message: string, icon?: ReactNode) {
    toast.custom(<Toast variant="error" message={message} icon={icon} />, {
      duration: DEFAULT_DURATION,
    });
  },

  info(message: string, icon?: ReactNode) {
    toast.custom(<Toast variant="info" message={message} icon={icon} />, {
      duration: DEFAULT_DURATION,
    });
  },
};
