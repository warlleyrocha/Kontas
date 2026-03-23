import { AppError } from "../httpError";
import { queryClient } from "../queryClient";

type QueryRetry = (failureCount: number, error: unknown) => boolean;
type RetryDelay = (attempt: number) => number;

function getQueryOptions() {
  const defaultOptions = queryClient.getDefaultOptions();

  return {
    mutations: defaultOptions.mutations,
    queries: defaultOptions.queries,
    retry: defaultOptions.queries?.retry as QueryRetry,
    retryDelay: defaultOptions.queries?.retryDelay as RetryDelay,
  };
}

describe("queryClient", () => {
  it("desabilita retry de mutations", () => {
    const { mutations } = getQueryOptions();

    expect(mutations?.retry).toBe(false);
  });

  it("aplica retryDelay exponencial com teto máximo", () => {
    const { retryDelay } = getQueryOptions();

    expect(retryDelay(0)).toBe(300);
    expect(retryDelay(1)).toBe(600);
    expect(retryDelay(10)).toBe(3000);
  });

  it("não faz retry para AppError cancelado ou circuito aberto", () => {
    const { retry } = getQueryOptions();

    expect(retry(0, new AppError("cancelado", { code: "ERR_CANCELED" }))).toBe(
      false
    );
    expect(retry(0, new AppError("circuito", { code: "CIRCUIT_OPEN" }))).toBe(
      false
    );
  });

  it("faz retry para AppError sem status e para status transitórios abaixo do limite", () => {
    const { retry } = getQueryOptions();

    expect(retry(0, new AppError("sem status"))).toBe(true);
    expect(retry(0, new AppError("timeout", { status: 408 }))).toBe(true);
    expect(retry(0, new AppError("rate limit", { status: 429 }))).toBe(true);
    expect(retry(0, new AppError("server", { status: 500 }))).toBe(true);
  });

  it("não faz retry para AppError não transitório ou quando atinge o limite", () => {
    const { retry } = getQueryOptions();

    expect(retry(0, new AppError("bad request", { status: 400 }))).toBe(false);
    expect(retry(3, new AppError("server", { status: 500 }))).toBe(false);
  });

  it("não faz retry para Error comum cancelado ou circuito aberto", () => {
    const { retry } = getQueryOptions();

    expect(
      retry(0, Object.assign(new Error("cancelado"), { code: "ERR_CANCELED" }))
    ).toBe(false);
    expect(
      retry(0, Object.assign(new Error("circuito"), { code: "CIRCUIT_OPEN" }))
    ).toBe(false);
  });

  it("faz retry para Error comum sem código especial e para valores desconhecidos", () => {
    const { retry } = getQueryOptions();

    expect(retry(0, new Error("genérico"))).toBe(true);
    expect(retry(0, "erro desconhecido")).toBe(true);
  });
});
