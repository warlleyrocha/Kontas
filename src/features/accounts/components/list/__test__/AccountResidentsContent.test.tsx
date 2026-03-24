import { render, screen } from "@testing-library/react-native";
import { AccountResidentsContent } from "../AccountResidentsContent";
import type { ContaMorador } from "../../../types/accountResidents.types";
import { StatusPagamento } from "../../../types/accountResidents.types";

jest.mock("../AccountResidentRow", () => ({
  AccountResidentRow: ({ morador }: { morador: ContaMorador }) => {
    const { Text } = jest.requireActual("react-native");
    return <Text>{morador.moradorNome}</Text>;
  },
}));

const mockMorador: ContaMorador = {
  id: "cm-1",
  contaId: "conta-1",
  moradorId: "m-1",
  moradorNome: "Ana",
  status: StatusPagamento.PENDENTE,
  valor: 75,
  visivel: true,
  pagoEm: null,
  metodoPagamento: null,
  criadoEm: "2026-03-01",
  atualizadoEm: "2026-03-01",
};

const createProps = (overrides = {}) => ({
  accountId: "conta-1",
  moradores: [mockMorador],
  isLoadingMoradores: false,
  updatingResidentById: {},
  currentResidentId: null,
  onConfirmResidentPayment: jest.fn(),
  ...overrides,
});

describe("AccountResidentsContent", () => {
  it("monta sem erros", () => {
    render(<AccountResidentsContent {...createProps()} />);
  });

  it("exibe ActivityIndicator e texto quando isLoadingMoradores é true", () => {
    render(
      <AccountResidentsContent {...createProps({ isLoadingMoradores: true })} />
    );
    expect(screen.getByText("Carregando moradores...")).toBeTruthy();
  });

  it("exibe 'Nenhum morador disponível' quando moradores está vazio", () => {
    render(<AccountResidentsContent {...createProps({ moradores: [] })} />);
    expect(screen.getByText("Nenhum morador disponível")).toBeTruthy();
  });

  it("renderiza uma linha por morador", () => {
    const moradores = [
      mockMorador,
      { ...mockMorador, id: "cm-2", moradorId: "m-2", moradorNome: "Bruno" },
    ];
    render(<AccountResidentsContent {...createProps({ moradores })} />);
    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.getByText("Bruno")).toBeTruthy();
  });

  it("não exibe o loading quando isLoadingMoradores é false e há moradores", () => {
    render(<AccountResidentsContent {...createProps()} />);
    expect(screen.queryByText("Carregando moradores...")).toBeNull();
    expect(screen.queryByText("Nenhum morador disponível")).toBeNull();
  });
});
