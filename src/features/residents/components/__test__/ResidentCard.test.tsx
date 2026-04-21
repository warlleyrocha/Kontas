import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image, Linking } from "react-native";

import { useResidentCard } from "@/src/features/residents/hooks/useResidentCard";
import {
  type ResidentResponse,
  ResidentRole,
} from "@/src/shared/types/resident.types";

import { ResidentCard } from "../ResidentCard";

jest.mock("react-native-reanimated", () =>
  jest.requireActual("react-native-reanimated/mock")
);

jest.mock("@expo/vector-icons", () => ({
  Feather: "Feather",
  Ionicons: "Ionicons",
  FontAwesome: "FontAwesome",
}));

jest.mock("@/src/features/residents/hooks/useResidentCard");
jest.mock("@/src/shared/utils/getInitials", () => ({
  getInitials: (nome: string) => nome.slice(0, 2).toUpperCase(),
}));
jest.mock("@/assets/icons/pix-icon.svg", () => {
  const { View } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: () => <View testID="pix-icon" />,
  };
});

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
    copyFeedback: {
      accessibilityLabel: "Copiar chave PIX",
      icon: null,
      text: "",
    },
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
let openURLSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useResidentCard).mockReturnValue(createHookReturn());
  openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(true as any);

  // Falha o teste se o componente logar erros reais (prop inválida, render quebrado, etc.)
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
  openURLSpy.mockRestore();
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
    jest
      .mocked(useResidentCard)
      .mockReturnValue(createHookReturn({ imageError: false }));

    const moradorComFoto: ResidentResponse = {
      ...mockMorador,
      fotoPerfil: "https://example.com/photo.jpg",
    };

    render(<ResidentCard morador={moradorComFoto} onCopyPix={jest.fn()} />);

    expect(screen.queryByText("AN")).toBeNull();
  });

  it("exibe iniciais quando imageError é true mesmo com fotoPerfil definida", () => {
    jest
      .mocked(useResidentCard)
      .mockReturnValue(createHookReturn({ imageError: true }));

    const moradorComFoto: ResidentResponse = {
      ...mockMorador,
      fotoPerfil: "https://example.com/photo.jpg",
    };

    render(<ResidentCard morador={moradorComFoto} onCopyPix={jest.fn()} />);

    expect(screen.getByText("AN")).toBeTruthy();
  });

  it("chama setImageError ao disparar onError na imagem", () => {
    jest
      .mocked(useResidentCard)
      .mockReturnValue(createHookReturn({ imageError: false }));

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

  it("usa accessibilityLabel 'Recolher detalhes' quando expanded=true", () => {
    jest
      .mocked(useResidentCard)
      .mockReturnValue(createHookReturn({ expanded: true }));

    render(<ResidentCard morador={mockMorador} onCopyPix={jest.fn()} />);

    expect(screen.getByLabelText("Recolher detalhes")).toBeTruthy();
  });

  it("exibe fallback 'Não informado' para email, telefone e chave PIX ausentes", () => {
    const moradorSemContato: ResidentResponse = {
      ...mockMorador,
      email: null as any,
      telefone: null,
      chavePix: null,
    };

    render(<ResidentCard morador={moradorSemContato} onCopyPix={jest.fn()} />);

    expect(screen.getAllByText("Não informado")).toHaveLength(3);
    expect(screen.queryByLabelText("Copiar chave PIX")).toBeNull();
  });

  it("renderiza detalhes de contato e botão para copiar chave PIX quando disponíveis", () => {
    const moradorCompleto: ResidentResponse = {
      ...mockMorador,
      telefone: "11999999999",
      chavePix: "ana@pix",
    };

    render(<ResidentCard morador={moradorCompleto} onCopyPix={jest.fn()} />);

    expect(screen.getByText("ana@email.com")).toBeTruthy();
    expect(screen.getByText("11999999999")).toBeTruthy();
    expect(screen.getByText("ana@pix")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Copiar chave PIX"));

    expect(mockHandleCopyPix).toHaveBeenCalledTimes(1);
  });

  it("abre o app de e-mail ao pressionar o endereço", () => {
    const moradorComEmail: ResidentResponse = {
      ...mockMorador,
      email: "ana@email.com",
    };

    render(<ResidentCard morador={moradorComEmail} onCopyPix={jest.fn()} />);

    fireEvent.press(screen.getByText("ana@email.com"));

    expect(openURLSpy).toHaveBeenCalledWith("mailto:ana@email.com");
  });

  it("abre o WhatsApp com o telefone sanitizado ao pressionar o número", () => {
    const moradorComTelefone: ResidentResponse = {
      ...mockMorador,
      telefone: "(11) 99999-9999",
    };

    render(<ResidentCard morador={moradorComTelefone} onCopyPix={jest.fn()} />);

    fireEvent.press(screen.getByText("(11) 99999-9999"));

    expect(openURLSpy).toHaveBeenCalledWith("https://wa.me/5511999999999");
  });

  it("usa accessibilityLabel 'Chave PIX copiada' quando o feedback é de sucesso", () => {
    jest.mocked(useResidentCard).mockReturnValue(
      createHookReturn({
        copyFeedback: {
          accessibilityLabel: "Chave PIX copiada",
          icon: null,
          text: "",
        },
      })
    );

    const moradorComPix: ResidentResponse = {
      ...mockMorador,
      chavePix: "ana@pix",
    };

    render(<ResidentCard morador={moradorComPix} onCopyPix={jest.fn()} />);

    expect(screen.getByLabelText("Chave PIX copiada")).toBeTruthy();
  });

  it("usa accessibilityLabel de erro quando o feedback é de erro", () => {
    jest.mocked(useResidentCard).mockReturnValue(
      createHookReturn({
        copyFeedback: {
          accessibilityLabel: "Falha ao copiar chave PIX",
          icon: null,
          text: "",
        },
      })
    );

    const moradorComPix: ResidentResponse = {
      ...mockMorador,
      chavePix: "ana@pix",
    };

    render(<ResidentCard morador={moradorComPix} onCopyPix={jest.fn()} />);

    expect(screen.getByLabelText("Falha ao copiar chave PIX")).toBeTruthy();
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
