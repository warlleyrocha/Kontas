import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Platform } from "react-native";
import { useAccountForm } from "../../../hooks/useAccountForm";
import { MetodoPagamento, StatusConta } from "../../../types/account.types";
import AddAccountModal from "../AddAccountModal";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = jest.requireActual("react-native");
    return <View {...props}>{children}</View>;
  },
}));

jest.mock("../../../hooks/useAccountForm", () => ({
  useAccountForm: jest.fn(),
}));

jest.mock("@/src/shared/utils/formats", () => ({
  formatBRL: (v: number) => v.toFixed(2).replace(".", ","),
}));

jest.mock("../AddAccountModalHeader", () => ({
  AddAccountModalHeader: ({ onClose }: { onClose: () => void }) => {
    const { TouchableOpacity } = jest.requireActual("react-native");
    return (
      <TouchableOpacity
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="fechar modal"
      />
    );
  },
}));

jest.mock("../AddAccountModalFormSection", () => ({
  AddAccountModalFormSection: ({
    onDescricaoChange,
    onCycleMetodoPagamento,
  }: {
    onDescricaoChange: (v: string) => void;
    onCycleMetodoPagamento: () => void;
  }) => {
    const { TouchableOpacity, View } = jest.requireActual("react-native");
    return (
      <View>
        <TouchableOpacity
          onPress={() => onDescricaoChange("Nova Descrição")}
          accessibilityRole="button"
          accessibilityLabel="mudar descricao"
        />
        <TouchableOpacity
          onPress={onCycleMetodoPagamento}
          accessibilityRole="button"
          accessibilityLabel="ciclo pagamento"
        />
      </View>
    );
  },
}));

jest.mock("../AddAccountModalResidentsSection", () => ({
  AddAccountModalResidentsSection: () => null,
}));

jest.mock("../AddAccountModalActions", () => ({
  AddAccountModalActions: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: () => void;
    onCancel: () => void;
  }) => {
    const { TouchableOpacity, View } = jest.requireActual("react-native");
    return (
      <View>
        <TouchableOpacity
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel="adicionar conta"
        />
        <TouchableOpacity
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="voltar"
        />
      </View>
    );
  },
}));

jest.mock("@/src/shared/components/NextButton", () => ({
  NextButton: ({
    onNext,
    onCancel,
  }: {
    onNext: () => void;
    onCancel: () => void;
  }) => {
    const { TouchableOpacity, View } = jest.requireActual("react-native");
    return (
      <View>
        <TouchableOpacity
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel="próximo"
        />
        <TouchableOpacity
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="cancelar"
        />
      </View>
    );
  },
}));

const mockUseAccountForm = jest.mocked(useAccountForm);
const mockSetFormData = jest.fn();
const mockHandleCloseModal = jest.fn();
const fixedDate = new Date("2026-03-22T00:00:00.000Z");

const createHookReturn = () => ({
  formData: {
    descricao: "Conta de luz",
    valorTotal: "100,00",
    vencimento: fixedDate,
    metodoPagamento: MetodoPagamento.PIX,
    tipoDivisao: "equal" as const,
    moradoresDivisao: [
      {
        moradorId: "1",
        nome: "Ana",
        fotoPerfil: null,
        role: "Morador",
        checked: true,
        valor: "50,00",
      },
      {
        moradorId: "2",
        nome: "Bruno",
        fotoPerfil: null,
        role: "Morador",
        checked: false,
        valor: "",
      },
    ],
  },
  tempVencimento: fixedDate,
  showDatepicker: false,
  totalDivisaoPreenchido: 50,
  setFormData: mockSetFormData,
  setTempVencimento: jest.fn(),
  setShowDatepicker: jest.fn(),
  handleCloseModal: mockHandleCloseModal,
  handleConfirmDate: jest.fn(),
  handleOpenDatepicker: jest.fn(),
  handleDateChange: jest.fn(),
  handleValorTotalChange: jest.fn(),
  handleSetTipoDivisao: jest.fn(),
  handleToggleMorador: jest.fn(),
  handleMoradorValorChange: jest.fn(),
});

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  republicId: "rep-1",
  onSubmit: jest.fn(),
};

