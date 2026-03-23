import { act, render, screen, fireEvent } from "@testing-library/react-native";
import { Image } from "react-native";
import { InviteModal } from "@/src/features/invites/components/InviteModal";
import { EditRepublicModal } from "@/src/features/republic/components/EditRepublicModal";
import EmptyRepublic from "@/src/features/user/components/CardsProfile/EmptyRepublic";
import IncompleteProfile from "@/src/features/user/components/CardsProfile/IncompleteProfile";
import RepublicList from "@/src/features/user/components/CardsProfile/RepublicList";
import { EditProfileModal } from "@/src/features/user/components/EditProfileModal";
import { RepublicContextMenu } from "@/src/features/user/components/RepublicContextMenu";
import { useProfileScreen } from "@/src/features/user/hooks/useProfileScreen";
import { MenuButton, SideMenu } from "@/src/shared/components/SideMenu";
import { maskPhone } from "@/src/shared/utils/inputMasks";
import { ProfileScreen } from "../ProfileScreen";

jest.mock("@/src/features/invites/components/InviteModal", () => ({
  InviteModal: jest.fn(() => null),
}));
jest.mock("@/src/features/republic/components/EditRepublicModal", () => ({
  EditRepublicModal: jest.fn(() => null),
}));
jest.mock(
  "@/src/features/user/components/CardsProfile/EmptyRepublic",
  () => jest.fn(() => null)
);
jest.mock(
  "@/src/features/user/components/CardsProfile/IncompleteProfile",
  () => jest.fn(() => null)
);
jest.mock(
  "@/src/features/user/components/CardsProfile/RepublicList",
  () => jest.fn(() => null)
);
jest.mock("@/src/features/user/components/EditProfileModal", () => ({
  EditProfileModal: jest.fn(() => null),
}));
jest.mock("@/src/features/user/components/RepublicContextMenu", () => ({
  RepublicContextMenu: jest.fn(() => null),
}));
jest.mock("@/src/features/user/hooks/useProfileScreen", () => ({
  useProfileScreen: jest.fn(),
}));
jest.mock("@/src/shared/components/SideMenu", () => ({
  MenuButton: jest.fn(() => null),
  SideMenu: jest.fn(() => null),
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));
jest.mock("@/src/shared/utils/inputMasks", () => ({
  maskPhone: jest.fn((v: string) => `(${v})`),
}));

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const mockSetIsMenuOpen = jest.fn();
const mockSetShowEditProfileModal = jest.fn();
const mockHandleSaveProfile = jest.fn();
const mockHandleCreateRepublic = jest.fn();
const mockHandleViewInvites = jest.fn();
const mockHandleSelectRepublic = jest.fn();
const mockHandleLongPressRepublic = jest.fn();
const mockHandleCloseContextMenu = jest.fn();
const mockHandleOpenEditFromMenu = jest.fn();
const mockHandleCloseEditModal = jest.fn();
const mockHandleSaveRepublicEdit = jest.fn();
const mockHandleDeleteFromMenu = jest.fn();
const mockHandleInviteFromMenu = jest.fn();
const mockHandleCloseInviteModal = jest.fn();
const mockIsAdmin = jest.fn().mockReturnValue(false);
const mockOnRefresh = jest.fn();
const mockSendInvite = jest.fn();
const mockGetResidentsCount = jest.fn();

const baseUser = {
  id: "u-1",
  nome: "Ana",
  email: "ana@email.com",
  perfilCompleto: true,
  chavePix: "ana@pix",
  telefone: "11999",
  fotoPerfil: null,
};

const baseSideMenuUser = {
  name: "Ana",
  email: "ana@email.com",
  photo: null,
  pixKey: "ana@pix",
  phone: "(11999)",
};

const baseRepublic = { id: "rep-1", nome: "Alpha" };

function makeHookReturn(overrides = {}) {
  return {
    user: baseUser,
    republics: [baseRepublic],
    getResidentsCount: mockGetResidentsCount,

    isMenuOpen: false,
    setIsMenuOpen: mockSetIsMenuOpen,
    showEditProfileModal: false,
    setShowEditProfileModal: mockSetShowEditProfileModal,
    showEditRepublicModal: false,
    refreshing: false,

    contextMenuVisible: false,
    contextMenuPosition: null,
    selectedRepublic: null,

    handleSaveProfile: mockHandleSaveProfile,
    handleCreateRepublic: mockHandleCreateRepublic,
    handleViewInvites: mockHandleViewInvites,
    handleSelectRepublic: mockHandleSelectRepublic,
    handleLongPressRepublic: mockHandleLongPressRepublic,
    handleCloseContextMenu: mockHandleCloseContextMenu,
    handleOpenEditFromMenu: mockHandleOpenEditFromMenu,
    handleCloseEditModal: mockHandleCloseEditModal,
    handleSaveRepublicEdit: mockHandleSaveRepublicEdit,
    handleDeleteFromMenu: mockHandleDeleteFromMenu,
    showInviteModal: false,
    handleInviteFromMenu: mockHandleInviteFromMenu,
    handleCloseInviteModal: mockHandleCloseInviteModal,
    isAdmin: mockIsAdmin,
    onRefresh: mockOnRefresh,

    menuItems: [],
    footerItems: [],
    sideMenuUser: baseSideMenuUser,
    sendInvite: mockSendInvite,
    sendLoading: false,
    sendError: null,
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useProfileScreen).mockReturnValue(makeHookReturn() as any);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── user nulo ────────────────────────────────────────────────────────────────

describe("ProfileScreen — user nulo", () => {
  it("não renderiza nada quando user é null", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ user: null }) as any
    );
    const { toJSON } = render(<ProfileScreen />);
    expect(toJSON()).toBeNull();
  });
});

