import { captureException } from "@sentry/react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { GlobalErrorBoundary } from "../GlobalErrorBoundary";

jest.mock("@sentry/react-native", () => ({
  __esModule: true,
  captureException: jest.fn(),
}));

const mockCaptureException = jest.mocked(captureException);
const originalDevDescriptor = Object.getOwnPropertyDescriptor(
  global,
  "__DEV__"
);

function setDev(value: boolean) {
  Object.defineProperty(global, "__DEV__", {
    configurable: true,
    value,
    writable: true,
  });
}

describe("GlobalErrorBoundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    setDev(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalDevDescriptor) {
      Object.defineProperty(global, "__DEV__", originalDevDescriptor);
      return;
    }

    Reflect.deleteProperty(global, "__DEV__");
  });

  it("renderiza os children quando não há erro", () => {
    render(
      <GlobalErrorBoundary>
        <Text>conteudo seguro</Text>
      </GlobalErrorBoundary>
    );

    expect(screen.getByText("conteudo seguro")).toBeTruthy();
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it("captura o erro, renderiza o fallback e permite tentar novamente", () => {
    let shouldThrow = true;

    function BrokenChild() {
      if (shouldThrow) {
        throw new Error("falha global");
      }

      return <Text>conteudo recuperado</Text>;
    }

    render(
      <GlobalErrorBoundary>
        <BrokenChild />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText("Ocorreu um erro inesperado")).toBeTruthy();
    expect(
      screen.getByText("Tente novamente. Se persistir, reinicie o aplicativo.")
    ).toBeTruthy();
    expect(screen.getByText("falha global")).toBeTruthy();

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "falha global",
      }),
      expect.objectContaining({
        tags: {
          boundaryType: "global",
        },
        contexts: {
          react: {
            componentStack: expect.any(String),
          },
        },
      })
    );

    shouldThrow = false;
    fireEvent.press(screen.getByRole("button"));

    expect(screen.getByText("conteudo recuperado")).toBeTruthy();
    expect(screen.queryByText("Ocorreu um erro inesperado")).toBeNull();
  });

  it("oculta a mensagem técnica quando __DEV__ é false", () => {
    setDev(false);

    function BrokenChild() {
      throw new Error("erro oculto");
    }

    render(
      <GlobalErrorBoundary>
        <BrokenChild />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText("Ocorreu um erro inesperado")).toBeTruthy();
    expect(screen.queryByText("erro oculto")).toBeNull();
  });
});