describe("AddAccountModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAccountForm.mockReturnValue(createHookReturn());
  });

  it("monta sem erros", () => {
    render(<AddAccountModal {...defaultProps} />);
  });

  it("chama handleCloseModal ao pressionar o botão de fechar", () => {
    render(<AddAccountModal {...defaultProps} />);

    fireEvent.press(screen.getByRole("button", { name: "fechar modal" }));

    expect(mockHandleCloseModal).toHaveBeenCalledTimes(1);
  });

  it("inicia na aba form e exibe NextButton", () => {
    render(<AddAccountModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: "próximo" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "adicionar conta" })
    ).toBeNull();
  });

  it("chama handleCloseModal ao pressionar cancelar na aba form", () => {
    render(<AddAccountModal {...defaultProps} />);

    fireEvent.press(screen.getByRole("button", { name: "cancelar" }));

    expect(mockHandleCloseModal).toHaveBeenCalledTimes(1);
  });

  it("navega para aba residents ao pressionar próximo", () => {
    render(<AddAccountModal {...defaultProps} />);

    fireEvent.press(screen.getByRole("button", { name: "próximo" }));

    expect(
      screen.getByRole("button", { name: "adicionar conta" })
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "próximo" })).toBeNull();
  });

  it("volta para aba form ao pressionar voltar na aba residents", () => {
    render(<AddAccountModal {...defaultProps} />);

    fireEvent.press(screen.getByRole("button", { name: "próximo" }));
    fireEvent.press(screen.getByRole("button", { name: "voltar" }));

    expect(screen.getByRole("button", { name: "próximo" })).toBeTruthy();
  });

  it("atualiza descricao via setFormData ao chamar handleDescricaoChange", () => {
    render(<AddAccountModal {...defaultProps} />);

    fireEvent.press(screen.getByRole("button", { name: "mudar descricao" }));

    const updater = mockSetFormData.mock.calls[0][0] as (prev: any) => any;
    expect(updater({ descricao: "" }).descricao).toBe("Nova Descrição");
  });

  it("cicla métodos de pagamento: PIX → CARTAO → DINHEIRO → PIX", () => {
    render(<AddAccountModal {...defaultProps} />);

    fireEvent.press(screen.getByRole("button", { name: "ciclo pagamento" }));

    const updater = mockSetFormData.mock.calls[0][0] as (prev: any) => any;

    expect(
      updater({ metodoPagamento: MetodoPagamento.PIX }).metodoPagamento
    ).toBe(MetodoPagamento.CARTAO);

    expect(
      updater({ metodoPagamento: MetodoPagamento.CARTAO }).metodoPagamento
    ).toBe(MetodoPagamento.DINHEIRO);

    expect(
      updater({ metodoPagamento: MetodoPagamento.DINHEIRO }).metodoPagamento
    ).toBe(MetodoPagamento.PIX);
  });

  it("chama onSubmit com o payload correto ao confirmar na aba residents", async () => {
    const onSubmit = jest.fn();
    render(<AddAccountModal {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.press(screen.getByRole("button", { name: "próximo" }));

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "adicionar conta" }));
    });

    expect(onSubmit).toHaveBeenCalledWith({
      descricao: "Conta de luz",
      valor: 100,
      vencimento: fixedDate.toISOString(),
      metodoPagamento: MetodoPagamento.PIX,
      republicaId: "rep-1",
      status: StatusConta.PENDENTE,
      moradorIds: ["1"],
    });
  });

  it("usa valor 0 quando valorTotal é inválido (branch || 0)", async () => {
    const onSubmit = jest.fn();
    mockUseAccountForm.mockReturnValue({
      ...createHookReturn(),
      formData: { ...createHookReturn().formData, valorTotal: "" },
    });
    render(<AddAccountModal {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.press(screen.getByRole("button", { name: "próximo" }));

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "adicionar conta" }));
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ valor: 0 })
    );
  });

  it("exibe o total preenchido e restante no footer da aba residents", () => {
    render(<AddAccountModal {...defaultProps} />);

    fireEvent.press(screen.getByRole("button", { name: "próximo" }));

    expect(screen.getByText("TOTAL PREENCHIDO")).toBeTruthy();
    expect(screen.getByText("RESTANTE")).toBeTruthy();
    expect(screen.getAllByText("R$ 50,00").length).toBeGreaterThanOrEqual(1);
  });

  it("usa behavior 'padding' no KeyboardAvoidingView quando Platform.OS é ios", () => {
    Platform.OS = "ios";

    try {
      render(<AddAccountModal {...defaultProps} />);

      const keyboardView = screen.UNSAFE_getByType(
        jest.requireActual("react-native").KeyboardAvoidingView
      );
      expect(keyboardView.props.behavior).toBe("padding");
    } finally {
      Platform.OS = "android";
    }
  });

  it("usa behavior undefined no KeyboardAvoidingView quando Platform.OS não é ios", () => {
    Platform.OS = "android";

    render(<AddAccountModal {...defaultProps} />);

    const keyboardView = screen.UNSAFE_getByType(
      jest.requireActual("react-native").KeyboardAvoidingView
    );
    expect(keyboardView.props.behavior).toBeUndefined();
  });
});
