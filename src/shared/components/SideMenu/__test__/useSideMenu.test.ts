import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { useSideMenu } from "../useSideMenu";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockHandleSignOut = jest.fn();

const republic1 = { id: "rep-1", nome: "Alpha", imagemRepublica: "img1.jpg" };
const republic2 = { id: "rep-2", nome: "Beta", imagemRepublica: undefined };

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── menuItems — context "profile" ───────────────────────────────────────────

describe('useSideMenu — context "profile"', () => {
  it("retorna apenas o item 'Meus Convites'", () => {
    const { result } = renderHook(() =>
      useSideMenu("profile", mockHandleSignOut)
    );
    expect(result.current.menuItems).toHaveLength(1);
    expect(result.current.menuItems[0].id).toBe("invites");
  });

  it("badge de 'Meus Convites' reflete pendingInvitesCount", () => {
    const { result } = renderHook(() =>
      useSideMenu("profile", mockHandleSignOut, { pendingInvitesCount: 3 })
    );
    expect(result.current.menuItems[0].badge).toBe(3);
  });

  it("onPress de 'Meus Convites' navega para /(userProfile)/invites", () => {
    const { result } = renderHook(() =>
      useSideMenu("profile", mockHandleSignOut)
    );
    act(() => { result.current.menuItems[0].onPress?.(); });
    expect(mockPush).toHaveBeenCalledWith("/(userProfile)/invites");
  });
});

// ─── menuItems — context "home" / USER ───────────────────────────────────────

