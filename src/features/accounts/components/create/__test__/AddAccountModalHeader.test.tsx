import { fireEvent, render, screen } from "@testing-library/react-native";
import { AddAccountModalHeader } from "../AddAccountModalHeader";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

describe("AddAccountModalHeader", () => {
  it("monta sem erros", () => {
    render(<AddAccountModalHeader onClose={() => {}} />);
  });

  it("exibe o título Nova Conta", () => {
    render(<AddAccountModalHeader onClose={() => {}} />);
    expect(screen.getByText("Nova Conta")).toBeTruthy();
  });

  it("exibe a descrição da conta", () => {
    render(<AddAccountModalHeader onClose={() => {}} />);
    expect(
      screen.getByText("Adicione uma nova conta para a república"),
    ).toBeTruthy();
  });

  it("chama onClose ao pressionar o botão de fechar", () => {
    const onClose = jest.fn();
    render(<AddAccountModalHeader onClose={onClose} />);

    fireEvent.press(screen.getByRole("button"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
