import { useQueries } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { ResidentRole } from "@/src/shared/types/resident.types";

import { useRepublicResidents } from "./useRepublicResidents";

jest.mock("@tanstack/react-query", () => ({
  useQueries: jest.fn(),
}));

jest.mock("@/src/features/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/src/features/residents/services/resident.service", () => ({
  residentService: { getResidents: jest.fn() },
}));

jest.mock("@/src/features/residents/hooks/resident.keys", () => ({
  residentKeys: { byRepublic: (id: string) => ["residents", "republic", id] },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const republics = [
  { id: "rep-1", nome: "Rep 1" },
  { id: "rep-2", nome: "Rep 2" },
];

const residentAdmin = {
  id: "r-1",
  nome: "Admin",
  email: "admin@example.com",
  fotoPerfil: null,
  chavePix: null,
  telefone: null,
  role: ResidentRole.ADMIN,
};

const residentUser = {
  id: "r-2",
  nome: "Morador",
  email: "user@example.com",
  fotoPerfil: null,
  chavePix: null,
  telefone: null,
  role: ResidentRole.USER,
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuth).mockReturnValue({
    user: { id: "u-1" },
    isAuthenticated: true,
  } as any);
  jest.mocked(useQueries).mockReturnValue({
    data: [],
    isLoading: false,
  });
});

// ─── useRepublicResidents ─────────────────────────────────────────────────────

describe("useRepublicResidents — estado inicial", () => {
  it("retorna mapas vazios quando useQueries retorna array vazio", () => {
    const { result } = renderHook(() =>
      useRepublicResidents([], "user@example.com"),
    );

    expect(result.current.residentsCount).toEqual({});
    expect(result.current.getResidentsCount("rep-1")).toBe(0);
    expect(result.current.getUserRole("rep-1")).toBeNull();
    expect(result.current.isAdmin("rep-1")).toBe(false);
  });
});

describe("useRepublicResidents — contagem e roles", () => {
  it("deriva residentsCount a partir dos dados das queries", () => {
    jest.mocked(useQueries).mockReturnValue({
      data: [[residentAdmin, residentUser], [residentUser]],
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useRepublicResidents(republics, "admin@example.com"),
    );

    expect(result.current.residentsCount).toEqual({
      "rep-1": 2,
      "rep-2": 1,
    });
  });

  it("retorna 0 para república cujos dados ainda não carregaram", () => {
    jest.mocked(useQueries).mockReturnValue({
      data: [[]],
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useRepublicResidents(republics.slice(0, 1), "user@example.com"),
    );

    expect(result.current.getResidentsCount("rep-1")).toBe(0);
  });

  it("identifica o papel do usuário atual em cada república", () => {
    jest.mocked(useQueries).mockReturnValue({
      data: [[residentAdmin, residentUser], [residentUser]],
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useRepublicResidents(republics, "admin@example.com"),
    );

    expect(result.current.getUserRole("rep-1")).toBe(ResidentRole.ADMIN);
    expect(result.current.getUserRole("rep-2")).toBeNull();
    expect(result.current.isAdmin("rep-1")).toBe(true);
    expect(result.current.isAdmin("rep-2")).toBe(false);
  });

  it("faz match de email case-insensitive", () => {
    jest.mocked(useQueries).mockReturnValue({
      data: [[{ ...residentAdmin, email: "ADMIN@EXAMPLE.COM" }]],
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useRepublicResidents(republics.slice(0, 1), "admin@example.com"),
    );

    expect(result.current.getUserRole("rep-1")).toBe(ResidentRole.ADMIN);
  });

  it("não preenche roles quando currentUserEmail não for informado", () => {
    jest.mocked(useQueries).mockReturnValue({
      data: [[residentAdmin]],
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useRepublicResidents(republics.slice(0, 1)),
    );

    expect(result.current.getResidentsCount("rep-1")).toBe(1);
    expect(result.current.getUserRole("rep-1")).toBeNull();
    expect(result.current.isAdmin("rep-1")).toBe(false);
  });
});

describe("useRepublicResidents — enabled", () => {
  it("passa enabled=false para as queries quando o hook estiver desabilitado", () => {
    let capturedOptions: any;
    jest.mocked(useQueries).mockImplementation((opts: any) => {
      capturedOptions = opts;
      return { data: [], isLoading: false };
    });

    renderHook(() =>
      useRepublicResidents(republics.slice(0, 1), "user@example.com", false),
    );

    expect(capturedOptions.queries[0].enabled).toBe(false);
  });

  it("passa enabled=false quando não estiver autenticado", () => {
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
    } as any);

    let capturedOptions: any;
    jest.mocked(useQueries).mockImplementation((opts: any) => {
      capturedOptions = opts;
      return { data: [], isLoading: false };
    });

    renderHook(() =>
      useRepublicResidents(republics.slice(0, 1), "user@example.com"),
    );

    expect(capturedOptions.queries[0].enabled).toBe(false);
  });
});

describe("useRepublicResidents — fallback de erro", () => {
  it("usa count=0 e role=null quando a query de uma república falha (data undefined)", () => {
    jest.mocked(useQueries).mockReturnValue({
      data: [[]],
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useRepublicResidents(republics.slice(0, 1), "user@example.com"),
    );

    expect(result.current.getResidentsCount("rep-1")).toBe(0);
    expect(result.current.getUserRole("rep-1")).toBeNull();
    expect(result.current.isAdmin("rep-1")).toBe(false);
  });
});
