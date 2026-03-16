// utils/showToast.tsx
import { ReactNode } from "react";
import { toast } from "sonner-native";

import { Toast, ToastConfirm } from "@/src/shared/components/ui/toast-custom";

const DEFAULT_DURATION = 2000;
const CONFIRM_DURATION = 8000;

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

  confirm(message: string, onConfirm: () => void) {
    const id = toast.custom(
      <ToastConfirm
        message={message}
        duration={CONFIRM_DURATION}
        onConfirm={() => {
          toast.dismiss(id);
          onConfirm();
        }}
        onCancel={() => toast.dismiss(id)}
      />,
      { duration: CONFIRM_DURATION },
    );
  },
};
