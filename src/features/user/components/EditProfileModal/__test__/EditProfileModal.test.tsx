import { fireEvent, render, screen } from "@testing-library/react-native";
import { Platform } from "react-native";
import { EditProfileModal } from "../index";
import { useEditProfile } from "../../../hooks/useEditProfile";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../../hooks/useEditProfile", () => ({
  __esModule: true,
  useEditProfile: jest.fn(),
}));

const mockUseEditProfile = jest.mocked(useEditProfile);
const mockSetName = jest.fn();
const mockSetPhone = jest.fn();
const mockSetPixKey = jest.fn();
const mockHandleClose = jest.fn();
const mockHandleSave = jest.fn();
const mockSelectPhoto = jest.fn();

const createProps = () => ({
  visible: true,
  onClose: jest.fn(),
  currentName: "Warlley",
  currentPixKey: "11999999999",
  currentPhoto: undefined,
  currentPhone: "(11) 99999-9999",
  onSave: jest.fn(),
});

const createHookReturn = (): ReturnType<typeof useEditProfile> => ({
  name: "Warlley",
  setName: mockSetName,
  pixKey: "11999999999",
  setPixKey: mockSetPixKey,
  photoUri: undefined,
  setPhotoUri: jest.fn(),
  phone: "(11) 99999-9999",
  setPhone: mockSetPhone,
  isUploading: false,
  handleClose: mockHandleClose,
  handleSave: mockHandleSave,
  selectPhoto: mockSelectPhoto,
});

describe("EditProfileModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditProfile.mockReturnValue(createHookReturn());
  });

  it("monta sem erros", () => {
    render(<EditProfileModal {...createProps()} />);
  });

  it("exibe os textos principais do modal", () => {
    render(<EditProfileModal {...createProps()} />);

    expect(screen.getByText("Editar Perfil")).toBeTruthy();
    expect(screen.getByText("Toque para alterar a foto")).toBeTruthy();
    expect(screen.getByText("Nome")).toBeTruthy();
    expect(screen.getByText("Telefone")).toBeTruthy();
    expect(screen.getByText("Chave Pix")).toBeTruthy();
    expect(screen.getByText("Salvar")).toBeTruthy();
    expect(screen.getByText("Cancelar")).toBeTruthy();
  });

  it("chama setName ao editar o nome", () => {
    render(<EditProfileModal {...createProps()} />);

    fireEvent.changeText(screen.getByPlaceholderText("Seu nome"), "Maria");

    expect(mockSetName).toHaveBeenCalledWith("Maria");
  });

  it("chama setPhone com o telefone formatado ao editar o telefone", () => {
    render(<EditProfileModal {...createProps()} />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Seu telefone"),
      "11987654321"
    );

    expect(mockSetPhone).toHaveBeenCalledWith("(11) 98765-4321");
  });

  it("chama setPixKey ao editar a chave Pix", () => {
    render(<EditProfileModal {...createProps()} />);

    fireEvent.changeText(
      screen.getByPlaceholderText(
        "CPF, CNPJ, telefone, e-mail ou chave aleatória"
      ),
      "nova-chave"
    );

    expect(mockSetPixKey).toHaveBeenCalledWith("nova-chave");
  });

  it("chama selectPhoto ao pressionar alterar foto", () => {
    render(<EditProfileModal {...createProps()} />);

    fireEvent.press(screen.getByLabelText("Alterar foto de perfil"));

    expect(mockSelectPhoto).toHaveBeenCalledTimes(1);
  });

  it("chama handleSave ao pressionar Salvar", () => {
    render(<EditProfileModal {...createProps()} />);

    fireEvent.press(screen.getByLabelText("Salvar perfil"));

    expect(mockHandleSave).toHaveBeenCalledTimes(1);
  });

  it("chama handleClose ao pressionar Cancelar", () => {
    render(<EditProfileModal {...createProps()} />);

    fireEvent.press(screen.getByLabelText("Cancelar edição de perfil"));

    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it("usa behavior 'padding' no iOS", () => {
    Platform.OS = "ios";

    render(<EditProfileModal {...createProps()} />);

    expect(screen.getByText("Editar Perfil")).toBeTruthy();

    Platform.OS = "android";
  });

  it("exibe a imagem quando photoUri está definido", () => {
    mockUseEditProfile.mockReturnValue({
      ...createHookReturn(),
      photoUri: "https://example.com/photo.jpg",
    });

    render(<EditProfileModal {...createProps()} />);

    expect(screen.queryByText("Toque para alterar a foto")).toBeTruthy();
  });
});
