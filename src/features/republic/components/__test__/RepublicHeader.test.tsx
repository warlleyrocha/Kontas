import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import { RepublicHeader } from "../RepublicHeader";
import type { RepublicResponse } from "../../types/republic.types";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/src/shared/components/SideMenu", () => ({
  MenuButton: ({
    onPress,
    hasNotification,
  }: {
    onPress: () => void;
    hasNotification?: boolean;
  }) => {
    const { TouchableOpacity } = jest.requireActual("react-native");
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          hasNotification ? "Abrir menu com notificações" : "Abrir menu"
        }
      />
    );
  },
}));

const mockRepublic: RepublicResponse = {
  id: "1",
  nome: "República Solar",
};

const createProps = (overrides = {}) => ({
  republic: mockRepublic,
  numberResidents: 3,
  onEdit: jest.fn(),
  onMenuOpen: jest.fn(),
  ...overrides,
});

describe("RepublicHeader", () => {
  it("monta sem erros", () => {
    render(<RepublicHeader {...createProps()} />);
  });

  it("exibe o nome da república", () => {
    render(<RepublicHeader {...createProps()} />);
    expect(screen.getByText("República Solar")).toBeTruthy();
  });

  it('exibe "República" quando o nome é nulo', () => {
    render(
      <RepublicHeader {...createProps({ republic: { id: "1", nome: null } })} />
    );
    expect(screen.getByText("República")).toBeTruthy();
  });

  it('exibe "Morador" no singular para 1 residente', () => {
    render(<RepublicHeader {...createProps({ numberResidents: 1 })} />);
    expect(screen.getByText("1 Morador")).toBeTruthy();
  });

  it('exibe "Moradores" no plural para múltiplos residentes', () => {
    render(<RepublicHeader {...createProps({ numberResidents: 5 })} />);
    expect(screen.getByText("5 Moradores")).toBeTruthy();
  });

  it("chama onEdit ao pressionar o botão de editar", () => {
    const props = createProps();
    render(<RepublicHeader {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "Editar república" }));

    expect(props.onEdit).toHaveBeenCalledTimes(1);
  });

  it("chama onMenuOpen ao pressionar o botão de menu", () => {
    const props = createProps();
    render(<RepublicHeader {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "Abrir menu" }));

    expect(props.onMenuOpen).toHaveBeenCalledTimes(1);
  });

  it("remove a imagem e exibe o fallback ao ocorrer erro de carregamento", () => {
    render(
      <RepublicHeader
        {...createProps({
          republic: {
            id: "1",
            nome: "República Solar",
            imagemRepublica: "https://example.com/foto.jpg",
          },
        })}
      />
    );

    const image = screen.UNSAFE_getByType(Image);
    expect(image).toBeTruthy();

    fireEvent(image, "error");

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
  });

  it("exibe label de notificação no menu quando hasNotification é true", () => {
    render(<RepublicHeader {...createProps({ hasNotification: true })} />);

    expect(
      screen.getByRole("button", { name: "Abrir menu com notificações" })
    ).toBeTruthy();
  });
});
