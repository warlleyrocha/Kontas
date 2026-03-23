import { render, screen } from "@testing-library/react-native";
import { ActivityIndicator, Text } from "react-native";
import { ResumoCard } from "../ResumoCard";

const createProps = (overrides = {}) => ({
  label: "Total a pagar",
  value: 200,
  icon: <Text testID="custom-icon">icon</Text>,
  description: "Valor pendente do mês",
  color: "#337176",
  isLoading: false,
  ...overrides,
});

describe("ResumoCard", () => {
  it("monta sem erros", () => {
    render(<ResumoCard {...createProps()} />);
  });

  it("exibe o label", () => {
    render(<ResumoCard {...createProps()} />);
    expect(screen.getByText("Total a pagar")).toBeTruthy();
  });

  it("exibe o valor formatado quando não está carregando", () => {
    render(<ResumoCard {...createProps()} />);
    expect(screen.getByText("R$ 200.00")).toBeTruthy();
  });

  it("exibe a descrição", () => {
    render(<ResumoCard {...createProps()} />);
    expect(screen.getByText("Valor pendente do mês")).toBeTruthy();
  });

  it("renderiza o ícone fornecido", () => {
    render(<ResumoCard {...createProps()} />);
    expect(screen.getByTestId("custom-icon")).toBeTruthy();
  });

  it("exibe ActivityIndicator quando isLoading é true", () => {
    const { UNSAFE_getByType } = render(
      <ResumoCard {...createProps({ isLoading: true })} />,
    );
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("não exibe o valor quando isLoading é true", () => {
    render(<ResumoCard {...createProps({ isLoading: true })} />);
    expect(screen.queryByText(/R\$/)).toBeNull();
  });
});
