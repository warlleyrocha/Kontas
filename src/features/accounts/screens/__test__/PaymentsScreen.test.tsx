import { fireEvent, render, screen } from "@testing-library/react-native";
import {
  PaymentsEmptyState,
  PaymentsErrorState,
  PaymentsLoadingState,
  PendingPaymentsList,
} from "@/src/features/accounts/components/payments";
import { usePaymentsScreen } from "@/src/features/accounts/hooks/usePayments";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type { PaymentAccount } from "@/src/features/accounts/types/payments.types";
import PaymentsScreen from "../PaymentsScreen";

jest.mock("@/src/features/accounts/components/payments", () => ({
  PaymentsEmptyState: jest.fn(() => null),
  PaymentsErrorState: jest.fn(() => null),
  PaymentsLoadingState: jest.fn(() => null),
  PendingPaymentsList: jest.fn(() => null),
}));
jest.mock("@/src/features/accounts/hooks/usePayments", () => ({
  usePaymentsScreen: jest.fn(),
}));
jest.mock("@/src/shared/components/ScreenLayout", () => ({
  ScreenLayout: jest.fn(({ children }: any) => children),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockLoadPayments = jest.fn();
const mockHandleConfirmResidentPayment = jest.fn();
const mockHandleRefuseResidentPayment = jest.fn();
const mockSetSelectedStatus = jest.fn();

function makeHookReturn(overrides = {}) {
  return {
    error: null,
    isLoading: false,
    isRefreshing: false,
    filteredPaymentAccounts: [] as PaymentAccount[],
    confirmingResidentById: {},
    refusingResidentById: {},
    selectedStatus: StatusPagamento.AGUARDANDO_CONFIRMACAO as any,
    subtitle: "Nenhum pagamento aguardando confirmação",
    statusOptions: [
      { label: "Pendentes", value: StatusPagamento.AGUARDANDO_CONFIRMACAO },
      { label: "Pago", value: StatusPagamento.PAGO },
      { label: "Todos", value: "todos" },
    ],
    loadPayments: mockLoadPayments,
    handleConfirmResidentPayment: mockHandleConfirmResidentPayment,
    handleRefuseResidentPayment: mockHandleRefuseResidentPayment,
    setSelectedStatus: mockSetSelectedStatus,
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(usePaymentsScreen).mockReturnValue(makeHookReturn() as any);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── loading ─────────────────────────────────────────────────────────────────

describe("PaymentsScreen — loading", () => {
  it("renderiza PaymentsLoadingState quando isLoading é true", () => {
    jest
      .mocked(usePaymentsScreen)
      .mockReturnValue(makeHookReturn({ isLoading: true }) as any);

    render(<PaymentsScreen republicId="rep-1" />);

    expect(jest.mocked(PaymentsLoadingState)).toHaveBeenCalled();
    expect(jest.mocked(PendingPaymentsList)).not.toHaveBeenCalled();
  });
});

// ─── error ───────────────────────────────────────────────────────────────────

describe("PaymentsScreen — error", () => {
  it("renderiza PaymentsErrorState quando há erro", () => {
    jest.mocked(usePaymentsScreen).mockReturnValue(
      makeHookReturn({
        error: { message: "Falha de rede" },
      }) as any
    );

    render(<PaymentsScreen republicId="rep-1" />);

    expect(jest.mocked(PaymentsErrorState)).toHaveBeenCalled();
    const props = jest.mocked(PaymentsErrorState).mock.calls[0][0] as any;
    expect(props.message).toBe("Falha de rede");
  });

  it("onRetry do PaymentsErrorState chama loadPayments", () => {
    jest.mocked(usePaymentsScreen).mockReturnValue(
      makeHookReturn({
        error: { message: "err" },
      }) as any
    );

    render(<PaymentsScreen republicId="rep-1" />);

    const { onRetry } = jest.mocked(PaymentsErrorState).mock.calls[0][0] as any;
    onRetry();
    expect(mockLoadPayments).toHaveBeenCalled();
  });
});

// ─── lista de pagamentos ─────────────────────────────────────────────────────

describe("PaymentsScreen — PendingPaymentsList", () => {
  it("renderiza PendingPaymentsList quando há contas", () => {
    const accounts = [{ id: "acc-1", residents: [] }] as any;
    jest
      .mocked(usePaymentsScreen)
      .mockReturnValue(
        makeHookReturn({ filteredPaymentAccounts: accounts }) as any
      );

    render(<PaymentsScreen republicId="rep-1" />);

    expect(jest.mocked(PendingPaymentsList)).toHaveBeenCalled();
    const props = jest.mocked(PendingPaymentsList).mock.calls[0][0] as any;
    expect(props.paymentAccounts).toBe(accounts);
    expect(props.onConfirmResidentPayment).toBe(
      mockHandleConfirmResidentPayment
    );
    expect(props.onRefuseResidentPayment).toBe(mockHandleRefuseResidentPayment);
  });

  it("onRefresh do PendingPaymentsList chama loadPayments com true", () => {
    const accounts = [{ id: "acc-1", residents: [] }] as any;
    jest
      .mocked(usePaymentsScreen)
      .mockReturnValue(
        makeHookReturn({ filteredPaymentAccounts: accounts }) as any
      );

    render(<PaymentsScreen republicId="rep-1" />);

    const { onRefresh } = jest.mocked(PendingPaymentsList).mock
      .calls[0][0] as any;
    onRefresh();
    expect(mockLoadPayments).toHaveBeenCalledWith(true);
  });
});

// ─── empty state — onRefresh ─────────────────────────────────────────────────

describe("PaymentsScreen — empty state", () => {
  it("renderiza PaymentsEmptyState quando não há contas filtradas", () => {
    jest
      .mocked(usePaymentsScreen)
      .mockReturnValue(makeHookReturn({ filteredPaymentAccounts: [] }) as any);

    render(<PaymentsScreen republicId="rep-1" />);

    expect(jest.mocked(PaymentsEmptyState)).toHaveBeenCalled();
    const props = jest.mocked(PaymentsEmptyState).mock.calls[0][0] as any;
    expect(props.selectedStatus).toBe(StatusPagamento.AGUARDANDO_CONFIRMACAO);
  });

  it("onRefresh do PaymentsEmptyState chama loadPayments com true", () => {
    jest
      .mocked(usePaymentsScreen)
      .mockReturnValue(makeHookReturn({ filteredPaymentAccounts: [] }) as any);

    render(<PaymentsScreen republicId="rep-1" />);

    const { onRefresh } = jest.mocked(PaymentsEmptyState).mock
      .calls[0][0] as any;
    onRefresh();
    expect(mockLoadPayments).toHaveBeenCalledWith(true);
  });
});

// ─── filtro de status ────────────────────────────────────────────────────────

describe("PaymentsScreen — filtro de status", () => {
  it("renderiza os três botões de filtro", () => {
    render(<PaymentsScreen republicId="rep-1" />);

    expect(screen.getByText("Pendentes")).toBeTruthy();
    expect(screen.getByText("Pago")).toBeTruthy();
    expect(screen.getByText("Todos")).toBeTruthy();
  });

  it("pressionar botão de filtro chama setSelectedStatus", () => {
    render(<PaymentsScreen republicId="rep-1" />);

    fireEvent.press(
      screen.getByRole("button", { name: "Filtrar pagamentos por Pago" })
    );
    expect(mockSetSelectedStatus).toHaveBeenCalledWith(StatusPagamento.PAGO);
  });

  it("pressionar 'Todos' chama setSelectedStatus com 'todos'", () => {
    render(<PaymentsScreen republicId="rep-1" />);

    fireEvent.press(
      screen.getByRole("button", { name: "Filtrar pagamentos por Todos" })
    );
    expect(mockSetSelectedStatus).toHaveBeenCalledWith("todos");
  });
});

// ─── prioridade de conteúdo ──────────────────────────────────────────────────

describe("PaymentsScreen — prioridade de conteúdo", () => {
  it("loading tem prioridade sobre error", () => {
    jest.mocked(usePaymentsScreen).mockReturnValue(
      makeHookReturn({
        isLoading: true,
        error: { message: "err" },
      }) as any
    );

    render(<PaymentsScreen republicId="rep-1" />);

    expect(jest.mocked(PaymentsLoadingState)).toHaveBeenCalled();
    expect(jest.mocked(PaymentsErrorState)).not.toHaveBeenCalled();
  });

  it("error tem prioridade sobre empty state", () => {
    jest.mocked(usePaymentsScreen).mockReturnValue(
      makeHookReturn({
        error: { message: "err" },
        filteredPaymentAccounts: [],
      }) as any
    );

    render(<PaymentsScreen republicId="rep-1" />);

    expect(jest.mocked(PaymentsErrorState)).toHaveBeenCalled();
    expect(jest.mocked(PaymentsEmptyState)).not.toHaveBeenCalled();
  });
});
