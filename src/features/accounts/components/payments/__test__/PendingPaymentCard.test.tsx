import { fireEvent, render, screen } from "@testing-library/react-native";
import { StatusConta } from "@/src/features/accounts/types/account.types";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type { PaymentAccount } from "@/src/features/accounts/types/payments.types";
import { PendingPaymentCard } from "../PendingPaymentCard";
import { PendingPaymentResidentCard } from "../PendingPaymentResidentCard";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../PendingPaymentResidentCard", () => ({
  __esModule: true,
  PendingPaymentResidentCard: jest.fn(() => null),
}));

const mockPendingPaymentResidentCard = jest.mocked(PendingPaymentResidentCard);

function createResident(id: string) {
  return {
    id,
    contaId: "account-1",
    moradorId: id,
    moradorNome: `Morador ${id}`,
    status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    valor: 60,
    visivel: true,
    pagoEm: null,
    criadoEm: "2026-03-20T00:00:00.000Z",
    atualizadoEm: "2026-03-20T00:00:00.000Z",
  };
}

function createAccount(
  overrides?: Partial<PaymentAccount>
): PaymentAccount {
  return {
    id: "account-1",
    descricao: "Conta de luz",
    valor: 120,
    vencimento: "2026-03-20",
    status: StatusConta.PENDENTE,
    republicaId: "republica-1",
    criadoPorId: "user-1",
    criadoPorNome: "Warlley",
    metodoPagamento: "PIX",
    pago: false,
    pagoEm: null,
    criadoEm: "2026-03-20T00:00:00.000Z",
    atualizadoEm: "2026-03-20T00:00:00.000Z",
    residents: [createResident("resident-1"), createResident("resident-2")],
    ...overrides,
  };
}

describe("PendingPaymentCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza descrição, valor e data de vencimento da conta", () => {
    const account = createAccount();

    render(
      <PendingPaymentCard
        account={account}
        confirmingResidentById={{}}
        onConfirmResidentPayment={jest.fn()}
        onRefuseResidentPayment={jest.fn()}
        selectedStatus={StatusPagamento.AGUARDANDO_CONFIRMACAO}
      />
    );

    expect(screen.getByText("Conta de luz")).toBeTruthy();
    expect(screen.getByText("R$ 120,00")).toBeTruthy();
    expect(screen.getByText(/Vence em/)).toBeTruthy();
  });

  it("exibe label '1 morador' quando há apenas um morador", () => {
    const account = createAccount({
      residents: [createResident("resident-1")],
    });

    render(
      <PendingPaymentCard
        account={account}
        confirmingResidentById={{}}
        onConfirmResidentPayment={jest.fn()}
        onRefuseResidentPayment={jest.fn()}
        selectedStatus={StatusPagamento.AGUARDANDO_CONFIRMACAO}
      />
    );

    expect(screen.getByText("1 morador")).toBeTruthy();
  });

  it("exibe label 'N moradores' quando há mais de um morador", () => {
    const account = createAccount();

    render(
      <PendingPaymentCard
        account={account}
        confirmingResidentById={{}}
        onConfirmResidentPayment={jest.fn()}
        onRefuseResidentPayment={jest.fn()}
        selectedStatus={StatusPagamento.AGUARDANDO_CONFIRMACAO}
      />
    );

    expect(screen.getByText("2 moradores")).toBeTruthy();
  });

  it("não exibe os moradores antes de expandir", () => {
    render(
      <PendingPaymentCard
        account={createAccount()}
        confirmingResidentById={{}}
        onConfirmResidentPayment={jest.fn()}
        onRefuseResidentPayment={jest.fn()}
        selectedStatus={StatusPagamento.AGUARDANDO_CONFIRMACAO}
      />
    );

    expect(screen.getByText("Ver detalhes do pagamento")).toBeTruthy();
    expect(mockPendingPaymentResidentCard).not.toHaveBeenCalled();
  });

  it("expande e exibe os moradores ao pressionar", () => {
    const onConfirmResidentPayment = jest.fn();
    const onRefuseResidentPayment = jest.fn();
    const confirmingResidentById = { "resident-1": true };
    const account = createAccount();

    render(
      <PendingPaymentCard
        account={account}
        confirmingResidentById={confirmingResidentById}
        onConfirmResidentPayment={onConfirmResidentPayment}
        onRefuseResidentPayment={onRefuseResidentPayment}
        selectedStatus={StatusPagamento.AGUARDANDO_CONFIRMACAO}
      />
    );

    fireEvent.press(screen.getByText("Ver detalhes do pagamento"));

    expect(screen.getByText("Ocultar detalhes")).toBeTruthy();
    expect(mockPendingPaymentResidentCard).toHaveBeenCalledTimes(2);
    expect(mockPendingPaymentResidentCard.mock.calls[0]?.[0]).toMatchObject({
      accountId: "account-1",
      resident: account.residents[0],
      isConfirming: true,
      onConfirmResidentPayment,
      onRefuseResidentPayment,
    });
    expect(mockPendingPaymentResidentCard.mock.calls[1]?.[0]).toMatchObject({
      accountId: "account-1",
      resident: account.residents[1],
      isConfirming: false,
      onConfirmResidentPayment,
      onRefuseResidentPayment,
    });
  });

  it("recolhe os detalhes ao pressionar novamente", () => {
    render(
      <PendingPaymentCard
        account={createAccount()}
        confirmingResidentById={{}}
        onConfirmResidentPayment={jest.fn()}
        onRefuseResidentPayment={jest.fn()}
        selectedStatus={StatusPagamento.AGUARDANDO_CONFIRMACAO}
      />
    );

    fireEvent.press(screen.getByText("Ver detalhes do pagamento"));
    expect(screen.getByText("Ocultar detalhes")).toBeTruthy();

    fireEvent.press(screen.getByText("Ocultar detalhes"));
    expect(screen.getByText("Ver detalhes do pagamento")).toBeTruthy();
  });

  it("exibe título 'Pagamentos confirmados' quando status é PAGO", () => {
    render(
      <PendingPaymentCard
        account={createAccount()}
        confirmingResidentById={{}}
        onConfirmResidentPayment={jest.fn()}
        onRefuseResidentPayment={jest.fn()}
        selectedStatus={StatusPagamento.PAGO}
      />
    );

    fireEvent.press(screen.getByText("Ver detalhes do pagamento"));

    expect(screen.getByText("Pagamentos confirmados")).toBeTruthy();
  });

  it("exibe título 'Aguardando confirmação do admin' quando status é AGUARDANDO_CONFIRMACAO", () => {
    render(
      <PendingPaymentCard
        account={createAccount()}
        confirmingResidentById={{}}
        onConfirmResidentPayment={jest.fn()}
        onRefuseResidentPayment={jest.fn()}
        selectedStatus={StatusPagamento.AGUARDANDO_CONFIRMACAO}
      />
    );

    fireEvent.press(screen.getByText("Ver detalhes do pagamento"));

    expect(
      screen.getByText("Aguardando confirmação do admin")
    ).toBeTruthy();
  });

  it("exibe título 'Pagamentos por morador' quando status é 'todos'", () => {
    render(
      <PendingPaymentCard
        account={createAccount()}
        confirmingResidentById={{}}
        onConfirmResidentPayment={jest.fn()}
        onRefuseResidentPayment={jest.fn()}
        selectedStatus="todos"
      />
    );

    fireEvent.press(screen.getByText("Ver detalhes do pagamento"));

    expect(screen.getByText("Pagamentos por morador")).toBeTruthy();
  });
});