// ─── Header ───────────────────────────────────────────────────────────────────

describe("ProfileScreen — Header", () => {
  it("exibe o nome do usuário no cabeçalho", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("Ana")).toBeTruthy();
  });

  it("exibe 'Sem nome' quando user.nome é null", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ user: { ...baseUser, nome: null } }) as any
    );
    render(<ProfileScreen />);
    expect(screen.getByText("Sem nome")).toBeTruthy();
  });

  it("exibe a inicial do nome quando fotoPerfil é null", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("exibe a inicial após erro de carregamento da foto de perfil", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ user: { ...baseUser, fotoPerfil: "https://foto.jpg" } }) as any
    );
    const { UNSAFE_getByType } = render(<ProfileScreen />);
    act(() => {
      UNSAFE_getByType(Image).props.onError();
    });
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("exibe '?' quando nome é null e não há foto", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ user: { ...baseUser, nome: null, fotoPerfil: null } }) as any
    );
    render(<ProfileScreen />);
    expect(screen.getByText("?")).toBeTruthy();
  });

  it("pressionar o nome chama setShowEditProfileModal(true)", () => {
    render(<ProfileScreen />);
    fireEvent.press(screen.getByText("Configurar perfil"));
    expect(mockSetShowEditProfileModal).toHaveBeenCalledWith(true);
  });

  it("accessibilityLabel do botão de perfil inclui o nome do usuário", () => {
    render(<ProfileScreen />);
    expect(
      screen.getByRole("button", { name: "Configurar perfil de Ana" })
    ).toBeTruthy();
  });

  it("accessibilityLabel usa 'usuário' quando nome é null", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ user: { ...baseUser, nome: null } }) as any
    );
    render(<ProfileScreen />);
    expect(
      screen.getByRole("button", { name: "Configurar perfil de usuário" })
    ).toBeTruthy();
  });

  it("MenuButton recebe onPress que chama setIsMenuOpen(true)", () => {
    render(<ProfileScreen />);
    const { onPress } = jest.mocked(MenuButton).mock.calls[0][0] as any;
    act(() => { onPress(); });
    expect(mockSetIsMenuOpen).toHaveBeenCalledWith(true);
  });

  it("MenuButton recebe hasNotification=false quando nenhum item tem badge", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ menuItems: [{ badge: 0 }, {}] }) as any
    );
    render(<ProfileScreen />);
    const { hasNotification } = jest.mocked(MenuButton).mock.calls[0][0] as any;
    expect(hasNotification).toBe(false);
  });

  it("MenuButton recebe hasNotification=true quando algum item tem badge > 0", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ menuItems: [{ badge: 3 }] }) as any
    );
    render(<ProfileScreen />);
    const { hasNotification } = jest.mocked(MenuButton).mock.calls[0][0] as any;
    expect(hasNotification).toBe(true);
  });
});

// ─── ProfileContent — IncompleteProfile ───────────────────────────────────────

