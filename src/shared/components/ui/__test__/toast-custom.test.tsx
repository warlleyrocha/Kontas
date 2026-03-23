import { fireEvent, render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import { Toast, ToastConfirm } from "../toast-custom";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => ({
  __esModule: true,
  default: () => null,
}));

describe("Toast", () => {
  it("monta sem erros", () => {
    render(<Toast message="Operação realizada" />);
  });

  it("exibe a mensagem", () => {
    render(<Toast message="Sucesso ao salvar" />);
    expect(screen.getByText("Sucesso ao salvar")).toBeTruthy();
  });

  it("renderiza variante success sem erros", () => {
    render(<Toast message="Salvo!" variant="success" />);
    expect(screen.getByText("Salvo!")).toBeTruthy();
  });

  it("renderiza variante error sem erros", () => {
    render(<Toast message="Erro!" variant="error" />);
    expect(screen.getByText("Erro!")).toBeTruthy();
  });

  it("renderiza variante info (padrão) sem erros", () => {
    render(<Toast message="Info" />);
    expect(screen.getByText("Info")).toBeTruthy();
  });

  it("usa ícone customizado quando fornecido", () => {
    const CustomIcon = () => <View testID="custom-icon" />;
    render(<Toast message="Com ícone" icon={<CustomIcon />} />);
    expect(screen.getByTestId("custom-icon")).toBeTruthy();
  });
});

describe("ToastConfirm", () => {
  const createProps = (overrides = {}) => ({
    message: "Deseja excluir este item?",
    duration: 3000,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    ...overrides,
  });

  it("monta sem erros", () => {
    render(<ToastConfirm {...createProps()} />);
  });

  it("exibe a mensagem", () => {
    render(<ToastConfirm {...createProps()} />);
    expect(screen.getByText("Deseja excluir este item?")).toBeTruthy();
  });

  it("exibe o título 'Confirmar exclusão'", () => {
    render(<ToastConfirm {...createProps()} />);
    expect(screen.getByText("Confirmar exclusão")).toBeTruthy();
  });

  it("exibe os labels padrão Cancelar e Excluir", () => {
    render(<ToastConfirm {...createProps()} />);
    expect(screen.getByText("Cancelar")).toBeTruthy();
    expect(screen.getByText("Excluir")).toBeTruthy();
  });

  it("exibe labels customizados", () => {
    render(
      <ToastConfirm
        {...createProps({ confirmLabel: "Sim", cancelLabel: "Não" })}
      />
    );
    expect(screen.getByText("Sim")).toBeTruthy();
    expect(screen.getByText("Não")).toBeTruthy();
  });

  it("chama onConfirm ao pressionar o botão de confirmação", () => {
    const props = createProps();
    render(<ToastConfirm {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "Confirmar exclusão" }));

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("chama onCancel ao pressionar o botão de cancelar", () => {
    const props = createProps();
    render(<ToastConfirm {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "Cancelar exclusão" }));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("dispara handleProgressLayout ao receber evento de layout com width > 0", () => {
    const { UNSAFE_getAllByType } = render(<ToastConfirm {...createProps()} />);

    const views = UNSAFE_getAllByType(View);
    const progressView = views.find((v) => v.props.onLayout !== undefined);

    expect(progressView).toBeTruthy();
    progressView!.props.onLayout({
      nativeEvent: { layout: { width: 300 } },
    });
    // não deve lançar erro
  });

  it("ignora handleProgressLayout quando width é 0", () => {
    const { UNSAFE_getAllByType } = render(<ToastConfirm {...createProps()} />);

    const views = UNSAFE_getAllByType(View);
    const progressView = views.find((v) => v.props.onLayout !== undefined);

    progressView!.props.onLayout({
      nativeEvent: { layout: { width: 0 } },
    });
    // branch `if (width === 0) return` — não deve lançar erro
  });
});
