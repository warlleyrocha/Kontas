import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CopyFeedbackMap } from "@/src/shared/hooks/useCopyFeedback";

export const accountCopyFeedback: CopyFeedbackMap = {
  idle: {
    accessibilityLabel: "Copiar chave PIX",
    icon: <Feather name="copy" size={16} color="#337176" />,
    text: "Copiar PIX",
  },
  success: {
    accessibilityLabel: "Chave PIX copiada",
    icon: <Ionicons name="checkmark" size={16} color="#16a34a" />,
    text: "PIX Copiado",
  },
  error: {
    accessibilityLabel: "Falha ao copiar chave PIX",
    icon: <Feather name="x" size={16} color="#dc2626" />,
    text: "Falha ao copiar",
  },
};

export const residentCopyFeedback: CopyFeedbackMap = {
  idle: {
    accessibilityLabel: "Copiar chave PIX",
    icon: <Feather name="copy" size={18} color="#337176" />,
    text: "",
  },
  success: {
    accessibilityLabel: "Chave PIX copiada",
    icon: <Ionicons name="checkmark" size={18} color="#16a34a" />,
    text: "",
  },
  error: {
    accessibilityLabel: "Falha ao copiar chave PIX",
    icon: <Feather name="x" size={18} color="#dc2626" />,
    text: "",
  },
};
