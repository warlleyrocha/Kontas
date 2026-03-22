import type { ReactElement } from "react";
import { toast } from "sonner-native";
import { Toast, ToastConfirm } from "@/src/shared/components/ui/toast-custom";
import { showToast } from "../showToast";

jest.mock("sonner-native", () => ({
  __esModule: true,
  toast: {
    custom: jest.fn(),
    dismiss: jest.fn(),
  },
}));

jest.mock("@/src/shared/components/ui/toast-custom", () => ({
  __esModule: true,
  Toast: jest.fn(() => null),
  ToastConfirm: jest.fn(() => null),
}));

const mockToast = jest.mocked(toast);
const mockToastComponent = jest.mocked(Toast);
const mockToastConfirmComponent = jest.mocked(ToastConfirm);

describe("showToast", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.custom.mockReturnValue("toast-id");
  });

  it.each([
    ["success", "success", "mensagem de sucesso"],
    ["error", "error", "mensagem de erro"],
    ["info", "info", "mensagem informativa"],
  ] as const)(
    "renderiza Toast no caso %s com duração padrão",
    (method, variant, message) => {
      showToast[method](message, "icone");

      expect(mockToast.custom).toHaveBeenCalledTimes(1);
      const element = mockToast.custom.mock.calls[0]?.[0] as ReactElement<{
        variant: string;
        message: string;
        icon?: unknown;
      }>;

      expect(element.type).toBe(mockToastComponent);
      expect(element.props).toMatchObject({
        variant,
        message,
        icon: "icone",
      });
      expect(mockToast.custom.mock.calls[0]?.[1]).toEqual({ duration: 2000 });
    },
  );

  it("renderiza ToastConfirm e conecta confirmar e cancelar ao dismiss", () => {
    const onConfirm = jest.fn();

    showToast.confirm("confirmar ação", onConfirm);

    expect(mockToast.custom).toHaveBeenCalledTimes(1);
    const element = mockToast.custom.mock.calls[0]?.[0] as ReactElement<{
      message: string;
      duration: number;
      onConfirm: () => void;
      onCancel: () => void;
    }>;

    expect(element.type).toBe(mockToastConfirmComponent);
    expect(element.props.message).toBe("confirmar ação");
    expect(element.props.duration).toBe(8000);
    expect(mockToast.custom.mock.calls[0]?.[1]).toEqual({ duration: 8000 });

    element.props.onConfirm();

    expect(mockToast.dismiss).toHaveBeenCalledWith("toast-id");
    expect(onConfirm).toHaveBeenCalledTimes(1);

    element.props.onCancel();

    expect(mockToast.dismiss).toHaveBeenCalledWith("toast-id");
  });
});
