import { fireEvent, render, screen } from "@testing-library/react-native";
import { AddAccountModalResidentsSection } from "../AddAccountModalResidentsSection";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

const mockMoradores = [
  { moradorId: "1", nome: "Ana", checked: true, valor: "50,00" },
  { moradorId: "2", nome: "Bruno", checked: false, valor: "" },
];

const createProps = (overrides = {}) => ({
  tipoDivisao: "equal" as const,
  moradoresDivisao: mockMoradores,
  totalDivisaoPreenchido: 50,
  onSetTipoDivisao: jest.fn(),
  onToggleMorador: jest.fn(),
  onMoradorValorChange: jest.fn(),
  onValorInputFocusChange: jest.fn(),
  ...overrides,
});

describe("AddAccountModalResidentsSection", () => {
  it("monta sem erros", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);
  });

  it("exibe os textos de seção", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);
    expect(screen.getByText("Tipo de Divisão")).toBeTruthy();
    expect(screen.getByText("Selecione os Moradores")).toBeTruthy();
    expect(screen.getByText("Total preenchido")).toBeTruthy();
  });

  it("exibe as opções de divisão", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);
    expect(screen.getByText("Dividir igualmente")).toBeTruthy();
    expect(screen.getByText("Valores customizados")).toBeTruthy();
  });

  it("exibe os nomes dos moradores", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);
    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.getByText("Bruno")).toBeTruthy();
  });

  it("exibe o total preenchido formatado", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);
    expect(screen.getByText("R$ 50,00")).toBeTruthy();
  });

  it("chama onSetTipoDivisao('equal') ao pressionar Dividir igualmente", () => {
    const props = createProps();
    render(<AddAccountModalResidentsSection {...props} />);

    fireEvent.press(
      screen.getByRole("button", {
        name: "Opção selecionada Dividir igualmente",
      })
    );

    expect(props.onSetTipoDivisao).toHaveBeenCalledWith("equal");
  });

  it("chama onSetTipoDivisao('custom') ao pressionar Valores customizados", () => {
    const props = createProps();
    render(<AddAccountModalResidentsSection {...props} />);

    fireEvent.press(
      screen.getByRole("button", {
        name: "Selecionar opção Valores customizados",
      })
    );

    expect(props.onSetTipoDivisao).toHaveBeenCalledWith("custom");
  });

  it("exibe label correto para opção custom quando selecionada", () => {
    render(
      <AddAccountModalResidentsSection
        {...createProps({ tipoDivisao: "custom" })}
      />
    );

    expect(
      screen.getByRole("button", {
        name: "Opção selecionada Valores customizados",
      })
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Selecionar opção Dividir igualmente",
      })
    ).toBeTruthy();
  });

  it("chama onToggleMorador ao pressionar o checkbox do morador", () => {
    const props = createProps();
    render(<AddAccountModalResidentsSection {...props} />);

    fireEvent.press(
      screen.getByRole("button", { name: "Desmarcar morador Ana" })
    );

    expect(props.onToggleMorador).toHaveBeenCalledWith("1");
  });

  it("exibe label 'Selecionar' para morador desmarcado", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);

    expect(
      screen.getByRole("button", { name: "Selecionar morador Bruno" })
    ).toBeTruthy();
  });

  it("chama onValorInputFocusChange(true) ao focar no TextInput", () => {
    const props = createProps();
    render(<AddAccountModalResidentsSection {...props} />);

    screen.getAllByDisplayValue("50,00")[0].props.onFocus();

    expect(props.onValorInputFocusChange).toHaveBeenCalledWith(true);
  });

  it("chama onValorInputFocusChange(false) ao desfocar o TextInput", () => {
    const props = createProps();
    render(<AddAccountModalResidentsSection {...props} />);

    screen.getAllByDisplayValue("50,00")[0].props.onBlur();

    expect(props.onValorInputFocusChange).toHaveBeenCalledWith(false);
  });

  it("chama onMoradorValorChange ao digitar no TextInput", () => {
    const props = createProps({ tipoDivisao: "custom" });
    render(<AddAccountModalResidentsSection {...props} />);

    fireEvent.changeText(screen.getAllByDisplayValue("50,00")[0], "75,00");

    expect(props.onMoradorValorChange).toHaveBeenCalledWith("1", "75,00");
  });

  it("TextInput é editável quando checked e tipoDivisao é custom", () => {
    render(
      <AddAccountModalResidentsSection
        {...createProps({ tipoDivisao: "custom" })}
      />
    );

    const input = screen.getAllByDisplayValue("50,00")[0];
    expect(input.props.editable).toBe(true);
  });

  it("TextInput não é editável quando tipoDivisao é equal", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);

    const input = screen.getAllByDisplayValue("50,00")[0];
    expect(input.props.editable).toBe(false);
  });
});
