import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type { ContaMorador } from "@/src/features/accounts/types/accountResidents.types";
import type { PaymentAccount } from "@/src/features/accounts/types/payments.types";
import {
  paymentsInitialState,
  paymentsReducer,
  type PaymentsState,
} from "../paymentsReducer";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function mockResident(
  id: string,
  overrides?: Partial<ContaMorador>,
): ContaMorador {
  return {
    id,
    contaId: "acc-1",
    moradorId: id,
    moradorNome: "Ana",
    status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    valor: 50,
    visivel: true,
    pagoEm: null,
    metodoPagamento: null,
    criadoEm: "2026-01-01",
    atualizadoEm: "2026-01-01",
    ...overrides,
  };
}

function mockAccount(
  id: string,
  residents: ContaMorador[],
): PaymentAccount {
  return {
    id,
    descricao: `Conta ${id}`,
    valor: 100,
    vencimento: "2026-03-20",
    status: "PENDENTE" as any,
    republicaId: "rep-1",
    criadoPorId: "u-1",
    criadoPorNome: "Admin",
    metodoPagamento: null,
    pago: false,
    pagoEm: null,
    criadoEm: "2026-01-01",
    atualizadoEm: "2026-01-01",
    residents,
  };
}

function stateWith(overrides: Partial<PaymentsState>): PaymentsState {
  return { ...paymentsInitialState, ...overrides };
}

// ─── paymentsInitialState ────────────────────────────────────────────────────

describe("paymentsInitialState", () => {
  it("tem accounts vazio, isLoading true e isRefreshing false", () => {
    expect(paymentsInitialState).toEqual({
      accounts: [],
      isLoading: true,
      isRefreshing: false,
    });
  });
});

// ─── LOAD_START ──────────────────────────────────────────────────────────────

describe("paymentsReducer — LOAD_START", () => {
  it("define isLoading como true", () => {
    const state = stateWith({ isLoading: false });
    const result = paymentsReducer(state, { type: "LOAD_START" });
    expect(result.isLoading).toBe(true);
  });

  it("mantém accounts e isRefreshing inalterados", () => {
    const accounts = [mockAccount("acc-1", [mockResident("r-1")])];
    const state = stateWith({ accounts, isRefreshing: true, isLoading: false });
    const result = paymentsReducer(state, { type: "LOAD_START" });
    expect(result.accounts).toBe(accounts);
    expect(result.isRefreshing).toBe(true);
  });
});

// ─── REFRESH_START ───────────────────────────────────────────────────────────

describe("paymentsReducer — REFRESH_START", () => {
  it("define isRefreshing como true", () => {
    const state = stateWith({ isRefreshing: false });
    const result = paymentsReducer(state, { type: "REFRESH_START" });
    expect(result.isRefreshing).toBe(true);
  });

  it("mantém accounts e isLoading inalterados", () => {
    const accounts = [mockAccount("acc-1", [mockResident("r-1")])];
    const state = stateWith({ accounts, isLoading: true });
    const result = paymentsReducer(state, { type: "REFRESH_START" });
    expect(result.accounts).toBe(accounts);
    expect(result.isLoading).toBe(true);
  });
});

// ─── LOAD_SUCCESS ────────────────────────────────────────────────────────────

describe("paymentsReducer — LOAD_SUCCESS", () => {
  it("substitui accounts pelo payload", () => {
    const newAccounts = [mockAccount("acc-new", [mockResident("r-1")])];
    const state = stateWith({
      accounts: [mockAccount("acc-old", [mockResident("r-2")])],
    });
    const result = paymentsReducer(state, {
      type: "LOAD_SUCCESS",
      accounts: newAccounts,
    });
    expect(result.accounts).toBe(newAccounts);
  });

  it("mantém isLoading e isRefreshing inalterados", () => {
    const state = stateWith({ isLoading: true, isRefreshing: true });
    const result = paymentsReducer(state, {
      type: "LOAD_SUCCESS",
      accounts: [],
    });
    expect(result.isLoading).toBe(true);
    expect(result.isRefreshing).toBe(true);
  });
});

// ─── LOAD_DONE ───────────────────────────────────────────────────────────────

