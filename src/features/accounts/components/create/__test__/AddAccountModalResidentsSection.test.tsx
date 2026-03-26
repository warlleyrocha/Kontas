import { fireEvent, render, screen } from "@testing-library/react-native";
import { AddAccountModalResidentsSection } from "../AddAccountModalResidentsSection";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

const mockMoradores = [
  {
    moradorId: "1",
    nome: "Ana",
    fotoPerfil: null,
    role: "Morador",
    checked: true,
    valor: "50,00",
  },
  {
    moradorId: "2",
    nome: "Bruno",
    fotoPerfil: null,
    role: "Morador",
    checked: false,
    valor: "",
  },
];

const createProps = (overrides = {}) => ({
  tipoDivisao: "equal" as const,
  moradoresDivisao: mockMoradores,
  totalDivisaoPreenchido: 50,
  valorTotalNumerico: 100,
  restante: 50,
  onSetTipoDivisao: jest.fn(),
  onToggleMorador: jest.fn(),
  onMoradorValorChange: jest.fn(),
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
  });

  it("exibe os nomes dos moradores", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);
    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.getByText("Bruno")).toBeTruthy();
  });

  it("chama onSetTipoDivisao('equal') ao pressionar DIVIDIR IGUALMENTE", () => {
    const props = createProps();
    render(<AddAccountModalResidentsSection {...props} />);

    fireEvent.press(screen.getByLabelText(/Opção selecionada DIVIDIR/));

    expect(props.onSetTipoDivisao).toHaveBeenCalledWith("equal");
  });

  it("chama onSetTipoDivisao('custom') ao pressionar VALORES CUSTOMIZADOS", () => {
    const props = createProps();
    render(<AddAccountModalResidentsSection {...props} />);

    fireEvent.press(screen.getByLabelText(/Selecionar opção VALORES/));

    expect(props.onSetTipoDivisao).toHaveBeenCalledWith("custom");
  });

  it("exibe label correto para opção custom quando selecionada", () => {
    render(
      <AddAccountModalResidentsSection
        {...createProps({ tipoDivisao: "custom" })}
      />
    );

    expect(screen.getByLabelText(/Opção selecionada VALORES/)).toBeTruthy();
    expect(screen.getByLabelText(/Selecionar opção DIVIDIR/)).toBeTruthy();
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

  it("exibe valor como texto quando tipoDivisao é equal", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);

    expect(screen.getByText(/50,00/)).toBeTruthy();
    expect(screen.queryByPlaceholderText("0,00")).toBeNull();
  });

  it("exibe TextInput editável quando tipoDivisao é custom e morador checked", () => {
    render(
      <AddAccountModalResidentsSection
        {...createProps({ tipoDivisao: "custom" })}
      />
    );

    const input = screen.getByDisplayValue("50,00");
    expect(input).toBeTruthy();
  });

  it("chama onMoradorValorChange ao digitar no TextInput no modo custom", () => {
    const props = createProps({ tipoDivisao: "custom" });
    render(<AddAccountModalResidentsSection {...props} />);

    fireEvent.changeText(screen.getByDisplayValue("50,00"), "7500");

    expect(props.onMoradorValorChange).toHaveBeenCalledWith("1", "75,00");
  });

  it("não exibe TextInput para morador desmarcado no modo custom", () => {
    render(
      <AddAccountModalResidentsSection
        {...createProps({ tipoDivisao: "custom" })}
      />
    );

    // Ana (checked) tem TextInput com valor, Bruno (unchecked) exibe texto estático
    // Apenas 1 TextInput (da Ana) deve existir
    expect(screen.queryAllByDisplayValue("50,00")).toHaveLength(1);
  });

  it("exibe barra de progresso no modo custom", () => {
    render(
      <AddAccountModalResidentsSection
        {...createProps({ tipoDivisao: "custom" })}
      />
    );

    expect(screen.getByText(/R\$ 50,00 de R\$ 100,00/)).toBeTruthy();
    expect(screen.getByText(/Faltam R\$ 50,00/)).toBeTruthy();
  });

  it("exibe 'Completo' quando totalDivisaoPreenchido >= valorTotal", () => {
    render(
      <AddAccountModalResidentsSection
        {...createProps({
          tipoDivisao: "custom",
          totalDivisaoPreenchido: 100,
          restante: 0,
        })}
      />
    );

    expect(screen.getByText("Completo")).toBeTruthy();
  });

  it("não exibe barra de progresso no modo equal", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);

    expect(screen.queryByText(/Faltam/)).toBeNull();
    expect(screen.queryByText("Completo")).toBeNull();
  });
});
