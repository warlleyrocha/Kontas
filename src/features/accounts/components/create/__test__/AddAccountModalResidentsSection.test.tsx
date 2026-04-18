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
  moradoresDivisao: mockMoradores,
  onToggleMorador: jest.fn(),
  onMoradorValorChange: jest.fn(),
  ...overrides,
});

describe("AddAccountModalResidentsSection", () => {
  it("monta sem erros", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);
  });

  it("exibe o texto de seção", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);
    expect(screen.getByText("Selecione os Moradores")).toBeTruthy();
  });

  it("exibe os nomes dos moradores", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);
    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.getByText("Bruno")).toBeTruthy();
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

  it("exibe valor no TextInput quando morador checked", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);

    expect(screen.getByDisplayValue("50,00")).toBeTruthy();
  });

  it("exibe TextInput editável quando morador checked", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);

    const input = screen.getByDisplayValue("50,00");
    expect(input).toBeTruthy();
  });

  it("chama onMoradorValorChange ao digitar no TextInput", () => {
    const props = createProps();
    render(<AddAccountModalResidentsSection {...props} />);

    fireEvent.changeText(screen.getByDisplayValue("50,00"), "7500");

    expect(props.onMoradorValorChange).toHaveBeenCalledWith("1", "75,00");
  });

  it("não exibe TextInput para morador desmarcado", () => {
    render(<AddAccountModalResidentsSection {...createProps()} />);

    expect(screen.queryAllByDisplayValue("50,00")).toHaveLength(1);
  });

  it("exibe imagem quando morador tem fotoPerfil", () => {
    const moradoresComFoto = [
      {
        ...mockMoradores[0],
        fotoPerfil: "https://example.com/foto.jpg",
      },
      mockMoradores[1],
    ];
    render(
      <AddAccountModalResidentsSection
        {...createProps({ moradoresDivisao: moradoresComFoto })}
      />
    );

    expect(screen.queryByText("A")).toBeNull();
    expect(screen.getByText("B")).toBeTruthy();
  });
});
