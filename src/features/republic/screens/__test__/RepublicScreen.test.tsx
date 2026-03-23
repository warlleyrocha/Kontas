import { act, render, screen } from "@testing-library/react-native";
import { AccountsTab } from "@/src/features/accounts";
import { useInvitesByRepublicQuery } from "@/src/features/invites/contexts/InvitesContext";
import { StatusInvite } from "@/src/features/invites/types/invite.types";
import { EditRepublicModal } from "@/src/features/republic/components/EditRepublicModal";
import { useRepublicScreen } from "@/src/features/republic/hooks/useRepublicScreen";
import { ResidentsTab } from "@/src/features/residents";
import { SideMenu } from "@/src/shared/components/SideMenu";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import Tabs from "@/src/shared/components/Tabs";
import { ResumeTab } from "@/src/shared/components/Tabs/Resume";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { RepublicHeader } from "../../components/RepublicHeader";
import { RepublicScreen } from "../RepublicScreen";

jest.mock(
  "@expo/vector-icons/MaterialCommunityIcons",
  () => "MaterialCommunityIcons"
);
jest.mock("@/src/features/accounts", () => ({
  AccountsTab: jest.fn(() => null),
}));
jest.mock("@/src/features/invites/contexts/InvitesContext", () => ({
  useInvitesByRepublicQuery: jest.fn(),
}));
jest.mock("@/src/features/republic/components/EditRepublicModal", () => ({
  EditRepublicModal: jest.fn(() => null),
}));
jest.mock("@/src/features/republic/hooks/useRepublicScreen", () => ({
  useRepublicScreen: jest.fn(),
}));
jest.mock("@/src/features/residents", () => ({
  ResidentsTab: jest.fn(() => null),
}));
jest.mock("@/src/shared/components/SideMenu", () => ({
  SideMenu: jest.fn(() => null),
}));
jest.mock("@/src/shared/components/SideMenu/useSideMenu", () => ({
  useSideMenu: jest.fn(),
}));
jest.mock("@/src/shared/components/Tabs", () => jest.fn(() => null));
jest.mock("@/src/shared/components/Tabs/Resume", () => ({
  ResumeTab: jest.fn(() => null),
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));
jest.mock("../../components/RepublicHeader", () => ({
  RepublicHeader: jest.fn(() => null),
}));

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const mockRepublic = { id: "rep-1", nome: "Alpha", imagemRepublica: "img.jpg" };
const mockResidents = [{ id: "r-1", nome: "Ana" }];

const mockSetIsMenuOpen = jest.fn();
const mockSetShowEditModal = jest.fn();
const mockSetTab = jest.fn();
const mockHandleSaveRepublic = jest.fn();
const mockHandleSignOut = jest.fn();
const mockHandleOpenMenu = jest.fn();

function makeScreenReturn(overrides = {}) {
  return {
    republic: mockRepublic,
    residents: mockResidents,
    residentsCount: 1,
    tab: "contas" as const,
    setTab: mockSetTab,
    isLoading: false,
    isMenuOpen: false,
    setIsMenuOpen: mockSetIsMenuOpen,
    showEditModal: false,
    setShowEditModal: mockSetShowEditModal,
    handleSaveRepublic: mockHandleSaveRepublic,
    handleSignOut: mockHandleSignOut,
    handleOpenMenu: mockHandleOpenMenu,
    userMenu: { name: "Ana", email: "ana@email.com" },
    currentUserRole: ResidentRole.USER,
    currentResidentId: "r-1",
    republics: [mockRepublic],
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRepublicScreen).mockReturnValue(makeScreenReturn() as any);
  jest.mocked(useInvitesByRepublicQuery).mockReturnValue({ data: [] } as any);
  jest
    .mocked(useSideMenu)
    .mockReturnValue({ menuItems: [], footerItems: [] } as any);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── loading ──────────────────────────────────────────────────────────────────

describe("RepublicScreen — loading", () => {
  it("exibe spinner e texto de carregamento quando isLoading é true", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ isLoading: true }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    expect(screen.getByText("Carregando república...")).toBeTruthy();
  });

  it("não renderiza RepublicHeader enquanto carrega", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ isLoading: true }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    expect(jest.mocked(RepublicHeader)).not.toHaveBeenCalled();
  });
});

// ─── república não encontrada ─────────────────────────────────────────────────

describe("RepublicScreen — república não encontrada", () => {
  it("exibe mensagem de não encontrada quando republic é null", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ republic: null }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    expect(screen.getByText("República não encontrada")).toBeTruthy();
  });

  it("não renderiza RepublicHeader quando republic é null", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ republic: null }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    expect(jest.mocked(RepublicHeader)).not.toHaveBeenCalled();
  });
});

// ─── RepublicHeader ───────────────────────────────────────────────────────────