describe("ProfileScreen — ProfileContent (perfil incompleto)", () => {
  beforeEach(() => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ user: { ...baseUser, perfilCompleto: false } }) as any
    );
  });

  it("renderiza IncompleteProfile quando perfilCompleto é false", () => {
    render(<ProfileScreen />);
    expect(jest.mocked(IncompleteProfile)).toHaveBeenCalled();
    expect(jest.mocked(EmptyRepublic)).not.toHaveBeenCalled();
    expect(jest.mocked(RepublicList)).not.toHaveBeenCalled();
  });

  it("onContinue do IncompleteProfile chama setShowEditProfileModal(true)", () => {
    render(<ProfileScreen />);
    const { onContinue } = jest.mocked(IncompleteProfile).mock.calls[0][0] as any;
    act(() => { onContinue(); });
    expect(mockSetShowEditProfileModal).toHaveBeenCalledWith(true);
  });
});

// ─── ProfileContent — EmptyRepublic ───────────────────────────────────────────

describe("ProfileScreen — ProfileContent (sem repúblicas)", () => {
  beforeEach(() => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ republics: [] }) as any
    );
  });

  it("renderiza EmptyRepublic quando perfil está completo e não há repúblicas", () => {
    render(<ProfileScreen />);
    expect(jest.mocked(EmptyRepublic)).toHaveBeenCalled();
    expect(jest.mocked(IncompleteProfile)).not.toHaveBeenCalled();
    expect(jest.mocked(RepublicList)).not.toHaveBeenCalled();
  });

  it("onCreateRepublic do EmptyRepublic chama handleCreateRepublic do hook", () => {
    render(<ProfileScreen />);
    const { onCreateRepublic } = jest.mocked(EmptyRepublic).mock.calls[0][0] as any;
    act(() => { onCreateRepublic(); });
    expect(mockHandleCreateRepublic).toHaveBeenCalled();
  });

  it("onViewInvites do EmptyRepublic chama handleViewInvites do hook", () => {
    render(<ProfileScreen />);
    const { onViewInvites } = jest.mocked(EmptyRepublic).mock.calls[0][0] as any;
    act(() => { onViewInvites(); });
    expect(mockHandleViewInvites).toHaveBeenCalled();
  });
});

// ─── ProfileContent — RepublicList ────────────────────────────────────────────

describe("ProfileScreen — ProfileContent (com repúblicas)", () => {
  it("renderiza RepublicList quando perfil está completo e há repúblicas", () => {
    render(<ProfileScreen />);
    expect(jest.mocked(RepublicList)).toHaveBeenCalled();
    expect(jest.mocked(IncompleteProfile)).not.toHaveBeenCalled();
    expect(jest.mocked(EmptyRepublic)).not.toHaveBeenCalled();
  });

  it("passa as repúblicas corretas para RepublicList", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(RepublicList).mock.calls[0][0] as any;
    expect(props.republics).toEqual([baseRepublic]);
  });

  it("passa getResidentsCount do hook para RepublicList", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(RepublicList).mock.calls[0][0] as any;
    expect(props.getResidentsCount).toBe(mockGetResidentsCount);
  });

  it("passa onSelectRepublic do hook para RepublicList", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(RepublicList).mock.calls[0][0] as any;
    expect(props.onSelectRepublic).toBe(mockHandleSelectRepublic);
  });

  it("passa onLongPressRepublic do hook para RepublicList", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(RepublicList).mock.calls[0][0] as any;
    expect(props.onLongPressRepublic).toBe(mockHandleLongPressRepublic);
  });

  it("passa onCreateRepublic do hook para RepublicList", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(RepublicList).mock.calls[0][0] as any;
    expect(props.onCreateRepublic).toBe(mockHandleCreateRepublic);
  });

  it("passa refreshing e onRefresh do hook para RepublicList", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ refreshing: true }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(RepublicList).mock.calls[0][0] as any;
    expect(props.refreshing).toBe(true);
    expect(props.onRefresh).toBe(mockOnRefresh);
  });
});

// ─── SideMenu ─────────────────────────────────────────────────────────────────

