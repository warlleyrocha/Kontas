import { fireEvent, render, screen } from "@testing-library/react-native";
import { captureException } from "@sentry/react-native";
import { RouteErrorFallback } from "../RouteErrorFallback";

jest.mock("@sentry/react-native", () => ({
  __esModule: true,
  captureException: jest.fn(),
}));

const mockCaptureException = jest.mocked(captureException);
const originalDevDescriptor = Object.getOwnPropertyDescriptor(global, "__DEV__");

function setDev(value: boolean) {
  Object.defineProperty(global, "__DEV__", {
    configurable: true,
    value,
    writable: true,
  });
}

describe("RouteErrorFallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setDev(true);
  });

  afterAll(() => {
    if (originalDevDescriptor) {
      Object.defineProperty(global, "__DEV__", originalDevDescriptor);
      return;
    }

    Reflect.deleteProperty(global, "__DEV__");
  });

  it("renderiza o fallback da rota, reporta o erro e executa retry", () => {
    const error = new Error("falha na rota");
    const retry = jest.fn();

    render(
      <RouteErrorFallback domain="Payments" error={error} retry={retry} />,
    );

    expect(screen.getByText("Ops! Falha no domínio Payments")).toBeTruthy();
    expect(
      screen.getByText("Ocorreu um erro inesperado nesta área do app."),
    ).toBeTruthy();
    expect(screen.getByText("falha na rota")).toBeTruthy();

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(error, {
      tags: {
        boundaryType: "route",
        domain: "Payments",
      },
    });

    fireEvent.press(screen.getByRole("button"));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("oculta a mensagem técnica quando __DEV__ é false", () => {
    setDev(false);

    render(
      <RouteErrorFallback
        domain="Profile"
        error={new Error("mensagem interna")}
        retry={() => {}}
      />,
    );

    expect(screen.getByText("Ops! Falha no domínio Profile")).toBeTruthy();
    expect(screen.queryByText("mensagem interna")).toBeNull();
  });
});
