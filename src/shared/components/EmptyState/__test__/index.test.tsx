import { fireEvent, render, screen } from "@testing-library/react-native";
import { EmptyState } from "../index";

jest.mock("@expo/vector-icons/Ionicons", () => ({
  __esModule: true,
  default: () => null,
}));

const createProps = (overrides = {}) => ({
  icon: "wallet-outline" as const,
  iconColor: "#337176",
  bgColor: "bg-teal/10",
  title: "Nenhum item encontrado",
  description: "Não há itens para exibir no momento.",
  ...overrides,
});

describe("EmptyState", () => {
  it("monta sem erros", () => {
    render(<EmptyState {...createProps()} />);
  });

  it("exibe o título", () => {
    render(<EmptyState {...createProps()} />);
    expect(screen.getByText("Nenhum item encontrado")).toBeTruthy();
  });

  it("exibe a descrição", () => {
    render(<EmptyState {...createProps()} />);
    expect(
      screen.getByText("Não há itens para exibir no momento."),
    ).toBeTruthy();
  });

  it("não exibe o botão quando buttonText não é fornecido", () => {
    render(<EmptyState {...createProps()} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("não exibe o botão quando onPress não é fornecido", () => {
    render(<EmptyState {...createProps({ buttonText: "Adicionar" })} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("exibe o botão quando buttonText e onPress são fornecidos", () => {
    render(
      <EmptyState
        {...createProps({ buttonText: "Adicionar item", onPress: jest.fn() })}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Adicionar item" }),
    ).toBeTruthy();
  });

  it("chama onPress ao pressionar o botão", () => {
    const onPress = jest.fn();
    render(
      <EmptyState
        {...createProps({ buttonText: "Adicionar item", onPress })}
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Adicionar item" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
