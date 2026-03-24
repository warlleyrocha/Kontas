import DateTimePicker from "@react-native-community/datetimepicker";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Platform } from "react-native";
import { MetodoPagamento } from "@/src/features/accounts/types/account.types";
import { AddAccountModalFormSection } from "../AddAccountModalFormSection";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const mockDateTimePicker = jest.mocked(DateTimePicker);
const originalPlatformOS = Platform.OS;

function setPlatformOS(os: "android" | "ios") {
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    get: () => os,
  });
}

function createProps() {
  return {
    descricao: "Conta de luz",
    valorTotal: "120,00",
    vencimento: new Date(2026, 2, 20),
    tempVencimento: new Date(2026, 2, 25),
    showDatepicker: false,
    metodoPagamento: MetodoPagamento.PIX,
    onDescricaoChange: jest.fn(),
    onValorTotalChange: jest.fn(),
    onOpenDatepicker: jest.fn(),
    onConfirmDate: jest.fn(),
    onDateChange: jest.fn(),
    onCycleMetodoPagamento: jest.fn(),
  };
}

describe("AddAccountModalFormSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPlatformOS("android");
  });

  afterAll(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      get: () => originalPlatformOS,
    });
  });

  it.each([
    [MetodoPagamento.PIX, "PIX"],
    [MetodoPagamento.CARTAO, "Cartão"],
    [MetodoPagamento.DINHEIRO, "Dinheiro"],
  ])(
    "renderiza o método de pagamento %s com o rótulo correto",
    (metodoPagamento, label) => {
      render(
        <AddAccountModalFormSection
          {...createProps()}
          metodoPagamento={metodoPagamento}
        />,
      );

      expect(screen.getByText(label)).toBeTruthy();
      expect(
        screen.getByLabelText(`Selecionar método de pagamento ${label}`),
      ).toBeTruthy();
    },
  );

  it("monta sem erros e chama os callbacks principais", () => {
    const props = createProps();

    render(<AddAccountModalFormSection {...props} />);

    fireEvent.changeText(screen.getByPlaceholderText("Ex: Cemig"), "Cemig");
    fireEvent.changeText(screen.getByPlaceholderText("0,00"), "245,90");
    fireEvent.press(screen.getByLabelText(/Selecionar vencimento/));
    fireEvent.press(
      screen.getByLabelText("Selecionar método de pagamento PIX"),
    );

    expect(props.onDescricaoChange).toHaveBeenCalledWith("Cemig");
    expect(props.onValorTotalChange).toHaveBeenCalledWith("245,90");
    expect(props.onOpenDatepicker).toHaveBeenCalledTimes(1);
    expect(props.onCycleMetodoPagamento).toHaveBeenCalledTimes(1);
  });

  it("renderiza o DateTimePicker no modal do iOS e confirma a data", () => {
    setPlatformOS("ios");
    const props = createProps();

    render(<AddAccountModalFormSection {...props} showDatepicker={true} />);

    fireEvent.press(screen.getByLabelText("Confirmar vencimento"));

    expect(mockDateTimePicker).toHaveBeenCalledTimes(1);
    expect(mockDateTimePicker.mock.calls[0]?.[0]).toMatchObject({
      value: props.tempVencimento,
      mode: "date",
      display: "spinner",
      onChange: props.onDateChange,
      locale: "pt-BR",
    });
    expect(props.onConfirmDate).toHaveBeenCalledTimes(1);
  });

  it("renderiza o DateTimePicker no Android quando showDatepicker for true", () => {
    setPlatformOS("android");
    const props = createProps();

    render(<AddAccountModalFormSection {...props} showDatepicker={true} />);

    expect(mockDateTimePicker).toHaveBeenCalledTimes(1);
    expect(mockDateTimePicker.mock.calls[0]?.[0]).toMatchObject({
      value: props.vencimento,
      mode: "date",
      display: "calendar",
      onChange: props.onDateChange,
    });
  });
});
