import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useAuth } from "@/src/features/auth/contexts";
import { residentService } from "@/src/features/residents/services/resident.service";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { logger } from "@/src/shared/utils/logger";
import { useRepublicResidents } from "./useRepublicResidents";

jest.mock("@/src/features/auth/contexts", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

jest.mock("@/src/features/residents/services/resident.service", () => ({
  __esModule: true,
  residentService: {
    getResidents: jest.fn(),
  },
}));

jest.mock("@/src/shared/utils/logger", () => ({
  __esModule: true,
  logger: {
    error: jest.fn(),
  },
}));

const mockUseAuth = jest.mocked(useAuth);
const mockResidentService = jest.mocked(residentService);
const mockLogger = jest.mocked(logger);

const republics = [
  { id: "rep-1", nome: "Rep 1" },
  { id: "rep-2", nome: "Rep 2" },
];

describe("useRepublicResidents", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockUseAuth.mockReturnValue({ isAuthenticated: true } as never);
    mockResidentService.getResidents.mockReset();
    mockLogger.error.mockReset();
  });

  it("não carrega moradores quando o hook estiver desabilitado", async () => {
    const { result } = renderHook(() =>
      useRepublicResidents(republics, "user@example.com", false),
    );

    expect(mockResidentService.getResidents).not.toHaveBeenCalled();
    expect(result.current.residentsCount).toEqual({});
    expect(result.current.getResidentsCount("rep-1")).toBe(0);
    expect(result.current.getUserRole("rep-1")).toBeNull();
    expect(result.current.isAdmin("rep-1")).toBe(false);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockResidentService.getResidents).not.toHaveBeenCalled();
  });

  it("carrega a contagem de moradores e o papel do usuário atual", async () => {
    mockResidentService.getResidents
      .mockResolvedValueOnce([
        {
          id: "resident-1",
          nome: "Admin",
          email: "USER@example.com",
          fotoPerfil: null,
          chavePix: null,
          telefone: null,
          role: ResidentRole.ADMIN,
        },
        {
          id: "resident-2",
          nome: "Outro",
          email: "other@example.com",
          fotoPerfil: null,
          chavePix: null,
          telefone: null,
          role: ResidentRole.USER,
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          id: "resident-3",
          nome: "Morador",
          email: "third@example.com",
          fotoPerfil: null,
          chavePix: null,
          telefone: null,
          role: ResidentRole.USER,
        },
      ] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never);

    const { result } = renderHook(() =>
      useRepublicResidents(republics, "user@example.com"),
    );

    await waitFor(() => {
      expect(result.current.residentsCount).toEqual({
        "rep-1": 2,
        "rep-2": 1,
      });
    });

    expect(result.current.getResidentsCount("rep-1")).toBe(2);
    expect(result.current.getResidentsCount("inexistente")).toBe(0);
    expect(result.current.getUserRole("rep-1")).toBe(ResidentRole.ADMIN);
    expect(result.current.getUserRole("rep-2")).toBeNull();
    expect(result.current.isAdmin("rep-1")).toBe(true);
    expect(result.current.isAdmin("rep-2")).toBe(false);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockResidentService.getResidents).toHaveBeenCalledTimes(4);
  });

  it("usa fallback de contagem zero quando o serviço retorna residents indefinido", async () => {
    mockResidentService.getResidents.mockResolvedValue(undefined as never);

    const { result } = renderHook(() =>
      useRepublicResidents(republics.slice(0, 1), "user@example.com"),
    );

    await waitFor(() => {
      expect(result.current.residentsCount).toEqual({ "rep-1": 0 });
    });

    expect(result.current.getResidentsCount("rep-1")).toBe(0);
    expect(result.current.getUserRole("rep-1")).toBeNull();
  });

  it("zera os mapas quando não estiver autenticado ou não houver repúblicas", async () => {
    mockResidentService.getResidents.mockResolvedValue([
      {
        id: "resident-1",
        nome: "Admin",
        email: "user@example.com",
        fotoPerfil: null,
        chavePix: null,
        telefone: null,
        role: ResidentRole.ADMIN,
      },
    ] as never);

    const { result, rerender } = renderHook(
      ({ list }) => useRepublicResidents(list, "user@example.com"),
      {
        initialProps: { list: republics.slice(0, 1) },
      },
    );

    await waitFor(() => {
      expect(result.current.residentsCount).toEqual({ "rep-1": 1 });
    });

    mockUseAuth.mockReturnValue({ isAuthenticated: false } as never);

    rerender({ list: republics.slice(0, 1) });

    await waitFor(() => {
      expect(result.current.residentsCount).toEqual({});
    });

    expect(result.current.getUserRole("rep-1")).toBeNull();

    mockUseAuth.mockReturnValue({ isAuthenticated: true } as never);

    rerender({ list: [] });

    await waitFor(() => {
      expect(result.current.residentsCount).toEqual({});
    });
  });

  it("registra erro por república e usa fallback de count e role", async () => {
    const error = new Error("falha ao buscar");

    mockResidentService.getResidents.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useRepublicResidents(republics.slice(0, 1), "user@example.com"),
    );

    await waitFor(() => {
      expect(result.current.residentsCount).toEqual({ "rep-1": 0 });
    });
    expect(result.current.getUserRole("rep-1")).toBeNull();
    expect(result.current.isAdmin("rep-1")).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Residents",
      "Erro ao buscar moradores da república rep-1",
      error,
    );
  });

  it("usa undefined no logger quando o erro por república não for instância de Error", async () => {
    mockResidentService.getResidents.mockRejectedValue("falha em texto");

    const { result } = renderHook(() =>
      useRepublicResidents(republics.slice(0, 1), "user@example.com"),
    );

    await waitFor(() => {
      expect(result.current.residentsCount).toEqual({ "rep-1": 0 });
    });

    expect(result.current.getUserRole("rep-1")).toBeNull();
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Residents",
      "Erro ao buscar moradores da república rep-1",
      undefined,
    );
  });

  it("não tenta preencher roles no catch interno quando currentUserEmail não for informado", async () => {
    mockResidentService.getResidents.mockRejectedValue(new Error("falha sem email"));

    const { result } = renderHook(() =>
      useRepublicResidents(republics.slice(0, 1)),
    );

    await waitFor(() => {
      expect(result.current.residentsCount).toEqual({ "rep-1": 0 });
    });

    expect(result.current.getUserRole("rep-1")).toBeNull();
    expect(result.current.isAdmin("rep-1")).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Residents",
      "Erro ao buscar moradores da república rep-1",
      expect.any(Error),
    );
  });

  it("não preenche roles quando currentUserEmail não for informado", async () => {
    mockResidentService.getResidents.mockResolvedValue([
      {
        id: "resident-1",
        nome: "Admin",
        email: "user@example.com",
        fotoPerfil: null,
        chavePix: null,
        telefone: null,
        role: ResidentRole.ADMIN,
      },
    ] as never);

    const { result } = renderHook(() =>
      useRepublicResidents(republics.slice(0, 1)),
    );

    await waitFor(() => {
      expect(result.current.residentsCount).toEqual({ "rep-1": 1 });
    });
    expect(result.current.getUserRole("rep-1")).toBeNull();
    expect(result.current.isAdmin("rep-1")).toBe(false);
  });

  it("captura erro inesperado do carregamento externo", async () => {
    const error = new Error("falha externa");
    const promiseAllSpy = jest.spyOn(Promise, "all").mockRejectedValueOnce(error);
    const badRepublics = {
      length: 1,
      map: () => [],
    } as unknown as typeof republics;

    renderHook(() =>
      useRepublicResidents(badRepublics, "user@example.com"),
    );

    await waitFor(() => {
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Residents",
        "Erro inesperado ao carregar moradores",
        error,
      );
    });

    promiseAllSpy.mockRestore();
  });

  it("usa undefined no logger quando o erro externo não for instância de Error", async () => {
    const promiseAllSpy = jest
      .spyOn(Promise, "all")
      .mockRejectedValueOnce("falha externa");
    const badRepublics = {
      length: 1,
      map: () => [],
    } as unknown as typeof republics;

    renderHook(() => useRepublicResidents(badRepublics, "user@example.com"));

    await waitFor(() => {
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Residents",
        "Erro inesperado ao carregar moradores",
        undefined,
      );
    });

    promiseAllSpy.mockRestore();
  });
});
