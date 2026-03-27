import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type { PaymentAccount } from "@/src/features/accounts/types/payments.types";

export type PaymentsState = {
  accounts: PaymentAccount[];
  isLoading: boolean;
  isRefreshing: boolean;
};

export type PaymentsAction =
  | { type: "LOAD_START" }
  | { type: "REFRESH_START" }
  | { type: "LOAD_SUCCESS"; accounts: PaymentAccount[] }
  | { type: "LOAD_DONE" }
  | { type: "CONFIRM_RESIDENT"; accountId: string; residentId: string };

export const paymentsInitialState: PaymentsState = {
  accounts: [],
  isLoading: true,
  isRefreshing: false,
};

export function paymentsReducer(
  state: PaymentsState,
  action: PaymentsAction,
): PaymentsState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, isLoading: true };
    case "REFRESH_START":
      return { ...state, isRefreshing: true };
    case "LOAD_SUCCESS":
      return { ...state, accounts: action.accounts };
    case "LOAD_DONE":
      return { ...state, isLoading: false, isRefreshing: false };
    case "CONFIRM_RESIDENT":
      return {
        ...state,
        accounts: state.accounts
          .map((account) => {
            if (account.id !== action.accountId) return account;
            return {
              ...account,
              residents: account.residents.map((resident) =>
                resident.id === action.residentId
                  ? {
                      ...resident,
                      pagoEm: new Date().toISOString(),
                      status: StatusPagamento.PAGO,
                    }
                  : resident,
              ),
            };
          })
          .filter((account) => account.residents.length > 0),
      };
  }
}