describe("RepublicScreen — RepublicHeader", () => {
  it("passa a república e residentsCount ao RepublicHeader", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(RepublicHeader).mock.calls[0][0] as any;
    expect(props.republic).toBe(mockRepublic);
    expect(props.numberResidents).toBe(1);
  });

  it("onEdit abre o modal de edição", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const { onEdit } = jest.mocked(RepublicHeader).mock.calls[0][0] as any;
    act(() => {
      onEdit();
    });
    expect(mockSetShowEditModal).toHaveBeenCalledWith(true);
  });

  it("onMenuOpen chama handleOpenMenu", () => {
    mockHandleOpenMenu.mockResolvedValue(undefined);
    render(<RepublicScreen republicId="rep-1" />);
    const { onMenuOpen } = jest.mocked(RepublicHeader).mock.calls[0][0] as any;
    act(() => {
      onMenuOpen();
    });
    expect(mockHandleOpenMenu).toHaveBeenCalled();
  });

  it("hasNotification=false quando nenhum menuItem tem badge", () => {
    jest.mocked(useSideMenu).mockReturnValue({
      menuItems: [{ badge: 0 }, {}],
      footerItems: [],
    } as any);
    render(<RepublicScreen republicId="rep-1" />);
    const { hasNotification } = jest.mocked(RepublicHeader).mock
      .calls[0][0] as any;
    expect(hasNotification).toBe(false);
  });

  it("hasNotification=true quando algum menuItem tem badge > 0", () => {
    jest.mocked(useSideMenu).mockReturnValue({
      menuItems: [{ badge: 2 }],
      footerItems: [],
    } as any);
    render(<RepublicScreen republicId="rep-1" />);
    const { hasNotification } = jest.mocked(RepublicHeader).mock
      .calls[0][0] as any;
    expect(hasNotification).toBe(true);
  });
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────

describe("RepublicScreen — Tabs", () => {
  it("passa tab e setTab ao componente Tabs", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(Tabs).mock.calls[0][0] as any;
    expect(props.value).toBe("contas");
    expect(props.onChange).toBe(mockSetTab);
  });

  it("renderiza AccountsTab quando tab='contas'", () => {
    render(<RepublicScreen republicId="rep-1" />);
    expect(jest.mocked(AccountsTab)).toHaveBeenCalled();
    expect(jest.mocked(ResidentsTab)).not.toHaveBeenCalled();
    expect(jest.mocked(ResumeTab)).not.toHaveBeenCalled();
  });

  it("renderiza ResidentsTab quando tab='moradores'", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ tab: "moradores" }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    expect(jest.mocked(ResidentsTab)).toHaveBeenCalled();
    expect(jest.mocked(AccountsTab)).not.toHaveBeenCalled();
    expect(jest.mocked(ResumeTab)).not.toHaveBeenCalled();
  });

  it("renderiza ResumeTab quando tab='resumo'", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ tab: "resumo" }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    expect(jest.mocked(ResumeTab)).toHaveBeenCalled();
    expect(jest.mocked(AccountsTab)).not.toHaveBeenCalled();
    expect(jest.mocked(ResidentsTab)).not.toHaveBeenCalled();
  });
});

// ─── AccountsTab ──────────────────────────────────────────────────────────────

describe("RepublicScreen — AccountsTab", () => {
  it("passa republicId e currentResidentId ao AccountsTab", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(AccountsTab).mock.calls[0][0] as any;
    expect(props.republicId).toBe("rep-1");
    expect(props.currentResidentId).toBe("r-1");
  });

  it("isAdmin=true quando currentUserRole é ADMIN", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(
        makeScreenReturn({ currentUserRole: ResidentRole.ADMIN }) as any
      );
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(AccountsTab).mock.calls[0][0] as any;
    expect(props.isAdmin).toBe(true);
  });

  it("isAdmin=false quando currentUserRole é USER", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(AccountsTab).mock.calls[0][0] as any;
    expect(props.isAdmin).toBe(false);
  });

  it("onPendingPaymentsCountChange atualiza pendingPaymentsCount", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const { onPendingPaymentsCountChange } = jest.mocked(AccountsTab).mock
      .calls[0][0] as any;

    // primeira chamada — deve atualizar
    act(() => {
      onPendingPaymentsCountChange(5);
    });

    // segunda chamada com o mesmo valor — não deve recriar o objeto
    act(() => {
      onPendingPaymentsCountChange(5);
    });

    // chamada com valor diferente — deve atualizar
    act(() => {
      onPendingPaymentsCountChange(3);
    });
  });
});

// ─── ResidentsTab ─────────────────────────────────────────────────────────────