describe("ProfileScreen — SideMenu", () => {
  it("não renderiza SideMenu quando isMenuOpen é false", () => {
    render(<ProfileScreen />);
    expect(jest.mocked(SideMenu)).not.toHaveBeenCalled();
  });

  it("não renderiza SideMenu quando sideMenuUser é null", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ isMenuOpen: true, sideMenuUser: null }) as any
    );
    render(<ProfileScreen />);
    expect(jest.mocked(SideMenu)).not.toHaveBeenCalled();
  });

  it("renderiza SideMenu quando isMenuOpen é true e sideMenuUser está definido", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ isMenuOpen: true }) as any
    );
    render(<ProfileScreen />);
    expect(jest.mocked(SideMenu)).toHaveBeenCalled();
  });

  it("onRequestClose do SideMenu chama setIsMenuOpen(false)", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ isMenuOpen: true }) as any
    );
    render(<ProfileScreen />);
    const { onRequestClose } = jest.mocked(SideMenu).mock.calls[0][0] as any;
    act(() => { onRequestClose(); });
    expect(mockSetIsMenuOpen).toHaveBeenCalledWith(false);
  });

  it("passa menuItems e footerItems do hook ao SideMenu", () => {
    const menuItems = [{ label: "Item" }];
    const footerItems = [{ label: "Footer" }];
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ isMenuOpen: true, menuItems, footerItems }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(SideMenu).mock.calls[0][0] as any;
    expect(props.menuItems).toBe(menuItems);
    expect(props.footerItems).toBe(footerItems);
  });

  it("passa telefone formatado ao SideMenu via maskPhone", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ isMenuOpen: true }) as any
    );
    render(<ProfileScreen />);
    expect(jest.mocked(maskPhone)).toHaveBeenCalledWith("11999");
    const props = jest.mocked(SideMenu).mock.calls[0][0] as any;
    expect(props.user.phone).toBe("(11999)");
  });

  it("passa telefone vazio formatado ao SideMenu quando user.telefone é null", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({
        isMenuOpen: true,
        user: { ...baseUser, telefone: null },
      }) as any
    );
    render(<ProfileScreen />);
    expect(jest.mocked(maskPhone)).toHaveBeenCalledWith("");
    const props = jest.mocked(SideMenu).mock.calls[0][0] as any;
    expect(props.user.phone).toBe("()");
  });
});

// ─── EditProfileModal ─────────────────────────────────────────────────────────

describe("ProfileScreen — EditProfileModal", () => {
  it("passa visible=false quando showEditProfileModal é false", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(EditProfileModal).mock.calls[0][0] as any;
    expect(props.visible).toBe(false);
  });

  it("passa visible=true quando showEditProfileModal é true", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ showEditProfileModal: true }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(EditProfileModal).mock.calls[0][0] as any;
    expect(props.visible).toBe(true);
  });

  it("onClose chama setShowEditProfileModal(false)", () => {
    render(<ProfileScreen />);
    const { onClose } = jest.mocked(EditProfileModal).mock.calls[0][0] as any;
    act(() => { onClose(); });
    expect(mockSetShowEditProfileModal).toHaveBeenCalledWith(false);
  });

  it("passa currentName do usuário ao EditProfileModal", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(EditProfileModal).mock.calls[0][0] as any;
    expect(props.currentName).toBe("Ana");
  });

  it("passa 'Sem nome' quando nome é null", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ user: { ...baseUser, nome: null } }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(EditProfileModal).mock.calls[0][0] as any;
    expect(props.currentName).toBe("Sem nome");
  });

  it("passa currentPixKey do usuário ao EditProfileModal", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(EditProfileModal).mock.calls[0][0] as any;
    expect(props.currentPixKey).toBe("ana@pix");
  });

  it("passa currentPhone formatado ao EditProfileModal", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(EditProfileModal).mock.calls[0][0] as any;
    expect(props.currentPhone).toBe("(11999)");
  });

  it("passa currentPhone vazio formatado quando user.telefone é null", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ user: { ...baseUser, telefone: null } }) as any
    );
    render(<ProfileScreen />);
    expect(jest.mocked(maskPhone)).toHaveBeenCalledWith("");
    const props = jest.mocked(EditProfileModal).mock.calls[0][0] as any;
    expect(props.currentPhone).toBe("()");
  });

  it("passa onSave do hook ao EditProfileModal", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(EditProfileModal).mock.calls[0][0] as any;
    expect(props.onSave).toBe(mockHandleSaveProfile);
  });
});

// ─── EditRepublicModal ────────────────────────────────────────────────────────

describe("ProfileScreen — EditRepublicModal", () => {
  it("passa visible=false quando showEditRepublicModal é false", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    expect(props.visible).toBe(false);
  });

  it("passa visible=true quando showEditRepublicModal é true", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ showEditRepublicModal: true }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    expect(props.visible).toBe(true);
  });

  it("onClose chama handleCloseEditModal do hook", () => {
    render(<ProfileScreen />);
    const { onClose } = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    act(() => { onClose(); });
    expect(mockHandleCloseEditModal).toHaveBeenCalled();
  });

  it("passa currentName vazio quando selectedRepublic é null", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    expect(props.currentName).toBe("");
  });

  it("passa currentName da república selecionada", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ selectedRepublic: baseRepublic }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    expect(props.currentName).toBe("Alpha");
  });

  it("passa onSave do hook ao EditRepublicModal", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(EditRepublicModal).mock.calls[0][0] as any;
    expect(props.onSave).toBe(mockHandleSaveRepublicEdit);
  });
});

