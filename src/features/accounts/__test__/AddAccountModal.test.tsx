import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Platform, View } from "react-native";
import AddAccountModal from "../components/create/AddAccountModal";
import { useAccountForm } from "../hooks/useAccountForm";
import { MetodoPagamento, StatusConta } from "../types/account.types";

jest.mock("@/src/shared/components/ui/sonner", () => ({ Toaster: () => null }));

jest.mock("../hooks/useAccountForm", () => ({
  useAccountForm: jest.fn(),
}));

jest.mock("../components/create/AddAccountModalHeader", () => ({
  AddAccountModalHeader: ({ onClose }: { onClose: () => void }) => {
    const { TouchableOpacity } = require("react-native");
    return (
      <TouchableOpacity
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="fechar modal"
      />
    );
  },
}));

jest.mock("../components/create/AddAccountModalFormSection", () => ({
  AddAccountModalFormSection: ({
    onDescricaoChange,
    onCycleMetodoPagamento,
  }: {
    onDescricaoChange: (v: string) => void;
    onCycleMetodoPagamento: () => void;
  }) => {
    const { TouchableOpacity, View } = require("react-native");
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

jest.mock("../components/create/AddAccountModalResidentsSection", () => ({
  AddAccountModalResidentsSection: ({
    onValorInputFocusChange,
  }: {
    onValorInputFocusChange: (focused: boolean) => void;
  }) => {
    const { TouchableOpacity } = require("react-native");
    return (
      <TouchableOpacity
        onPress={() => onValorInputFocusChange(true)}
        accessibilityRole="button"
        accessibilityLabel="focar valor"
      />
    );
  },
}));

jest.mock("../components/create/AddAccountModalActions", () => ({
  AddAccountModalActions: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: () => void;
    onCancel: () => void;
  }) => {
    const { TouchableOpacity, View } = require("react-native");
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
    descricao: "",
    valorTotal: "100,00",
    vencimento: fixedDate,
    metodoPagamento: MetodoPagamento.PIX,
    tipoDivisao: "equal" as const,
    moradoresDivisao: [
      { moradorId: "1", nome: "Ana", checked: true, valor: "50,00" },
      { moradorId: "2", nome: "Bruno", checked: false, valor: "" },
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

  it("chama handleCloseModal ao pressionar cancelar", () => {
    render(<AddAccountModal {...defaultProps} />);

    fireEvent.press(screen.getByRole("button", { name: "cancelar" }));

    expect(mockHandleCloseModal).toHaveBeenCalledTimes(1);
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
      updater({ metodoPagamento: MetodoPagamento.PIX }).metodoPagamento,
    ).toBe(MetodoPagamento.CARTAO);

    expect(
      updater({ metodoPagamento: MetodoPagamento.CARTAO }).metodoPagamento,
    ).toBe(MetodoPagamento.DINHEIRO);

    expect(
      updater({ metodoPagamento: MetodoPagamento.DINHEIRO }).metodoPagamento,
    ).toBe(MetodoPagamento.PIX);
  });

  it("chama onSubmit com o payload correto ao confirmar", async () => {
    const onSubmit = jest.fn();
    render(<AddAccountModal {...defaultProps} onSubmit={onSubmit} />);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "adicionar conta" }));
    });

    expect(onSubmit).toHaveBeenCalledWith({
      descricao: "",
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

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "adicionar conta" }));
    });

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ valor: 0 }));
  });

  it("aplica translateY -135 quando isValorInputFocused é true", () => {
    const { UNSAFE_getAllByType } = render(
      <AddAccountModal {...defaultProps} />,
    );

    act(() => {
      fireEvent.press(screen.getByRole("button", { name: "focar valor" }));
    });

    const views = UNSAFE_getAllByType(View);
    const styledView = views.find(
      (v) => v.props.style?.transform?.[0]?.translateY === -135,
    );
    expect(styledView).toBeTruthy();
  });

  it("usa behavior 'padding' no iOS (branch Platform.OS)", () => {
    Object.defineProperty(Platform, "OS", { value: "ios", writable: true });

    render(<AddAccountModal {...defaultProps} />);

    Object.defineProperty(Platform, "OS", {
      value: "android",
      writable: true,
    });
  });
});