describe("RepublicScreen — ResidentsTab", () => {
  beforeEach(() => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ tab: "moradores" }) as any);
  });

  it("passa residents e republicId ao ResidentsTab", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(ResidentsTab).mock.calls[0][0] as any;
    expect(props.residents).toBe(mockResidents);
    expect(props.republicId).toBe("rep-1");
  });

  it("isAdmin=true quando currentUserRole é ADMIN", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(
        makeScreenReturn({
          tab: "moradores",
          currentUserRole: ResidentRole.ADMIN,
        }) as any
      );
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(ResidentsTab).mock.calls[0][0] as any;
    expect(props.isAdmin).toBe(true);
  });
});

// ─── ResumeTab ────────────────────────────────────────────────────────────────

describe("RepublicScreen — ResumeTab", () => {
  it("passa residents e republicId ao ResumeTab", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ tab: "resumo" }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(ResumeTab).mock.calls[0][0] as any;
    expect(props.residents).toBe(mockResidents);
    expect(props.republicId).toBe("rep-1");
  });
});

// ─── EditRepublicModal ────────────────────────────────────────────────────────

describe("RepublicScreen — EditRepublicModal", () => {
  it("passa visible=false quando showEditModal é false", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    expect(props.visible).toBe(false);
  });

  it("passa visible=true quando showEditModal é true", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ showEditModal: true }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    expect(props.visible).toBe(true);
  });

  it("onClose chama setShowEditModal(false)", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const { onClose } = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    act(() => {
      onClose();
    });
    expect(mockSetShowEditModal).toHaveBeenCalledWith(false);
  });

  it("passa currentName e currentImage da república", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    expect(props.currentName).toBe("Alpha");
    expect(props.currentImage).toBe("img.jpg");
  });

  it("passa onSave do hook ao EditRepublicModal", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    expect(props.onSave).toBe(mockHandleSaveRepublic);
  });
});

// ─── SideMenu ─────────────────────────────────────────────────────────────────

describe("RepublicScreen — SideMenu", () => {
  it("não renderiza SideMenu quando isMenuOpen é false", () => {
    render(<RepublicScreen republicId="rep-1" />);
    expect(jest.mocked(SideMenu)).not.toHaveBeenCalled();
  });

  it("renderiza SideMenu quando isMenuOpen é true", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ isMenuOpen: true }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    expect(jest.mocked(SideMenu)).toHaveBeenCalled();
  });

  it("onRequestClose chama setIsMenuOpen(false)", () => {
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ isMenuOpen: true }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    const { onRequestClose } = jest.mocked(SideMenu).mock.calls[0][0] as any;
    act(() => {
      onRequestClose();
    });
    expect(mockSetIsMenuOpen).toHaveBeenCalledWith(false);
  });

  it("passa userMenu, menuItems e footerItems ao SideMenu", () => {
    const menuItems = [{ label: "Item" }];
    const footerItems = [{ label: "Footer" }];
    jest.mocked(useSideMenu).mockReturnValue({ menuItems, footerItems } as any);
    jest
      .mocked(useRepublicScreen)
      .mockReturnValue(makeScreenReturn({ isMenuOpen: true }) as any);
    render(<RepublicScreen republicId="rep-1" />);
    const props = jest.mocked(SideMenu).mock.calls[0][0] as any;
    expect(props.menuItems).toBe(menuItems);
    expect(props.footerItems).toBe(footerItems);
    expect(props.user).toMatchObject({ name: "Ana" });
  });
});

// ─── pendingInvitesSentCount ──────────────────────────────────────────────────

describe("RepublicScreen — pendingInvitesSentCount", () => {
  it("conta apenas convites com status PENDENTE", () => {
    jest.mocked(useInvitesByRepublicQuery).mockReturnValue({
      data: [
        { status: StatusInvite.PENDENTE },
        { status: StatusInvite.ACEITO },
        { status: StatusInvite.PENDENTE },
        { status: StatusInvite.RECUSADO },
      ],
    } as any);
    render(<RepublicScreen republicId="rep-1" />);
    const call = jest.mocked(useSideMenu).mock.calls[0];
    const options = call[2] as any;
    expect(options.pendingInvitesSentCount).toBe(2);
  });

  it("retorna 0 quando data é undefined", () => {
    jest
      .mocked(useInvitesByRepublicQuery)
      .mockReturnValue({ data: undefined } as any);
    render(<RepublicScreen republicId="rep-1" />);
    const options = jest.mocked(useSideMenu).mock.calls[0][2] as any;
    expect(options.pendingInvitesSentCount).toBe(0);
  });
});

// ─── useSideMenu — opções passadas ───────────────────────────────────────────

describe("RepublicScreen — useSideMenu", () => {
  it("passa republicId, republics e currentUserRole ao useSideMenu", () => {
    render(<RepublicScreen republicId="rep-1" />);
    const [page, , options] = jest.mocked(useSideMenu).mock.calls[0] as any;
    expect(page).toBe("home");
    expect(options.republicId).toBe("rep-1");
    expect(options.republics).toEqual([mockRepublic]);
    expect(options.currentUserRole).toBe(ResidentRole.USER);
  });
});
