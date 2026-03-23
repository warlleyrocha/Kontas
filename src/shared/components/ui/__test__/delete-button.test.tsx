import { fireEvent, render, screen } from "@testing-library/react-native";
import { DeleteButton } from "../delete-button";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

describe("DeleteButton", () => {
  it("monta sem erros", () => {
    render(<DeleteButton onPress={jest.fn()} />);
  });

  it("exibe o label padrão de acessibilidade", () => {
    render(<DeleteButton onPress={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Excluir item" })).toBeTruthy();
  });

  it("exibe label de acessibilidade customizado", () => {
    render(
      <DeleteButton onPress={jest.fn()} accessibilityLabel="Remover conta" />
    );
    expect(screen.getByRole("button", { name: "Remover conta" })).toBeTruthy();
  });

  it("chama onPress ao pressionar o botão", () => {
    const onPress = jest.fn();
    render(<DeleteButton onPress={onPress} />);

    fireEvent.press(screen.getByRole("button", { name: "Excluir item" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
