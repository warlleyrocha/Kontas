import React from "react";
import { act, renderHook } from "@testing-library/react-native";
import { useAuth } from "@/src/features/auth/contexts";
import { republicService } from "@/src/features/republic/services/republic.service";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { getErrorMessage } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";
import {
  RepublicListProvider,
  useRepublicListContext,
} from "../RepublicListContext";

jest.mock("@/src/features/auth/contexts", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/src/features/republic/services/republic.service", () => ({
  republicService: {
    getRepublics: jest.fn(),
    getRepublicById: jest.fn(),
  },
}));

jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));

jest.mock("@/src/shared/utils/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { error: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRepublic: RepublicResponse = {
  id: "rep-1",
  nome: "Alpha",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderWithProvider(isAuthenticated = false) {
  return renderHook(() => useRepublicListContext(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <RepublicListProvider>{children}</RepublicListProvider>
    ),
  });
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any);
  jest.mocked(getErrorMessage).mockImplementation(
    (_err, fallback) => fallback ?? "erro"
  );
});

// ─── useRepublicListContext ───────────────────────────────────────────────────

describe("useRepublicListContext", () => {
  it("retorna o default context quando usado fora do RepublicListProvider", () => {
    // createContext default é {} (truthy), então não lança — mas as propriedades não estão definidas
    const { result } = renderHook(() => useRepublicListContext());
    expect(result.current).toBeDefined();
  });

  it("retorna o contexto quando usado dentro do RepublicListProvider", async () => {
    const { result } = renderWithProvider();

    expect(result.current.republics).toEqual([]);
    expect(typeof result.current.fetchRepublics).toBe("function");
    expect(typeof result.current.fetchRepublicById).toBe("function");
    expect(typeof result.current.setRepublics).toBe("function");
  });
});

// ─── efeito isAuthenticated ───────────────────────────────────────────────────

describe("efeito isAuthenticated", () => {
  it("limpa republics quando isAuthenticated muda para false", async () => {
    jest.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    jest.mocked(republicService.getRepublics).mockResolvedValue([mockRepublic]);

    const { result, rerender } = renderWithProvider();

    await act(async () => {
      await result.current.fetchRepublics();
    });

    expect(result.current.republics).toEqual([mockRepublic]);

    jest.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any);
    rerender({});

    expect(result.current.republics).toEqual([]);
  });

  it("não limpa republics quando isAuthenticated permanece true", async () => {
    jest.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    jest.mocked(republicService.getRepublics).mockResolvedValue([mockRepublic]);

    const { result, rerender } = renderWithProvider();

    await act(async () => {
      await result.current.fetchRepublics();
    });

    expect(result.current.republics).toEqual([mockRepublic]);

    rerender({});

    expect(result.current.republics).toEqual([mockRepublic]);
  });
});

// ─── fetchRepublics ───────────────────────────────────────────────────────────

describe("fetchRepublics", () => {
  it("atualiza republics com os dados retornados e loga info no finally", async () => {
    jest.mocked(republicService.getRepublics).mockResolvedValue([mockRepublic]);

    const { result } = renderWithProvider();

    await act(async () => {
      await result.current.fetchRepublics();
    });

    expect(jest.mocked(republicService.getRepublics)).toHaveBeenCalledTimes(1);
    expect(result.current.republics).toEqual([mockRepublic]);
    expect(jest.mocked(logger.info)).toHaveBeenCalledWith(
      "Republic",
      "Busca de repúblicas finalizada"
    );
  });

  it("loga error com instância de Error ao falhar", async () => {
    const error = new Error("fail");
    jest.mocked(republicService.getRepublics).mockRejectedValue(error);

    const { result } = renderWithProvider();

    await act(async () => {
      await result.current.fetchRepublics();
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Republic",
      "Erro ao buscar repúblicas",
      error
    );
  });

  it("loga undefined quando o erro não é instância de Error", async () => {
    jest.mocked(republicService.getRepublics).mockRejectedValue("string error");

    const { result } = renderWithProvider();

    await act(async () => {
      await result.current.fetchRepublics();
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Republic",
      "Erro ao buscar repúblicas",
      undefined
    );
  });

  it("exibe toast com a mensagem de erro e define republics como []", async () => {
    jest.mocked(republicService.getRepublics).mockRejectedValue(new Error("fail"));
    jest.mocked(getErrorMessage).mockReturnValue("Não foi possível carregar as repúblicas.");

    const { result } = renderWithProvider();

    await act(async () => {
      await result.current.fetchRepublics();
    });

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível carregar as repúblicas."
    );
    expect(result.current.republics).toEqual([]);
  });

  it("loga info no finally mesmo quando falha", async () => {
    jest.mocked(republicService.getRepublics).mockRejectedValue(new Error("fail"));

    const { result } = renderWithProvider();

    await act(async () => {
      await result.current.fetchRepublics();
    });

    expect(jest.mocked(logger.info)).toHaveBeenCalledWith(
      "Republic",
      "Busca de repúblicas finalizada"
    );
  });
});

// ─── fetchRepublicById ────────────────────────────────────────────────────────

describe("fetchRepublicById", () => {
  it("chama getRepublicById e retorna a república", async () => {
    jest.mocked(republicService.getRepublicById).mockResolvedValue(mockRepublic);

    const { result } = renderWithProvider();

    let republic: RepublicResponse | null = null;
    await act(async () => {
      republic = await result.current.fetchRepublicById("rep-1");
    });

    expect(jest.mocked(republicService.getRepublicById)).toHaveBeenCalledWith("rep-1");
    expect(republic).toEqual(mockRepublic);
  });

  it("loga error com instância de Error e retorna null ao falhar", async () => {
    const error = new Error("not found");
    jest.mocked(republicService.getRepublicById).mockRejectedValue(error);

    const { result } = renderWithProvider();

    let republic: RepublicResponse | null | undefined;
    await act(async () => {
      republic = await result.current.fetchRepublicById("rep-1");
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Republic",
      "Erro ao buscar república por ID",
      error
    );
    expect(republic).toBeNull();
  });

  it("loga undefined quando o erro não é instância de Error e retorna null", async () => {
    jest.mocked(republicService.getRepublicById).mockRejectedValue("string error");

    const { result } = renderWithProvider();

    let republic: RepublicResponse | null | undefined;
    await act(async () => {
      republic = await result.current.fetchRepublicById("rep-1");
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Republic",
      "Erro ao buscar república por ID",
      undefined
    );
    expect(republic).toBeNull();
  });

  it("exibe toast com a mensagem de erro ao falhar", async () => {
    jest.mocked(republicService.getRepublicById).mockRejectedValue(new Error("fail"));
    jest.mocked(getErrorMessage).mockReturnValue("Não foi possível carregar a república.");

    const { result } = renderWithProvider();

    await act(async () => {
      await result.current.fetchRepublicById("rep-1");
    });

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível carregar a república."
    );
  });
});
