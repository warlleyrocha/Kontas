import { render, screen } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import LoadingScreen from "../loading-screen";

describe("LoadingScreen", () => {
  it("monta sem erros", () => {
    render(<LoadingScreen />);
  });

  it("exibe a mensagem padrão 'Carregando...'", () => {
    render(<LoadingScreen />);
    expect(screen.getByText("Carregando...")).toBeTruthy();
  });

  it("exibe mensagem customizada", () => {
    render(<LoadingScreen message="Aguarde um momento" />);
    expect(screen.getByText("Aguarde um momento")).toBeTruthy();
  });

  it("renderiza o ActivityIndicator", () => {
    const { UNSAFE_getByType } = render(<LoadingScreen />);
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("passa color e size para o ActivityIndicator", () => {
    const { UNSAFE_getByType } = render(
      <LoadingScreen color="#FF0000" size="small" />
    );
    const indicator = UNSAFE_getByType(ActivityIndicator);
    expect(indicator.props.color).toBe("#FF0000");
    expect(indicator.props.size).toBe("small");
  });
});
