import { fireEvent, render, screen } from "@testing-library/react-native";
import Header from "../Header";

jest.mock("expo-router/build/global-state/routing", () => ({
  goBack: jest.fn(),
}));

jest.mock("@/assets/images/Vector.svg", () => ({
  __esModule: true,
  default: () => null,
}));

describe("Header", () => {
  it("monta sem erros", () => {
    render(<Header />);
  });

  it("exibe o título quando fornecido", () => {
    render(<Header title="Minha Tela" />);
    expect(screen.getByText("Minha Tela")).toBeTruthy();
  });

  it("chama goBack ao pressionar o botão de voltar", () => {
    const { goBack } = require("expo-router/build/global-state/routing");
    render(<Header title="Tela" />);

    fireEvent.press(
      screen.getByRole("button", { name: "Voltar para a tela anterior" }),
    );

    expect(goBack).toHaveBeenCalledTimes(1);
  });
});
