import { fireEvent, render, screen } from "@testing-library/react-native";
import { TextInput, TouchableOpacity } from "react-native";
import { logger } from "@/src/shared/utils/logger";
import CheckEmail from "../CheckEmailScreen";

jest.mock("@expo/vector-icons/Feather", () => "Feather");
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));
jest.mock("@/src/shared/utils/logger", () => ({
  logger: { info: jest.fn() },
}));

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;
let alertMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  alertMock = jest.fn();
  (global as any).alert = alertMock;
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
  delete (global as any).alert;
});

// ─── CheckEmailScreen ─────────────────────────────────────────────────────────

describe("CheckEmailScreen — renderização", () => {
  it("renderiza 6 campos de entrada", () => {
    render(<CheckEmail />);
    expect(screen.UNSAFE_getAllByType(TextInput)).toHaveLength(6);
  });

  it("todos os campos iniciam vazios", () => {
    render(<CheckEmail />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    inputs.forEach((input) => {
      expect(input.props.value).toBe("");
    });
  });

  it("renderiza o botão 'Enviar'", () => {
    render(<CheckEmail />);
    expect(screen.getByText("Enviar")).toBeTruthy();
  });

  it("renderiza o botão 'Reenviar código'", () => {
    render(<CheckEmail />);
    expect(screen.getByText("Reenviar código")).toBeTruthy();
  });

  it("botão 'Enviar' começa desabilitado (código incompleto)", () => {
    render(<CheckEmail />);
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    const submitButton = buttons.find((b) => b.props.disabled !== undefined);
    expect(submitButton?.props.disabled).toBe(true);
  });
});

describe("CheckEmailScreen — entrada de dígito único", () => {
  it("atualiza o valor do campo ao digitar um dígito", () => {
    render(<CheckEmail />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "3");
    expect(screen.UNSAFE_getAllByType(TextInput)[0].props.value).toBe("3");
  });

  it("filtra caracteres não numéricos", () => {
    render(<CheckEmail />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "a");
    expect(screen.UNSAFE_getAllByType(TextInput)[0].props.value).toBe("");
  });

  it("filtra parte não numérica de entrada mista", () => {
    render(<CheckEmail />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[2], "5b");
    expect(screen.UNSAFE_getAllByType(TextInput)[2].props.value).toBe("5");
  });
});

describe("CheckEmailScreen — paste de múltiplos dígitos", () => {
  it("distribui 6 dígitos colados pelos campos a partir do índice 0", () => {
    render(<CheckEmail />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "123456");
    const updated = screen.UNSAFE_getAllByType(TextInput);
    expect(updated[0].props.value).toBe("1");
    expect(updated[1].props.value).toBe("2");
    expect(updated[2].props.value).toBe("3");
    expect(updated[3].props.value).toBe("4");
    expect(updated[4].props.value).toBe("5");
    expect(updated[5].props.value).toBe("6");
  });

  it("distribui dígitos colados a partir de um índice intermediário", () => {
    render(<CheckEmail />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[3], "789");
    const updated = screen.UNSAFE_getAllByType(TextInput);
    expect(updated[3].props.value).toBe("7");
    expect(updated[4].props.value).toBe("8");
    expect(updated[5].props.value).toBe("9");
    expect(updated[0].props.value).toBe(""); // campos anteriores intocados
  });

  it("limita o paste a 6 dígitos, ignorando o excesso", () => {
    render(<CheckEmail />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "1234567890");
    const updated = screen.UNSAFE_getAllByType(TextInput);
    expect(updated[5].props.value).toBe("6"); // apenas os 6 primeiros
  });

  it("ignora dígitos colados que ultrapassam o último campo a partir de índice alto", () => {
    render(<CheckEmail />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);

    fireEvent.changeText(inputs[4], "3456");

    const updated = screen.UNSAFE_getAllByType(TextInput);
    expect(updated[3].props.value).toBe("");
    expect(updated[4].props.value).toBe("3");
    expect(updated[5].props.value).toBe("4");
  });
});

describe("CheckEmailScreen — reenviar código", () => {
  it("limpa todos os campos ao pressionar 'Reenviar código'", () => {
    render(<CheckEmail />);
    // Fill fields via paste
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "123456");
    // Resend
    fireEvent.press(screen.getByText("Reenviar código"));
    const updated = screen.UNSAFE_getAllByType(TextInput);
    updated.forEach((input) => {
      expect(input.props.value).toBe("");
    });
  });

  it("chama logger.info ao reenviar o código", () => {
    render(<CheckEmail />);
    fireEvent.press(screen.getByText("Reenviar código"));
    expect(logger.info).toHaveBeenCalledWith(
      "Auth",
      "Código de verificação reenviado"
    );
  });
});

describe("CheckEmailScreen — handleKeyPress (L50–52, L104)", () => {
  it("Backspace em campo vazio com índice > 0 tenta focar o campo anterior", () => {
    render(<CheckEmail />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    // Campo 1 está vazio por padrão — condição completa: Backspace + vazio + índice > 0
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Backspace" } });
    expect(screen.UNSAFE_getAllByType(TextInput)[1].props.value).toBe("");
  });

  it("Backspace em campo preenchido não move o foco (valor não vazio)", () => {
    render(<CheckEmail />);
    fireEvent.changeText(screen.UNSAFE_getAllByType(TextInput)[1], "5");
    fireEvent(screen.UNSAFE_getAllByType(TextInput)[1], "keyPress", {
      nativeEvent: { key: "Backspace" },
    });
    expect(screen.UNSAFE_getAllByType(TextInput)[1].props.value).toBe("5");
  });

  it("Backspace no índice 0 não move o foco (index > 0 falso)", () => {
    render(<CheckEmail />);
    fireEvent(screen.UNSAFE_getAllByType(TextInput)[0], "keyPress", {
      nativeEvent: { key: "Backspace" },
    });
    expect(screen.UNSAFE_getAllByType(TextInput)[0].props.value).toBe("");
  });

  it("tecla não-Backspace não dispara nenhuma ação", () => {
    render(<CheckEmail />);
    fireEvent(screen.UNSAFE_getAllByType(TextInput)[1], "keyPress", {
      nativeEvent: { key: "1" },
    });
    expect(screen.UNSAFE_getAllByType(TextInput)[1].props.value).toBe("");
  });
});

describe("CheckEmailScreen — submissão", () => {
  it("exibe alerta quando o código está incompleto", () => {
    render(<CheckEmail />);
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    const submitButton = buttons.find((b) => b.props.disabled !== undefined);
    submitButton?.props.onPress?.();
    expect(alertMock).toHaveBeenCalledWith(
      "Por favor, digite o código completo"
    );
  });

  it("não chama logger.info quando código incompleto", () => {
    render(<CheckEmail />);
    fireEvent.changeText(screen.UNSAFE_getAllByType(TextInput)[0], "1");
    fireEvent.press(screen.getByText("Enviar"));
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("chama logger.info com o código completo ao enviar", () => {
    render(<CheckEmail />);
    fireEvent.changeText(screen.UNSAFE_getAllByType(TextInput)[0], "123456");
    fireEvent.press(screen.getByText("Enviar"));
    expect(logger.info).toHaveBeenCalledWith(
      "Auth",
      "Código de verificação submetido",
      { code: "123456" }
    );
  });

  it("botão 'Enviar' habilitado após preencher todos os campos", () => {
    render(<CheckEmail />);
    fireEvent.changeText(screen.UNSAFE_getAllByType(TextInput)[0], "123456");
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    const submitButton = buttons.find((b) => b.props.disabled !== undefined);
    expect(submitButton?.props.disabled).toBe(false);
  });
});