describe("paymentsReducer — LOAD_DONE", () => {
  it("define isLoading e isRefreshing como false", () => {
    const state = stateWith({ isLoading: true, isRefreshing: true });
    const result = paymentsReducer(state, { type: "LOAD_DONE" });
    expect(result.isLoading).toBe(false);
    expect(result.isRefreshing).toBe(false);
  });

  it("mantém accounts inalterado", () => {
    const accounts = [mockAccount("acc-1", [mockResident("r-1")])];
    const state = stateWith({ accounts, isLoading: true });
    const result = paymentsReducer(state, { type: "LOAD_DONE" });
    expect(result.accounts).toBe(accounts);
  });
});

// ─── CONFIRM_RESIDENT ────────────────────────────────────────────────────────

describe("paymentsReducer — CONFIRM_RESIDENT", () => {
  it("atualiza status do morador para PAGO e define pagoEm", () => {
    const resident = mockResident("r-1");
    const account = mockAccount("acc-1", [resident]);
    const state = stateWith({ accounts: [account] });

    const result = paymentsReducer(state, {
      type: "CONFIRM_RESIDENT",
      accountId: "acc-1",
      residentId: "r-1",
    });

    const updatedResident = result.accounts[0]?.residents[0];
    expect(updatedResident?.status).toBe(StatusPagamento.PAGO);
    expect(updatedResident?.pagoEm).toBeTruthy();
  });

  it("não altera moradores de outras contas", () => {
    const resident1 = mockResident("r-1");
    const resident2 = mockResident("r-2");
    const account1 = mockAccount("acc-1", [resident1]);
    const account2 = mockAccount("acc-2", [resident2]);
    const state = stateWith({ accounts: [account1, account2] });

    const result = paymentsReducer(state, {
      type: "CONFIRM_RESIDENT",
      accountId: "acc-1",
      residentId: "r-1",
    });

    expect(result.accounts[1]?.residents[0]?.status).toBe(
      StatusPagamento.AGUARDANDO_CONFIRMACAO,
    );
  });

  it("não altera outros moradores na mesma conta", () => {
    const resident1 = mockResident("r-1");
    const resident2 = mockResident("r-2");
    const account = mockAccount("acc-1", [resident1, resident2]);
    const state = stateWith({ accounts: [account] });

    const result = paymentsReducer(state, {
      type: "CONFIRM_RESIDENT",
      accountId: "acc-1",
      residentId: "r-1",
    });

    expect(result.accounts[0]?.residents[1]?.status).toBe(
      StatusPagamento.AGUARDANDO_CONFIRMACAO,
    );
  });
});

// ─── REFUSE_RESIDENT ─────────────────────────────────────────────────────────

describe("paymentsReducer — REFUSE_RESIDENT", () => {
  it("remove o morador recusado da conta", () => {
    const resident1 = mockResident("r-1");
    const resident2 = mockResident("r-2");
    const account = mockAccount("acc-1", [resident1, resident2]);
    const state = stateWith({ accounts: [account] });

    const result = paymentsReducer(state, {
      type: "REFUSE_RESIDENT",
      accountId: "acc-1",
      residentId: "r-1",
    });

    expect(result.accounts[0]?.residents).toHaveLength(1);
    expect(result.accounts[0]?.residents[0]?.id).toBe("r-2");
  });

  it("remove a conta se ficar sem moradores após recusa", () => {
    const resident = mockResident("r-1");
    const account = mockAccount("acc-1", [resident]);
    const state = stateWith({ accounts: [account] });

    const result = paymentsReducer(state, {
      type: "REFUSE_RESIDENT",
      accountId: "acc-1",
      residentId: "r-1",
    });

    expect(result.accounts).toHaveLength(0);
  });

  it("não altera moradores de outras contas", () => {
    const resident1 = mockResident("r-1");
    const resident2 = mockResident("r-2");
    const account1 = mockAccount("acc-1", [resident1]);
    const account2 = mockAccount("acc-2", [resident2]);
    const state = stateWith({ accounts: [account1, account2] });

    const result = paymentsReducer(state, {
      type: "REFUSE_RESIDENT",
      accountId: "acc-1",
      residentId: "r-1",
    });

    expect(result.accounts).toHaveLength(1);
    expect(result.accounts[0]?.id).toBe("acc-2");
    expect(result.accounts[0]?.residents).toHaveLength(1);
  });
});
