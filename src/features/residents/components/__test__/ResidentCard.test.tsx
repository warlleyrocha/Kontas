import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import { useResidentCard } from "@/src/features/residents/hooks/useResidentCard";
import {
  ResidentRole,
  type ResidentResponse,
} from "@/src/shared/types/resident.types";
import { ResidentCard } from "../ResidentCard";

jest.mock("react-native-reanimated", () =>
  jest.requireActual("react-native-reanimated/mock")
);

jest.mock("@expo/vector-icons", () => ({
  Feather: "Feather",
  Ionicons: "Ionicons",
}));

jest.mock("@/src/features/residents/hooks/useResidentCard");
jest.mock("@/src/shared/utils/getInitials", () => ({
  getInitials: (nome: string) => nome.slice(0, 2).toUpperCase(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockMorador: ResidentResponse = {
  id: "r-1",
  nome: "Ana Silva",
  email: "ana@email.com",
  fotoPerfil: null,
  chavePix: null,
  telefone: null,
  role: ResidentRole.USER,
};

const mockToggleExpanded = jest.fn();
const mockHandleCopyPix = jest.fn();
const mockSetImageError = jest.fn();

function createHookReturn(overrides = {}) {
  return {
    expanded: false,
    copiado: false,
    imageError: false,
    animatedStyle: { maxHeight: 0, opacity: 0, overflow: "hidden" as const },
    toggleExpanded: mockToggleExpanded,
    handleCopyPix: mockHandleCopyPix,
    setImageError: mockSetImageError,
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useResidentCard).mockReturnValue(createHookReturn());

  // Falha o teste se o componente logar erros reais (prop inválida, render quebrado, etc.)
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── ResidentCard ─────────────────────────────────────────────────────────────

describe("ResidentCard", () => {
  it("renderiza o nome do morador", () => {
    render(<ResidentCard morador={mockMorador} onCopyPix={jest.fn()} />);

    expect(screen.getByText("Ana Silva")).toBeTruthy();
  });

  it("exibe iniciais quando fotoPerfil é null", () => {
    render(<ResidentCard morador={mockMorador} onCopyPix={jest.fn()} />);

    expect(screen.getByText("AN")).toBeTruthy();
  });

  it("renderiza a imagem quando fotoPerfil está definida e imageError é false", () => {
    jest.mocked(useResidentCard).mockReturnValue(
      createHookReturn({ imageError: false })
    );

    const moradorComFoto: ResidentResponse = {
      ...mockMorador,
      fotoPerfil: "https://example.com/photo.jpg",
    };

    render(<ResidentCard morador={moradorComFoto} onCopyPix={jest.fn()} />);

    expect(screen.queryByText("AN")).toBeNull();
  });

  it("exibe iniciais quando imageError é true mesmo com fotoPerfil definida", () => {
    jest.mocked(useResidentCard).mockReturnValue(
      createHookReturn({ imageError: true })
    );

    const moradorComFoto: ResidentResponse = {
      ...mockMorador,
      fotoPerfil: "https://example.com/photo.jpg",
    };

    render(<ResidentCard morador={moradorComFoto} onCopyPix={jest.fn()} />);

    expect(screen.getByText("AN")).toBeTruthy();
  });

  it("chama setImageError ao disparar onError na imagem", () => {
    jest.mocked(useResidentCard).mockReturnValue(
      createHookReturn({ imageError: false })
    );

    const moradorComFoto: ResidentResponse = {
      ...mockMorador,
      fotoPerfil: "https://example.com/photo.jpg",
    };

    render(<ResidentCard morador={moradorComFoto} onCopyPix={jest.fn()} />);

    fireEvent(screen.UNSAFE_getByType(Image), "error");

    expect(mockSetImageError).toHaveBeenCalledWith(true);
  });

  it("chama toggleExpanded ao pressionar o botão de detalhes", () => {
    render(<ResidentCard morador={mockMorador} onCopyPix={jest.fn()} />);

    fireEvent.press(screen.getByLabelText("Ver mais detalhes"));

    expect(mockToggleExpanded).toHaveBeenCalledTimes(1);
  });

  it("passa morador e onCopyPix corretos para o hook", () => {
    const onCopyPix = jest.fn();
    render(<ResidentCard morador={mockMorador} onCopyPix={onCopyPix} />);

    expect(jest.mocked(useResidentCard)).toHaveBeenCalledWith(
      mockMorador,
      onCopyPix
    );
  });
});
