import { act, render, screen, fireEvent } from "@testing-library/react-native";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useRepublicActions } from "@/src/features/republic/hooks/useRepublicActions";
import { useRepublicForm } from "@/src/features/republic/hooks/useRepublicForm";
import InputField from "@/src/shared/components/ui/input-field";
import { RegisterRepublicScreen } from "../RegisterRepublicScreen";

jest.mock("@expo/vector-icons/Feather", () => "Feather");
jest.mock("@/src/features/republic/hooks/useRepublicActions", () => ({
  useRepublicActions: jest.fn(),
}));
jest.mock("@/src/features/republic/hooks/useRepublicForm", () => ({
  useRepublicForm: jest.fn(),
}));
jest.mock("@/src/shared/components/ui/input-field", () => jest.fn(() => null));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  default: () => ({ width: 390, height: 844 }),
}));

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const mockSetRepublicName = jest.fn();
const mockHandleSelectImageRepublic = jest.fn();
const mockCreateRepublic = jest.fn();

function makeFormReturn(overrides = {}) {
  return {
    republicName: "",
    setRepublicName: mockSetRepublicName,
    republicImage: undefined,
    handleSelectImageRepublic: mockHandleSelectImageRepublic,
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRepublicForm).mockReturnValue(makeFormReturn() as any);
  jest.mocked(useRepublicActions).mockReturnValue({
    createRepublic: mockCreateRepublic,
  } as any);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── textos estáticos ─────────────────────────────────────────────────────────

describe("RegisterRepublicScreen — textos", () => {
  it("exibe o título 'Cadastre sua República'", () => {
    render(<RegisterRepublicScreen />);
    expect(screen.getByText(/Cadastre sua/)).toBeTruthy();
  });

  it("exibe o subtítulo 'Personalize e comece a gerenciar'", () => {
    render(<RegisterRepublicScreen />);
    expect(screen.getByText("Personalize e comece a gerenciar")).toBeTruthy();
  });

  it("exibe o label do botão de submit", () => {
    render(<RegisterRepublicScreen />);
    expect(screen.getByText("Cadastrar República")).toBeTruthy();
  });
});

// ─── seleção de imagem ────────────────────────────────────────────────────────

describe("RegisterRepublicScreen — seleção de imagem", () => {
  it("exibe 'Adicionar foto' quando republicImage é undefined", () => {
    render(<RegisterRepublicScreen />);
    expect(screen.getByText("Adicionar foto")).toBeTruthy();
  });

  it("exibe 'Alterar foto' quando republicImage está definida", () => {
    jest.mocked(useRepublicForm).mockReturnValue(
      makeFormReturn({ republicImage: "file://foto.jpg" }) as any
    );
    render(<RegisterRepublicScreen />);
    expect(screen.getByText("Alterar foto")).toBeTruthy();
  });

  it("pressionar o botão de imagem chama handleSelectImageRepublic", () => {
    render(<RegisterRepublicScreen />);
    fireEvent.press(screen.getByText("Adicionar foto"));
    expect(mockHandleSelectImageRepublic).toHaveBeenCalled();
  });
});

// ─── InputField ───────────────────────────────────────────────────────────────

describe("RegisterRepublicScreen — InputField", () => {
  it("passa o value correto ao InputField", () => {
    jest.mocked(useRepublicForm).mockReturnValue(
      makeFormReturn({ republicName: "República Alpha" }) as any
    );
    render(<RegisterRepublicScreen />);
    const props = jest.mocked(InputField).mock.calls[0][0] as any;
    expect(props.value).toBe("República Alpha");
  });

  it("passa onChangeText do hook ao InputField", () => {
    render(<RegisterRepublicScreen />);
    const props = jest.mocked(InputField).mock.calls[0][0] as any;
    expect(props.onChangeText).toBe(mockSetRepublicName);
  });

  it("passa label 'Nome da república' ao InputField", () => {
    render(<RegisterRepublicScreen />);
    const props = jest.mocked(InputField).mock.calls[0][0] as any;
    expect(props.label).toBe("Nome da república");
  });
});

// ─── botão de submit ──────────────────────────────────────────────────────────

describe("RegisterRepublicScreen — botão Cadastrar República", () => {
  it("não chama createRepublic ao pressionar com republicName vazio", async () => {
    render(<RegisterRepublicScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Cadastrar República"));
    });
    expect(mockCreateRepublic).not.toHaveBeenCalled();
  });

  it("não chama createRepublic ao pressionar com republicName contendo apenas espaços", async () => {
    jest.mocked(useRepublicForm).mockReturnValue(
      makeFormReturn({ republicName: "   " }) as any
    );
    render(<RegisterRepublicScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Cadastrar República"));
    });
    expect(mockCreateRepublic).not.toHaveBeenCalled();
  });

  it("pressionar o botão chama createRepublic com nome e imagem", async () => {
    mockCreateRepublic.mockResolvedValue(undefined);
    jest.mocked(useRepublicForm).mockReturnValue(
      makeFormReturn({ republicName: "Alpha", republicImage: "file://img.jpg" }) as any
    );
    render(<RegisterRepublicScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Cadastrar República"));
    });
    expect(mockCreateRepublic).toHaveBeenCalledWith({
      nome: "Alpha",
      imagemRepublica: "file://img.jpg",
    });
  });

  it("pressionar o botão chama createRepublic com imagemRepublica undefined quando sem imagem", async () => {
    mockCreateRepublic.mockResolvedValue(undefined);
    jest.mocked(useRepublicForm).mockReturnValue(
      makeFormReturn({ republicName: "Alpha" }) as any
    );
    render(<RegisterRepublicScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Cadastrar República"));
    });
    expect(mockCreateRepublic).toHaveBeenCalledWith({
      nome: "Alpha",
      imagemRepublica: undefined,
    });
  });
});

// ─── KeyboardAvoidingView — behavior por plataforma ───────────────────────────

describe("RegisterRepublicScreen — KeyboardAvoidingView", () => {
  it("usa behavior='padding' no iOS", () => {
    Platform.OS = "ios";
    const { UNSAFE_getByType } = render(<RegisterRepublicScreen />);
    const kav = UNSAFE_getByType(KeyboardAvoidingView);
    expect(kav.props.behavior).toBe("padding");
  });

  it("usa behavior=undefined no Android", () => {
    Platform.OS = "android";
    const { UNSAFE_getByType } = render(<RegisterRepublicScreen />);
    const kav = UNSAFE_getByType(KeyboardAvoidingView);
    expect(kav.props.behavior).toBeUndefined();
  });
});
