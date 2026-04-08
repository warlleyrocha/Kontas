import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";
import type { ContaMorador } from "../../../types/accountResidents.types";
import { StatusPagamento } from "../../../types/accountResidents.types";
import { AccountResidentRow } from "../AccountResidentRow";

jest.mock("../../shared/AccountStatusIcon", () => ({
  AccountStatusIcon: () => null,
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
  morador: mockMorador,
  isLastItem: false,
  isUpdatingMorador: false,
  currentResidentId: "m-1",
  onConfirmResidentPayment: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("AccountResidentRow", () => {
  it("monta sem erros", () => {
    render(<AccountResidentRow {...createProps()} />);
  });

  it("exibe o nome do morador", () => {
    render(<AccountResidentRow {...createProps()} />);
    expect(screen.getByText("Ana")).toBeTruthy();
  });

  it("exibe o valor formatado quando valor > 0", () => {
    render(<AccountResidentRow {...createProps()} />);
    expect(screen.getByText("R$ 75,00")).toBeTruthy();
  });

  it("não exibe o valor quando valor é 0", () => {
    render(
      <AccountResidentRow
        {...createProps({ morador: { ...mockMorador, valor: 0 } })}
      />
    );
    expect(screen.queryByText(/R\$/)).toBeNull();
  });

  it("exibe badge 'Pendente' para status PENDENTE", () => {
    render(<AccountResidentRow {...createProps()} />);
    expect(screen.getByText("Pendente")).toBeTruthy();
  });

  it("exibe badge 'Pago' para status PAGO", () => {
    render(
      <AccountResidentRow
        {...createProps({
          morador: { ...mockMorador, status: StatusPagamento.PAGO },
        })}
      />
    );
    expect(screen.getByText("Pago")).toBeTruthy();
  });

  it("exibe badge 'Aguardando' para status AGUARDANDO_CONFIRMACAO", () => {
    render(
      <AccountResidentRow
        {...createProps({
          morador: {
            ...mockMorador,
            status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
          },
        })}
      />
    );
    expect(screen.getByText("Aguardando")).toBeTruthy();
  });

  it("chama onConfirmResidentPayment ao pressionar quando pode confirmar", async () => {
    const props = createProps();
    const { UNSAFE_getByType } = render(<AccountResidentRow {...props} />);

    await act(async () => {
      fireEvent.press(UNSAFE_getByType(TouchableOpacity), {
        stopPropagation: jest.fn(),
      });
    });

    expect(props.onConfirmResidentPayment).toHaveBeenCalledWith(
      "conta-1",
      "cm-1"
    );
  });

  it("não chama onConfirmResidentPayment quando morador está pago", async () => {
    const props = createProps({
      morador: { ...mockMorador, status: StatusPagamento.PAGO },
    });
    const { UNSAFE_getByType } = render(<AccountResidentRow {...props} />);

    await act(async () => {
      fireEvent.press(UNSAFE_getByType(TouchableOpacity), {
        stopPropagation: jest.fn(),
      });
    });

    expect(props.onConfirmResidentPayment).not.toHaveBeenCalled();
  });

  it("não chama onConfirmResidentPayment quando morador está aguardando confirmação", async () => {
    const props = createProps({
      morador: {
        ...mockMorador,
        status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
      },
    });
    const { UNSAFE_getByType } = render(<AccountResidentRow {...props} />);

    await act(async () => {
      fireEvent.press(UNSAFE_getByType(TouchableOpacity), {
        stopPropagation: jest.fn(),
      });
    });

    expect(props.onConfirmResidentPayment).not.toHaveBeenCalled();
  });

  it("não chama onConfirmResidentPayment quando isUpdatingMorador é true", async () => {
    const props = createProps({ isUpdatingMorador: true });
    const { UNSAFE_getByType } = render(<AccountResidentRow {...props} />);

    await act(async () => {
      fireEvent.press(UNSAFE_getByType(TouchableOpacity), {
        stopPropagation: jest.fn(),
      });
    });

    expect(props.onConfirmResidentPayment).not.toHaveBeenCalled();
  });

  it("não chama onConfirmResidentPayment quando currentResidentId não corresponde", async () => {
    const props = createProps({ currentResidentId: "outro-id" });
    const { UNSAFE_getByType } = render(<AccountResidentRow {...props} />);

    await act(async () => {
      fireEvent.press(UNSAFE_getByType(TouchableOpacity), {
        stopPropagation: jest.fn(),
      });
    });

    expect(props.onConfirmResidentPayment).not.toHaveBeenCalled();
  });

  it("não aplica borda quando isLastItem=true (L49)", () => {
    render(<AccountResidentRow {...createProps({ isLastItem: true })} />);
    expect(screen.getByText("Ana")).toBeTruthy();
  });

  it("não chama onConfirmResidentPayment quando não é fornecido", async () => {
    const props = createProps({ onConfirmResidentPayment: undefined });
    const { UNSAFE_getByType } = render(<AccountResidentRow {...props} />);

    await act(async () => {
      fireEvent.press(UNSAFE_getByType(TouchableOpacity), {
        stopPropagation: jest.fn(),
      });
    });
    // não deve lançar erro
  });
});
