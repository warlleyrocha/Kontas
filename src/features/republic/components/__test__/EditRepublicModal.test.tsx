import { fireEvent, render, screen } from "@testing-library/react-native";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import useEditRepublicModal, {
  type UseEditRepublicModalReturn,
} from "../../hooks/useEditRepublicModal";
import { EditRepublicModal } from "../EditRepublicModal";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../hooks/useEditRepublicModal", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseEditRepublicModal = jest.mocked(useEditRepublicModal);
const mockSetNome = jest.fn();
const mockLimpar = jest.fn();
const mockSalvar = jest.fn();
const mockSelecionarImagem = jest.fn();

const createProps = () => ({
  visible: true,
  onClose: jest.fn(),
  currentName: "República Solar",
  currentImage: undefined,
  onSave: jest.fn(),
});

const createHookReturn = (): UseEditRepublicModalReturn => ({
  nome: "República Solar",
  setNome: mockSetNome,
  imagemUri: undefined,
  setImagemUri: jest.fn(),
  isUploading: false,
  limpar: mockLimpar,
  salvar: mockSalvar,
  selecionarImagem: mockSelecionarImagem,
  removerImagem: jest.fn(),
});

describe("EditRepublicModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditRepublicModal.mockReturnValue(createHookReturn());
  });

  it("monta sem erros", () => {
    render(<EditRepublicModal {...createProps()} />);
  });

  it("exibe os textos principais do modal", () => {
    render(<EditRepublicModal {...createProps()} />);

    expect(screen.getByText("Editar República")).toBeTruthy();
    expect(screen.getByText("Toque para alterar a foto")).toBeTruthy();
    expect(screen.getByText("Nome da República")).toBeTruthy();
    expect(screen.getByText("Salvar")).toBeTruthy();
    expect(screen.getByText("Cancelar")).toBeTruthy();
  });

  it("usa behavior='height' no KeyboardAvoidingView quando Platform.OS é android", () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, "OS", {
      value: "android",
      configurable: true,
    });

    render(<EditRepublicModal {...createProps()} />);

    expect(screen.UNSAFE_getByType(KeyboardAvoidingView).props.behavior).toBe(
      "height"
    );

    Object.defineProperty(Platform, "OS", {
      value: originalOS,
      configurable: true,
    });
  });

  it("chama setNome ao editar o nome da república", () => {
    render(<EditRepublicModal {...createProps()} />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Ex: Casa Amarela"),
      "República Aurora"
    );

    expect(mockSetNome).toHaveBeenCalledWith("República Aurora");
  });

  it("chama selecionarImagem ao pressionar a área da foto", () => {
    render(<EditRepublicModal {...createProps()} />);

    const [, imageButton] = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(imageButton);

    expect(mockSelecionarImagem).toHaveBeenCalledTimes(1);
  });

  it("renderiza a imagem da república quando imagemUri está preenchida", () => {
    mockUseEditRepublicModal.mockReturnValue({
      ...createHookReturn(),
      imagemUri: "https://example.com/republica.jpg",
    });

    render(<EditRepublicModal {...createProps()} />);

    expect(screen.UNSAFE_getByType(Image).props.source).toEqual({
      uri: "https://example.com/republica.jpg",
    });
  });

  it("chama salvar ao pressionar o botão Salvar", () => {
    render(<EditRepublicModal {...createProps()} />);

    const [, , saveButton] = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(saveButton);

    expect(mockSalvar).toHaveBeenCalledTimes(1);
  });

  it("chama limpar e onClose ao pressionar o botão de fechar", () => {
    const props = createProps();
    render(<EditRepublicModal {...props} />);

    const [closeButton] = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(closeButton);

    expect(mockLimpar).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("chama limpar e onClose ao pressionar Cancelar", () => {
    const props = createProps();
    render(<EditRepublicModal {...props} />);

    const [, , , cancelButton] = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(cancelButton);

    expect(mockLimpar).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
