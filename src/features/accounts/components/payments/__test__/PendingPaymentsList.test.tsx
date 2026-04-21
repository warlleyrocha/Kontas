import { render, screen } from "@testing-library/react-native";
import { ScrollView } from "react-native";
import { StatusConta } from "@/src/features/accounts/types/account.types";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type { PaymentAccount } from "@/src/features/accounts/types/payments.types";
import { PendingPaymentCard } from "../PendingPaymentCard";
import { PendingPaymentsList } from "../PendingPaymentsList";

jest.mock("../PendingPaymentCard", () => ({
  __esModule: true,
  PendingPaymentCard: jest.fn(() => null),
}));

const mockPendingPaymentCard = jest.mocked(PendingPaymentCard);

function createAccount(id: string, descricao: string): PaymentAccount {
  return {
    id,
    descricao,
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
    residents: [],
  };
}

describe("PendingPaymentsList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("monta sem erros e renderiza a lista", () => {
    render(
      <PendingPaymentsList
        paymentAccounts={[]}
        confirmingResidentById={{}}
        refusingResidentById={{}}
        isRefreshing={false}
        onConfirmResidentPayment={() => {}}
        onRefuseResidentPayment={() => {}}
        onRefresh={() => {}}
        selectedStatus={StatusPagamento.AGUARDANDO_CONFIRMACAO}
      />
    );

    expect(screen.UNSAFE_getByType(ScrollView)).toBeTruthy();
  });

  it("renderiza um PendingPaymentCard para cada conta com as props corretas", () => {
    const onConfirmResidentPayment = jest.fn();
    const confirmingResidentById = { "resident-1": true };
    const paymentAccounts = [
      createAccount("account-1", "Conta de luz"),
      createAccount("account-2", "Conta de agua"),
    ];

    render(
      <PendingPaymentsList
        paymentAccounts={paymentAccounts}
        confirmingResidentById={confirmingResidentById}
        refusingResidentById={{}}
        isRefreshing={true}
        onConfirmResidentPayment={onConfirmResidentPayment}
        onRefuseResidentPayment={jest.fn()}
        onRefresh={() => {}}
        selectedStatus={StatusPagamento.PAGO}
      />
    );

    expect(mockPendingPaymentCard).toHaveBeenCalledTimes(2);
    expect(mockPendingPaymentCard.mock.calls[0]?.[0]).toMatchObject({
      account: paymentAccounts[0],
      confirmingResidentById,
      onConfirmResidentPayment,
      selectedStatus: StatusPagamento.PAGO,
    });
    expect(mockPendingPaymentCard.mock.calls[1]?.[0]).toMatchObject({
      account: paymentAccounts[1],
      confirmingResidentById,
      onConfirmResidentPayment,
      selectedStatus: StatusPagamento.PAGO,
    });
  });
});
