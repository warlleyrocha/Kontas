import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { InviteModal } from "../InviteModal";

jest.mock("@expo/vector-icons/Feather", () => "Feather");

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  republicaId: "rep-1",
  sendInvite: jest.fn(),
  loading: false,
  error: null,
};

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── InviteModal ──────────────────────────────────────────────────────────────

describe("InviteModal — renderização", () => {
  it("renderiza o título 'Enviar convite'", () => {
    render(<InviteModal {...defaultProps} />);
    expect(screen.getAllByText("Enviar convite").length).toBeGreaterThanOrEqual(
      1
    );
  });

  it("renderiza o campo de email com placeholder correto", () => {
    render(<InviteModal {...defaultProps} />);
    expect(screen.getByPlaceholderText("Email do convidado")).toBeTruthy();
  });

  it("renderiza o botão de envio", () => {
    render(<InviteModal {...defaultProps} />);
    expect(screen.getByLabelText("Enviar convite")).toBeTruthy();
  });

  it("renderiza o botão de cancelar", () => {
    render(<InviteModal {...defaultProps} />);
    expect(screen.getByLabelText("Cancelar envio de convite")).toBeTruthy();
  });

  it("renderiza o botão de fechar modal", () => {
    render(<InviteModal {...defaultProps} />);
    expect(screen.getByLabelText("Fechar modal de convite")).toBeTruthy();
  });

  it("exibe o texto de erro quando error está definido", () => {
    render(<InviteModal {...defaultProps} error="E-mail inválido" />);
    expect(screen.getByText("E-mail inválido")).toBeTruthy();
  });

  it("não exibe texto de erro quando error é null", () => {
    render(<InviteModal {...defaultProps} error={null} />);
    expect(screen.queryByText("E-mail inválido")).toBeNull();
  });

  it("exibe ActivityIndicator quando loading=true", () => {
    render(<InviteModal {...defaultProps} loading={true} />);
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
  });

  it("não exibe ActivityIndicator quando loading=false", () => {
    render(<InviteModal {...defaultProps} loading={false} />);
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it("usa behavior='height' no KeyboardAvoidingView quando Platform.OS é android", () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, "OS", {
      value: "android",
      configurable: true,
    });

    render(<InviteModal {...defaultProps} />);

    expect(screen.UNSAFE_getByType(KeyboardAvoidingView).props.behavior).toBe(
      "height"
    );

    Object.defineProperty(Platform, "OS", {
      value: originalOS,
      configurable: true,
    });
  });
});

describe("InviteModal — interação de fechamento", () => {
  it("chama onClose ao pressionar o botão fechar (X)", () => {
    const onClose = jest.fn();
    render(<InviteModal {...defaultProps} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText("Fechar modal de convite"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose ao pressionar 'Cancelar'", () => {
    const onClose = jest.fn();
    render(<InviteModal {...defaultProps} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText("Cancelar envio de convite"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("InviteModal — envio do convite", () => {
  it("chama sendInvite com email trimado e republicaId ao enviar", async () => {
    const sendInvite = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(
      <InviteModal
        {...defaultProps}
        sendInvite={sendInvite}
        onClose={onClose}
      />
    );

    fireEvent.changeText(
      screen.getByPlaceholderText("Email do convidado"),
      "ana@email.com"
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Enviar convite"));
    });

    expect(sendInvite).toHaveBeenCalledWith({
      email: "ana@email.com",
      republicaId: "rep-1",
    });
  });

  it("chama onClose após envio bem-sucedido", async () => {
    const sendInvite = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(
      <InviteModal
        {...defaultProps}
        sendInvite={sendInvite}
        onClose={onClose}
      />
    );

    fireEvent.changeText(
      screen.getByPlaceholderText("Email do convidado"),
      "ana@email.com"
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Enviar convite"));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("limpa o campo de email após envio", async () => {
    const sendInvite = jest.fn().mockResolvedValue(undefined);
    render(<InviteModal {...defaultProps} sendInvite={sendInvite} />);

    const input = screen.getByPlaceholderText("Email do convidado");
    fireEvent.changeText(input, "ana@email.com");
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Enviar convite"));
    });

    expect(input.props.value).toBe("");
  });

  it("remove espaços em branco do email antes de enviar", async () => {
    const sendInvite = jest.fn().mockResolvedValue(undefined);
    render(<InviteModal {...defaultProps} sendInvite={sendInvite} />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Email do convidado"),
      "  ana@email.com  "
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Enviar convite"));
    });

    expect(sendInvite).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@email.com" })
    );
  });

  it("não chama sendInvite quando email está vazio", async () => {
    const sendInvite = jest.fn();
    render(<InviteModal {...defaultProps} sendInvite={sendInvite} />);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Enviar convite"));
    });

    expect(sendInvite).not.toHaveBeenCalled();
  });

  it("não chama sendInvite quando email contém apenas espaços", async () => {
    const sendInvite = jest.fn();
    render(<InviteModal {...defaultProps} sendInvite={sendInvite} />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Email do convidado"),
      "   "
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Enviar convite"));
    });

    expect(sendInvite).not.toHaveBeenCalled();
  });
});