// ─── RepublicContextMenu ──────────────────────────────────────────────────────

describe("ProfileScreen — RepublicContextMenu", () => {
  it("passa visible=false quando contextMenuVisible é false", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(RepublicContextMenu).mock.calls[0][0] as any;
    expect(props.visible).toBe(false);
  });

  it("passa visible=true quando contextMenuVisible é true", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ contextMenuVisible: true }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(RepublicContextMenu).mock.calls[0][0] as any;
    expect(props.visible).toBe(true);
  });

  it("passa position do hook ao RepublicContextMenu", () => {
    const position = { x: 10, y: 20, width: 100, height: 50 };
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ contextMenuPosition: position }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(RepublicContextMenu).mock.calls[0][0] as any;
    expect(props.position).toBe(position);
  });

  it("onClose chama handleCloseContextMenu do hook", () => {
    render(<ProfileScreen />);
    const { onClose } = jest.mocked(RepublicContextMenu).mock.calls[0][0] as any;
    act(() => { onClose(); });
    expect(mockHandleCloseContextMenu).toHaveBeenCalled();
  });

  it("onEdit chama handleOpenEditFromMenu do hook", () => {
    render(<ProfileScreen />);
    const { onEdit } = jest.mocked(RepublicContextMenu).mock.calls[0][0] as any;
    act(() => { onEdit(); });
    expect(mockHandleOpenEditFromMenu).toHaveBeenCalled();
  });

  it("onDelete chama handleDeleteFromMenu do hook", () => {
    render(<ProfileScreen />);
    const { onDelete } = jest.mocked(RepublicContextMenu).mock.calls[0][0] as any;
    act(() => { onDelete(); });
    expect(mockHandleDeleteFromMenu).toHaveBeenCalled();
  });

  it("onInvite chama handleInviteFromMenu do hook", () => {
    render(<ProfileScreen />);
    const { onInvite } = jest.mocked(RepublicContextMenu).mock.calls[0][0] as any;
    act(() => { onInvite(); });
    expect(mockHandleInviteFromMenu).toHaveBeenCalled();
  });

  it("isAdmin é avaliado com o id da república selecionada", () => {
    mockIsAdmin.mockReturnValue(true);
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ selectedRepublic: baseRepublic }) as any
    );
    render(<ProfileScreen />);
    expect(mockIsAdmin).toHaveBeenCalledWith("rep-1");
    const props = jest.mocked(RepublicContextMenu).mock.calls[0][0] as any;
    expect(props.isAdmin).toBe(true);
  });

  it("isAdmin é avaliado com '' quando selectedRepublic é null", () => {
    render(<ProfileScreen />);
    expect(mockIsAdmin).toHaveBeenCalledWith("");
  });
});

// ─── InviteModal ──────────────────────────────────────────────────────────────

describe("ProfileScreen — InviteModal", () => {
  it("passa open=false quando showInviteModal é false", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(InviteModal).mock.calls[0][0] as any;
    expect(props.open).toBe(false);
  });

  it("passa open=true quando showInviteModal é true", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ showInviteModal: true }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(InviteModal).mock.calls[0][0] as any;
    expect(props.open).toBe(true);
  });

  it("onClose chama handleCloseInviteModal do hook", () => {
    render(<ProfileScreen />);
    const { onClose } = jest.mocked(InviteModal).mock.calls[0][0] as any;
    act(() => { onClose(); });
    expect(mockHandleCloseInviteModal).toHaveBeenCalled();
  });

  it("passa republicaId da república selecionada", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ selectedRepublic: baseRepublic }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(InviteModal).mock.calls[0][0] as any;
    expect(props.republicaId).toBe("rep-1");
  });

  it("passa republicaId vazio quando selectedRepublic é null", () => {
    render(<ProfileScreen />);
    const props = jest.mocked(InviteModal).mock.calls[0][0] as any;
    expect(props.republicaId).toBe("");
  });

  it("passa sendInvite, loading e error do hook ao InviteModal", () => {
    jest.mocked(useProfileScreen).mockReturnValue(
      makeHookReturn({ sendLoading: true, sendError: "Erro de envio" }) as any
    );
    render(<ProfileScreen />);
    const props = jest.mocked(InviteModal).mock.calls[0][0] as any;
    expect(props.sendInvite).toBe(mockSendInvite);
    expect(props.loading).toBe(true);
    expect(props.error).toBe("Erro de envio");
  });
});