describe('useSideMenu — context "home" / USER', () => {
  function renderHome(overrides = {}) {
    return renderHook(() =>
      useSideMenu("home", mockHandleSignOut, {
        republicId: "rep-1",
        currentUserRole: ResidentRole.USER,
        republics: [republic1],
        ...overrides,
      })
    );
  }

  it("retorna 3 itens: profile, switchRepublic, invitesSent", () => {
    const { result } = renderHome();
    expect(result.current.menuItems).toHaveLength(3);
    expect(result.current.menuItems.map((i) => i.id)).toEqual([
      "profile",
      "switchRepublic",
      "invitesSent",
    ]);
  });

  it("não inclui item de pagamentos para USER", () => {
    const { result } = renderHome();
    expect(result.current.menuItems.find((i) => i.id === "payment")).toBeUndefined();
  });

  it("badge de 'Convites Enviados' reflete pendingInvitesSentCount", () => {
    const { result } = renderHome({ pendingInvitesSentCount: 7 });
    const item = result.current.menuItems.find((i) => i.id === "invitesSent")!;
    expect(item.badge).toBe(7);
  });

  it("onPress de 'Meu Perfil' navega para /(userProfile)/profile", () => {
    const { result } = renderHome();
    const item = result.current.menuItems.find((i) => i.id === "profile")!;
    act(() => { item.onPress?.(); });
    expect(mockPush).toHaveBeenCalledWith("/(userProfile)/profile");
  });

  it("onPress de 'Convites Enviados' navega para /(republics)/[id]/invites-sent", () => {
    const { result } = renderHome();
    const item = result.current.menuItems.find((i) => i.id === "invitesSent")!;
    act(() => { item.onPress?.(); });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(republics)/[id]/invites-sent",
      params: { id: "rep-1" },
    });
  });

  it("onPress de 'Convites Enviados' é no-op quando republicId é undefined", () => {
    const { result } = renderHook(() =>
      useSideMenu("home", mockHandleSignOut, {
        currentUserRole: ResidentRole.USER,
      })
    );
    const item = result.current.menuItems.find((i) => i.id === "invitesSent")!;
    act(() => { item.onPress?.(); });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ─── menuItems — context "home" / ADMIN ──────────────────────────────────────

describe('useSideMenu — context "home" / ADMIN', () => {
  function renderHome(overrides = {}) {
    return renderHook(() =>
      useSideMenu("home", mockHandleSignOut, {
        republicId: "rep-1",
        currentUserRole: ResidentRole.ADMIN,
        republics: [republic1],
        ...overrides,
      })
    );
  }

  it("retorna 4 itens: profile, switchRepublic, invitesSent, payment", () => {
    const { result } = renderHome();
    expect(result.current.menuItems).toHaveLength(4);
    expect(result.current.menuItems.map((i) => i.id)).toEqual([
      "profile",
      "switchRepublic",
      "invitesSent",
      "payment",
    ]);
  });

  it("badge de 'Pagamentos' reflete pendingPaymentsCount", () => {
    const { result } = renderHome({ pendingPaymentsCount: 4 });
    const item = result.current.menuItems.find((i) => i.id === "payment")!;
    expect(item.badge).toBe(4);
  });

  it("onPress de 'Pagamentos' navega para /(republics)/[id]/payments", () => {
    const { result } = renderHome();
    const item = result.current.menuItems.find((i) => i.id === "payment")!;
    act(() => { item.onPress?.(); });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(republics)/[id]/payments",
      params: { id: "rep-1" },
    });
  });

  it("onPress de 'Pagamentos' é no-op quando republicId é undefined", () => {
    const { result } = renderHook(() =>
      useSideMenu("home", mockHandleSignOut, {
        currentUserRole: ResidentRole.ADMIN,
      })
    );
    const item = result.current.menuItems.find((i) => i.id === "payment")!;
    act(() => { item.onPress?.(); });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ─── menuItems — context desconhecido ────────────────────────────────────────

describe("useSideMenu — context desconhecido", () => {
  it("retorna lista vazia para context não mapeado", () => {
    const { result } = renderHook(() =>
      useSideMenu("unknown" as any, mockHandleSignOut)
    );
    expect(result.current.menuItems).toHaveLength(0);
  });
});

// ─── republicMenuItems (switchRepublic.children) ──────────────────────────────

describe("useSideMenu — republicMenuItems", () => {
  it("gera um filho por república com id, label e image corretos", () => {
    const { result } = renderHook(() =>
      useSideMenu("home", mockHandleSignOut, {
        republicId: "rep-1",
        currentUserRole: ResidentRole.ADMIN,
        republics: [republic1, republic2],
      })
    );
    const children = result.current.menuItems.find(
      (i) => i.id === "switchRepublic"
    )!.children!;

    expect(children).toHaveLength(2);
    expect(children[0]).toMatchObject({
      id: "republic-rep-1",
      label: "Alpha",
      image: "img1.jpg",
      active: true,
    });
    expect(children[1]).toMatchObject({
      id: "republic-rep-2",
      label: "Beta",
      active: false,
    });
  });

  it("active=true apenas para a república atual", () => {
    const { result } = renderHook(() =>
      useSideMenu("home", mockHandleSignOut, {
        republicId: "rep-2",
        currentUserRole: ResidentRole.ADMIN,
        republics: [republic1, republic2],
      })
    );
    const children = result.current.menuItems.find(
      (i) => i.id === "switchRepublic"
    )!.children!;
    expect(children[0].active).toBe(false);
    expect(children[1].active).toBe(true);
  });

  it("onPress navega para a república selecionada", () => {
    const { result } = renderHook(() =>
      useSideMenu("home", mockHandleSignOut, {
        republicId: "rep-1",
        currentUserRole: ResidentRole.ADMIN,
        republics: [republic1, republic2],
      })
    );
    const children = result.current.menuItems.find(
      (i) => i.id === "switchRepublic"
    )!.children!;
    act(() => { children[1].onPress(); });
    expect(mockPush).toHaveBeenCalledWith("/(republics)/rep-2");
  });

  it("onPress é no-op quando a república clicada já é a atual", () => {
    const { result } = renderHook(() =>
      useSideMenu("home", mockHandleSignOut, {
        republicId: "rep-1",
        currentUserRole: ResidentRole.ADMIN,
        republics: [republic1],
      })
    );
    const children = result.current.menuItems.find(
      (i) => i.id === "switchRepublic"
    )!.children!;
    act(() => { children[0].onPress(); });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("children é lista vazia quando republics não fornecido", () => {
    const { result } = renderHook(() =>
      useSideMenu("home", mockHandleSignOut, {
        currentUserRole: ResidentRole.ADMIN,
      })
    );
    const children = result.current.menuItems.find(
      (i) => i.id === "switchRepublic"
    )!.children!;
    expect(children).toHaveLength(0);
  });
});

// ─── footerItems ──────────────────────────────────────────────────────────────

describe("useSideMenu — footerItems", () => {
  it("retorna 3 itens: termsOfUse, privacyPolicy, logout", () => {
    const { result } = renderHook(() =>
      useSideMenu("profile", mockHandleSignOut)
    );
    expect(result.current.footerItems.map((i) => i.id)).toEqual([
      "termsOfUse",
      "privacyPolicy",
      "logout",
    ]);
  });

  it("onPress de 'Termos de Uso' navega para /terms-of-use", () => {
    const { result } = renderHook(() =>
      useSideMenu("profile", mockHandleSignOut)
    );
    const item = result.current.footerItems.find((i) => i.id === "termsOfUse")!;
    act(() => { item.onPress?.(); });
    expect(mockPush).toHaveBeenCalledWith("/terms-of-use");
  });

  it("onPress de 'Política de Privacidade' navega para /privacy-policy", () => {
    const { result } = renderHook(() =>
      useSideMenu("profile", mockHandleSignOut)
    );
    const item = result.current.footerItems.find((i) => i.id === "privacyPolicy")!;
    act(() => { item.onPress?.(); });
    expect(mockPush).toHaveBeenCalledWith("/privacy-policy");
  });

  it("onPress de 'Sair' chama handleSignOut", () => {
    const { result } = renderHook(() =>
      useSideMenu("profile", mockHandleSignOut)
    );
    const item = result.current.footerItems.find((i) => i.id === "logout")!;
    act(() => { item.onPress?.(); });
    expect(mockHandleSignOut).toHaveBeenCalled();
  });

  it("item 'Sair' tem danger=true", () => {
    const { result } = renderHook(() =>
      useSideMenu("profile", mockHandleSignOut)
    );
    const item = result.current.footerItems.find((i) => i.id === "logout")!;
    expect(item.danger).toBe(true);
  });
});
