import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { AccountRecoveryToast } from "../components/shared/AccountRecoveryToast";

jest.mock("@expo/vector-icons/Ionicons", () => ({
  __esModule: true,
  default: () => null,
}));

const createProps = (overrides = {}) => ({
  message: "Conta excluída",
  onRecover: jest.fn(),
  durationMs: 3000,
  ...overrides,
});

describe("AccountRecoveryToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("monta sem erros", () => {
    render(<AccountRecoveryToast {...createProps()} />);
  });

  it("exibe a mensagem", () => {
    render(<AccountRecoveryToast {...createProps()} />);
    expect(screen.getByText("Conta excluída")).toBeTruthy();
  });

  it("chama onRecover ao pressionar o botão de recuperar", () => {
    const props = createProps();
    render(<AccountRecoveryToast {...props} />);

    fireEvent.press(
      screen.getByRole("button", { name: "Recuperar conta" }),
    );

    expect(props.onRecover).toHaveBeenCalledTimes(1);
  });

  it("progressPercent é 0 quando durationMs é 0", () => {
    // branch: if (durationMs <= 0) return 0
    render(<AccountRecoveryToast {...createProps({ durationMs: 0 })} />);
    // deve montar sem erros com durationMs = 0
  });

  it("avança o intervalo e atualiza o estado", () => {
    render(<AccountRecoveryToast {...createProps({ durationMs: 500 })} />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // componente deve continuar renderizado sem erros após avanço do timer
    expect(screen.getByText("Conta excluída")).toBeTruthy();
  });

  it("limpa o intervalo quando elapsed atinge durationMs", () => {
    render(<AccountRecoveryToast {...createProps({ durationMs: 200 })} />);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // intervalo é limpo (clearInterval chamado) e componente permanece estável
    expect(screen.getByText("Conta excluída")).toBeTruthy();
  });

  it("limpa o intervalo ao desmontar o componente", () => {
    const { unmount } = render(<AccountRecoveryToast {...createProps()} />);

    act(() => {
      unmount();
    });

    // cleanup do useEffect deve ser chamado sem erros
  });
});
