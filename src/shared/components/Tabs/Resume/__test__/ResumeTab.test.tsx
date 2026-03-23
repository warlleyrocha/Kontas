import { render, screen } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import type { ResidentResponse } from "@/src/shared/types/resident.types";
import { ResumeTab } from "../index";

jest.mock("@expo/vector-icons/Ionicons", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  useRefresh: jest.fn(),
}));

jest.mock("../useResumeTab", () => ({
  useResumeTab: jest.fn(),
}));

jest.mock("../ResumoCard", () => ({
  ResumoCard: ({ label, isLoading }: { label: string; isLoading: boolean }) => {
    const { Text } = require("react-native");
    return (
      <Text testID={`resumo-card-${label}`} accessibilityState={{ busy: isLoading }}>
        {label}
      </Text>
    );
  },
}));

jest.mock("../MoradorRow", () => ({
  MoradorRow: ({
    morador,
    valor,
  }: {
    morador: { id: string; nome: string };
    valor: number;
  }) => {
    const { Text } = require("react-native");
    return (
      <Text testID={`morador-row-${morador.id}`}>
        {morador.nome}:{valor}
      </Text>
    );
  },
}));

const { useRefresh } = require("@/src/shared/contexts/RefreshContext");
const { useResumeTab } = require("../useResumeTab");

const mockResidents: ResidentResponse[] = [
  {
    id: "r-1",
    nome: "Ana",
    email: "ana@email.com",
    fotoPerfil: null,
    chavePix: null,
    telefone: null,
    role: "MORADOR" as any,
  },
  {
    id: "r-2",
    nome: "Bruno",
    email: "bruno@email.com",
    fotoPerfil: null,
    chavePix: null,
    telefone: null,
    role: "MORADOR" as any,
  },
];

const defaultResumeTab = {
  contas: [{ id: "c-1" }, { id: "c-2" }],
  isLoadingContas: false,
  dividas: { "r-1": 150, "r-2": 0 },
  isLoadingDividas: false,
  totalValor: 300,
  totalPago: 150,
  totalPendente: 150,
  quantidadePagas: 1,
  quantidadePendentes: 1,
};

beforeEach(() => {
  jest.mocked(useRefresh).mockReturnValue({ refreshing: false, onRefresh: jest.fn() });
  jest.mocked(useResumeTab).mockReturnValue(defaultResumeTab);
});

const renderComponent = (overrides = {}) =>
  render(
    <ResumeTab
      residents={mockResidents}
      republicId="rep-1"
      {...overrides}
    />
  );

describe("ResumeTab", () => {
  it("monta sem erros", () => {
    renderComponent();
  });

  it("renderiza os 3 ResumoCards", () => {
    renderComponent();
    expect(screen.getByTestId("resumo-card-Total de Contas")).toBeTruthy();
    expect(screen.getByTestId("resumo-card-Contas Pagas")).toBeTruthy();
    expect(screen.getByTestId("resumo-card-Pendentes")).toBeTruthy();
  });

  it("exibe o título e subtítulo da seção de dívidas", () => {
    renderComponent();
    expect(screen.getByText("Dívidas por Morador")).toBeTruthy();
    expect(screen.getByText("Valores pendentes de cada morador")).toBeTruthy();
  });

  it("renderiza MoradorRow para cada morador quando não está carregando dívidas", () => {
    renderComponent();
    expect(screen.getByTestId("morador-row-r-1")).toBeTruthy();
    expect(screen.getByTestId("morador-row-r-2")).toBeTruthy();
  });

  it("exibe ActivityIndicator quando isLoadingDividas é true", () => {
    jest.mocked(useResumeTab).mockReturnValue({ ...defaultResumeTab, isLoadingDividas: true });
    const { UNSAFE_getByType } = renderComponent();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("não renderiza MoradorRow quando isLoadingDividas é true", () => {
    jest.mocked(useResumeTab).mockReturnValue({ ...defaultResumeTab, isLoadingDividas: true });
    renderComponent();
    expect(screen.queryByTestId("morador-row-r-1")).toBeNull();
  });

  it("passa o valor correto de dividas para cada MoradorRow", () => {
    renderComponent();
    expect(screen.getByText("Ana:150")).toBeTruthy();
    expect(screen.getByText("Bruno:0")).toBeTruthy();
  });

  it("usa 0 como fallback quando morador não tem dívida registrada", () => {
    jest.mocked(useResumeTab).mockReturnValue({
      ...defaultResumeTab,
      dividas: {},
    });
    renderComponent();
    expect(screen.getByText("Ana:0")).toBeTruthy();
    expect(screen.getByText("Bruno:0")).toBeTruthy();
  });

  it("passa isLoadingContas para os ResumoCards", () => {
    jest.mocked(useResumeTab).mockReturnValue({ ...defaultResumeTab, isLoadingContas: true });
    renderComponent();
    const card = screen.getByTestId("resumo-card-Total de Contas");
    expect(card.props.accessibilityState.busy).toBe(true);
  });

  it("chama useResumeTab com residents e republicId corretos", () => {
    renderComponent();
    expect(useResumeTab).toHaveBeenCalledWith({
      residents: mockResidents,
      republicId: "rep-1",
    });
  });
});
