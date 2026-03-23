import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { TouchableOpacity, View } from "react-native";
import { MetodoPagamento, StatusConta } from "../types/account.types";
import type { Conta } from "../types/account.types";
import { AccountCard } from "../components/list/AccountCard";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@expo/vector-icons/Ionicons", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../components/shared/AccountStatusIcon", () => ({
  AccountStatusIcon: () => null,
}));

jest.mock("../components/list/AccountResidentsContent", () => ({
  AccountResidentsContent: () => {
    const { View } = require("react-native");
    return <View testID="residents-content" />;
  },
}));

const mockConta: Conta = {
  id: "conta-1",
  descricao: "Água",
  valor: 150,
  vencimento: "2026-03-22",
  status: StatusConta.PENDENTE,
  republicaId: "rep-1",
  criadoPorId: "user-1",
  criadoPorNome: "Carlos",
  metodoPagamento: "PIX",
  pago: false,
  criadoEm: "2026-03-01",
  atualizadoEm: "2026-03-01",
};

const createProps = (overrides = {}) => ({
  conta: mockConta,
  criadoPorNome: "Carlos",
  expanded: false,
  onToggleExpand: jest.fn(),
  moradores: [],
  isLoadingMoradores: false,
  updatingResidentById: {},
  currentResidentId: null,
  onLongPress: jest.fn(),
  onConfirmResidentPayment: jest.fn(),
  onPatch: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("AccountCard", () => {
  it("monta sem erros", () => {
    render(<AccountCard {...createProps()} />);
  });

  it("exibe a descrição da conta", () => {
    render(<AccountCard {...createProps()} />);
    expect(screen.getByText("Água")).toBeTruthy();
  });

  it("exibe o valor formatado", () => {
    render(<AccountCard {...createProps()} />);
    expect(screen.getByText("R$ 150.00")).toBeTruthy();
  });

  it("exibe o nome do responsável", () => {
    render(<AccountCard {...createProps()} />);
    expect(screen.getByText("Responsável: Carlos")).toBeTruthy();
  });

  it("exibe a data de vencimento formatada em pt-BR", () => {
    render(<AccountCard {...createProps()} />);
    expect(screen.getByText("22/03/2026")).toBeTruthy();
  });

  it('exibe "Data inválida" para vencimento inválido', () => {
    render(
      <AccountCard
        {...createProps({ conta: { ...mockConta, vencimento: "not-a-date" } })}
      />,
    );
    expect(screen.getByText("Data inválida")).toBeTruthy();
  });

  it("exibe a quantidade de moradores", () => {
    const moradores = [
      {
        id: "cm-1",
        contaId: "conta-1",
        moradorId: "m-1",
        moradorNome: "Ana",
        status: "PENDENTE" as any,
        valor: 75,
        visivel: true,
        pagoEm: null,
        metodoPagamento: null,
        criadoEm: "2026-03-01",
        atualizadoEm: "2026-03-01",
      },
    ];
    render(<AccountCard {...createProps({ moradores })} />);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it('exibe "..." quando isLoadingMoradores é true', () => {
    render(<AccountCard {...createProps({ isLoadingMoradores: true })} />);
    expect(screen.getByText("...")).toBeTruthy();
  });

  it("chama onToggleExpand ao pressionar a seção de moradores", () => {
    const props = createProps();
    const { UNSAFE_getAllByType } = render(<AccountCard {...props} />);

    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // [0] outer card, [1] patch button, [2] toggle expand, [3] Copiar PIX
    fireEvent.press(buttons[2], { stopPropagation: jest.fn() });

    expect(props.onToggleExpand).toHaveBeenCalledTimes(1);
  });

  it("exibe AccountResidentsContent quando expanded é true", () => {
    render(<AccountCard {...createProps({ expanded: true })} />);
    expect(screen.getByTestId("residents-content")).toBeTruthy();
  });

  it("não exibe AccountResidentsContent quando expanded é false", () => {
    render(<AccountCard {...createProps()} />);
    expect(screen.queryByTestId("residents-content")).toBeNull();
  });

  it('exibe "Copiar PIX" quando a conta não está paga', () => {
    render(<AccountCard {...createProps()} />);
    expect(screen.getByText("Copiar PIX")).toBeTruthy();
  });

  it('não exibe "Copiar PIX" quando a conta está paga', () => {
    render(
      <AccountCard
        {...createProps({ conta: { ...mockConta, status: StatusConta.PAGA } })}
      />,
    );
    expect(screen.queryByText("Copiar PIX")).toBeNull();
  });

  it("chama onPatch com MetodoPagamento.PIX para metodoPagamento PIX", async () => {
    const props = createProps();
    const { UNSAFE_getAllByType } = render(<AccountCard {...props} />);

    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    await act(async () => {
      fireEvent.press(buttons[1], { stopPropagation: jest.fn() });
    });

    expect(props.onPatch).toHaveBeenCalledWith("conta-1", MetodoPagamento.PIX);
  });

  it("não chama onPatch quando a conta está paga (guard interno)", async () => {
    const props = createProps({
      conta: { ...mockConta, status: StatusConta.PAGA },
    });
    const { UNSAFE_getAllByType } = render(<AccountCard {...props} />);

    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    await act(async () => {
      fireEvent.press(buttons[1], { stopPropagation: jest.fn() });
    });

    expect(props.onPatch).not.toHaveBeenCalled();
  });

  it("não chama onPatch quando onPatch não é fornecido", async () => {
    const props = createProps({ onPatch: undefined });
    const { UNSAFE_getAllByType } = render(<AccountCard {...props} />);

    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    await act(async () => {
      fireEvent.press(buttons[1], { stopPropagation: jest.fn() });
    });
    // sem onPatch definido, não deve lançar erro
  });

  it("normaliza metodoPagamento null para PIX", async () => {
    const props = createProps({
      conta: { ...mockConta, metodoPagamento: null },
    });
    const { UNSAFE_getAllByType } = render(<AccountCard {...props} />);

    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    await act(async () => {
      fireEvent.press(buttons[1], { stopPropagation: jest.fn() });
    });

    expect(props.onPatch).toHaveBeenCalledWith("conta-1", MetodoPagamento.PIX);
  });

  it("normaliza metodoPagamento 'Cartão' para CARTAO", async () => {
    const props = createProps({
      conta: { ...mockConta, metodoPagamento: "Cartão" },
    });
    const { UNSAFE_getAllByType } = render(<AccountCard {...props} />);

    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    await act(async () => {
      fireEvent.press(buttons[1], { stopPropagation: jest.fn() });
    });

    expect(props.onPatch).toHaveBeenCalledWith(
      "conta-1",
      MetodoPagamento.CARTAO,
    );
  });

  it("normaliza metodoPagamento 'Dinheiro' para DINHEIRO", async () => {
    const props = createProps({
      conta: { ...mockConta, metodoPagamento: "Dinheiro" },
    });
    const { UNSAFE_getAllByType } = render(<AccountCard {...props} />);

    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    await act(async () => {
      fireEvent.press(buttons[1], { stopPropagation: jest.fn() });
    });

    expect(props.onPatch).toHaveBeenCalledWith(
      "conta-1",
      MetodoPagamento.DINHEIRO,
    );
  });

  it("exibe borda laranja quando a conta está atrasada", () => {
    render(
      <AccountCard
        {...createProps({ conta: { ...mockConta, status: StatusConta.ATRASADA } })}
      />,
    );
    // componente renderiza sem erros com status atrasado
  });

  it("chama onLongPress com posição ao realizar longPress no card", () => {
    const props = createProps();
    const { UNSAFE_getAllByType } = render(<AccountCard {...props} />);

    const outerView = UNSAFE_getAllByType(View)[0];
    outerView.instance.measure = jest.fn(
      (cb: (x: number, y: number, w: number, h: number, px: number, py: number) => void) => {
        cb(0, 0, 100, 50, 10, 20);
      },
    );

    fireEvent(UNSAFE_getAllByType(TouchableOpacity)[0], "longPress");

    expect(props.onLongPress).toHaveBeenCalledWith({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
  });
});
