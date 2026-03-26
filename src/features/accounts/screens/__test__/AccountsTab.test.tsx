import { act, fireEvent, render, screen } from "@testing-library/react-native";

import {
  AccountSection,
  PlusButton,
  AddAccountModal,
} from "@/src/features/accounts/components";
import { AccountContextMenu } from "@/src/features/accounts/components/AccountContextMenu";
import { useAccountsTab } from "@/src/features/accounts/hooks/useAccountsTab";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import { getMoradorStatusVisual } from "@/src/features/accounts/utils/accountStatus.utils";
import { ToastConfirm } from "@/src/shared/components/ui/toast-custom";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { showToast } from "@/src/shared/utils/showToast";

import { AccountsTab } from "../AccountsTab";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/src/features/accounts/components", () => ({
  AccountSection: jest.fn(() => null),
  PlusButton: jest.fn(() => null),
  AddAccountModal: jest.fn(() => null),
}));
jest.mock("@/src/features/accounts/components/AccountContextMenu", () => ({
  AccountContextMenu: jest.fn(() => null),
}));
jest.mock("@/src/features/accounts/hooks/useAccountsTab", () => ({
  useAccountsTab: jest.fn(),
}));
jest.mock("@/src/features/accounts/utils/accountStatus.utils", () => ({
  getMoradorStatusVisual: jest.fn(),
}));
jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  useRefresh: jest.fn(),
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));
const mockCopiarChavePix = jest.fn();
jest.mock("@/src/features/residents/hooks/useTabResidents", () => ({
  useTabResidents: () => ({ copiarChavePix: mockCopiarChavePix }),
}));
jest.mock("@/src/shared/utils/formats", () => ({
  formatMounthYear: jest.fn((v: string) => `Mês:${v}`),
}));
jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { error: jest.fn() },
}));
jest.mock("@/src/shared/components/ui/toast-custom", () => ({
  ToastConfirm: jest.fn(() => null),
}));

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const mockOpenAccountModal = jest.fn();
const mockCloseAccountModal = jest.fn();
const mockHandleSubmit = jest.fn();
const mockHandleDelete = jest.fn();
const mockHandlePatchAndRefresh = jest.fn();
const mockHandleToggleExpand = jest.fn();
const mockToggleOpenAccounts = jest.fn();
const mockTogglePaidAccounts = jest.fn();
const mockSetMesSelecionado = jest.fn();
const mockConfirmResidentPayment = jest.fn();
const mockOnRefresh = jest.fn();
const mockResident = {
  id: "user-1",
  nome: "Carlos",
  email: "carlos@email.com",
  fotoPerfil: null,
  chavePix: "carlos@pix",
  telefone: null,
  role: ResidentRole.USER,
};

function makeTabReturn(overrides = {}) {
  return {
    accountResidentsById: {},
    closeAccountModal: mockCloseAccountModal,
    confirmResidentPayment: mockConfirmResidentPayment,
    contasOrdenadas: { abertas: [], pagas: [] },
    error: null,
    errorResidentsById: {},
    expandedAccountId: null,
    handleDelete: mockHandleDelete,
    handlePatchAndRefresh: mockHandlePatchAndRefresh,
    handleSubmit: mockHandleSubmit,
    handleToggleExpand: mockHandleToggleExpand,
    hasNoAccounts: false,
    loading: false,
    loadingResidentsById: {},
    mesSelecionado: "todos",
    mesesDisponiveis: [],
    mostrarContasAbertas: true,
    mostrarContasPagas: true,
    openAccountModal: mockOpenAccountModal,
    setMesSelecionado: mockSetMesSelecionado,
    showAccountModal: false,
    toggleOpenAccounts: mockToggleOpenAccounts,
    togglePaidAccounts: mockTogglePaidAccounts,
    updatingResidentById: {},
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockCopiarChavePix.mockResolvedValue(true);
  jest.mocked(useAccountsTab).mockReturnValue(makeTabReturn() as any);
  jest.mocked(useRefresh).mockReturnValue({
    refreshing: false,
    onRefresh: mockOnRefresh,
  } as any);
  jest
    .mocked(getMoradorStatusVisual)
    .mockReturnValue(StatusPagamento.PAGO as any);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── loading ──────────────────────────────────────────────────────────────────

describe("AccountsTab — loading", () => {
  it("exibe texto de carregamento quando loading é true", () => {
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(makeTabReturn({ loading: true }) as any);
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(screen.getByText("Carregando contas...")).toBeTruthy();
  });

  it("não renderiza AccountSection enquanto carrega", () => {
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(makeTabReturn({ loading: true }) as any);
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(jest.mocked(AccountSection)).not.toHaveBeenCalled();
  });
});

// ─── error ────────────────────────────────────────────────────────────────────

describe("AccountsTab — error", () => {
  it("exibe mensagem de erro quando error está definido", () => {
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(
        makeTabReturn({ error: { message: "Falha de rede" } }) as any
      );
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(
      screen.getByText(/Erro ao carregar contas: Falha de rede/)
    ).toBeTruthy();
  });

  it("exibe aviso de nenhuma conta no estado de erro", () => {
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(makeTabReturn({ error: { message: "err" } }) as any);
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(screen.getByText(/Nenhuma conta cadastrada ainda/)).toBeTruthy();
  });

  it("não renderiza AccountSection quando há erro", () => {
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(makeTabReturn({ error: { message: "err" } }) as any);
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(jest.mocked(AccountSection)).not.toHaveBeenCalled();
  });
});

// ─── empty state (todos os meses) ─────────────────────────────────────────────

describe("AccountsTab — sem contas (mesSelecionado='todos')", () => {
  beforeEach(() => {
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(
        makeTabReturn({ hasNoAccounts: true, mesSelecionado: "todos" }) as any
      );
  });

  it("exibe mensagem de nenhuma conta cadastrada", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(screen.getByText(/Nenhuma conta cadastrada ainda/)).toBeTruthy();
  });

  it("pressionar o card vazio chama openAccountModal", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Adicionar nova conta" })
    );
    expect(mockOpenAccountModal).toHaveBeenCalled();
  });

  it("renderiza AddAccountModal quando showAccountModal é true", () => {
    jest.mocked(useAccountsTab).mockReturnValue(
      makeTabReturn({
        hasNoAccounts: true,
        mesSelecionado: "todos",
        showAccountModal: true,
      }) as any
    );
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(jest.mocked(AddAccountModal)).toHaveBeenCalled();
    const props = jest.mocked(AddAccountModal).mock.calls[0][0] as any;
    expect(props.visible).toBe(true);
    expect(props.republicId).toBe("rep-1");
    expect(props.onSubmit).toBe(mockHandleSubmit);
    expect(props.onClose).toBe(mockCloseAccountModal);
  });

  it("não renderiza AccountSection no empty state", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(jest.mocked(AccountSection)).not.toHaveBeenCalled();
  });
});

// ─── filtro de meses ──────────────────────────────────────────────────────────

describe("AccountsTab — filtro de meses", () => {
  it("exibe botão 'Todos' sempre", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(screen.getByText("Todos")).toBeTruthy();
  });

  it("pressionar 'Todos' chama setMesSelecionado('todos')", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Mostrar contas de todos os meses" })
    );
    expect(mockSetMesSelecionado).toHaveBeenCalledWith("todos");
  });

  it("renderiza um botão por mês disponível", () => {
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(
        makeTabReturn({ mesesDisponiveis: ["2024-01", "2024-02"] }) as any
      );
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(screen.getByText("Mês:2024-01")).toBeTruthy();
    expect(screen.getByText("Mês:2024-02")).toBeTruthy();
  });

  it("pressionar um mês chama setMesSelecionado com o mesAno", () => {
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(makeTabReturn({ mesesDisponiveis: ["2024-01"] }) as any);
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Mostrar contas de Mês:2024-01" })
    );
    expect(mockSetMesSelecionado).toHaveBeenCalledWith("2024-01");
  });

  it("exibe mensagem de nenhuma conta quando hasNoAccounts e mês específico selecionado", () => {
    jest.mocked(useAccountsTab).mockReturnValue(
      makeTabReturn({
        hasNoAccounts: true,
        mesSelecionado: "2024-01",
        mesesDisponiveis: ["2024-01"],
      }) as any
    );
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(
      screen.getByText(/Nenhuma conta encontrada para Mês:2024-01/)
    ).toBeTruthy();
    expect(jest.mocked(AccountSection)).not.toHaveBeenCalled();
  });
});

// ─── AccountSection ───────────────────────────────────────────────────────────

describe("AccountsTab — AccountSection", () => {
  it("renderiza duas AccountSections (abertas e pagas)", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(jest.mocked(AccountSection)).toHaveBeenCalledTimes(2);
  });

  it("primeira AccountSection recebe label 'Em Aberto' e contas abertas", () => {
    const abertas = [{ id: "a-1" }];
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(
        makeTabReturn({ contasOrdenadas: { abertas, pagas: [] } }) as any
      );
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const props = jest.mocked(AccountSection).mock.calls[0][0] as any;
    expect(props.label).toBe("Em Aberto");
    expect(props.contas).toBe(abertas);
  });

  it("segunda AccountSection recebe label 'Contas Pagas' e contas pagas", () => {
    const pagas = [{ id: "a-2" }];
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(
        makeTabReturn({ contasOrdenadas: { abertas: [], pagas } }) as any
      );
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const props = jest.mocked(AccountSection).mock.calls[1][0] as any;
    expect(props.label).toBe("Contas Pagas");
    expect(props.contas).toBe(pagas);
  });

  it("passa visivel, onToggle e expandedAccountId corretos à primeira AccountSection", () => {
    jest.mocked(useAccountsTab).mockReturnValue(
      makeTabReturn({
        mostrarContasAbertas: false,
        expandedAccountId: "a-1",
      }) as any
    );
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const props = jest.mocked(AccountSection).mock.calls[0][0] as any;
    expect(props.visivel).toBe(false);
    expect(props.onToggle).toBe(mockToggleOpenAccounts);
    expect(props.expandedAccountId).toBe("a-1");
  });

  it("passa currentResidentId ao AccountSection", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-99" residents={[]} />
    );
    const props = jest.mocked(AccountSection).mock.calls[0][0] as any;
    expect(props.currentResidentId).toBe("r-99");
  });

  it("passa onConfirmResidentPayment e onPatch ao AccountSection", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const props = jest.mocked(AccountSection).mock.calls[0][0] as any;
    expect(props.onConfirmResidentPayment).toBe(mockConfirmResidentPayment);
    expect(props.onPatch).toBe(mockHandlePatchAndRefresh);
  });

  it("onLongPress do AccountSection abre o context menu", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const { onLongPress } = jest.mocked(AccountSection).mock.calls[0][0] as any;
    const position = { x: 10, y: 20, width: 100, height: 50 };
    act(() => {
      onLongPress("a-1", position);
    });
    const ctxProps = jest
      .mocked(AccountContextMenu)
      .mock.calls.at(-1)?.[0] as any;
    expect(ctxProps.visible).toBe(true);
    expect(ctxProps.position).toEqual(position);
  });

  it("onCopyPix do AccountSection copia a chave PIX do responsável pela conta", async () => {
    render(
      <AccountsTab
        republicId="rep-1"
        currentResidentId="r-1"
        residents={[mockResident]}
      />
    );
    const { onCopyPix } = jest.mocked(AccountSection).mock.calls[0][0] as any;
    const conta = { criadoPorId: "user-1" };
    let copied = false;

    await act(async () => {
      copied = await onCopyPix(conta);
    });

    expect(copied).toBe(true);
    expect(mockCopiarChavePix).toHaveBeenCalledWith(mockResident);
  });

  it("onCopyPix do AccountSection retorna false quando não encontra o responsável", async () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const { onCopyPix } = jest.mocked(AccountSection).mock.calls[0][0] as any;
    const conta = { criadoPorId: "missing-user" };
    let copied = true;

    await act(async () => {
      copied = await onCopyPix(conta);
    });

    expect(copied).toBe(false);
    expect(mockCopiarChavePix).not.toHaveBeenCalled();
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível localizar o responsável pela conta."
    );
  });
});

// ─── PlusButton ─────────────────────────────────────────────────────────

describe("AccountsTab — PlusButton", () => {
  it("renderiza PlusButton na view principal", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(jest.mocked(PlusButton)).toHaveBeenCalled();
  });

  it("onPress do PlusButton chama openAccountModal", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const { onPress } = jest.mocked(PlusButton).mock.calls[0][0] as any;
    act(() => {
      onPress();
    });
    expect(mockOpenAccountModal).toHaveBeenCalled();
  });

  it("renderiza AddAccountModal quando showAccountModal é true na view principal", () => {
    jest
      .mocked(useAccountsTab)
      .mockReturnValue(makeTabReturn({ showAccountModal: true }) as any);
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(jest.mocked(AddAccountModal)).toHaveBeenCalled();
    const props = jest.mocked(AddAccountModal).mock.calls[0][0] as any;
    expect(props.visible).toBe(true);
    expect(props.republicId).toBe("rep-1");
    expect(props.onSubmit).toBe(mockHandleSubmit);
    expect(props.onClose).toBe(mockCloseAccountModal);
  });

  it("não renderiza AddAccountModal quando showAccountModal é false", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    expect(jest.mocked(AddAccountModal)).not.toHaveBeenCalled();
  });
});

// ─── AccountContextMenu ───────────────────────────────────────────────────────

describe("AccountsTab — AccountContextMenu", () => {
  it("passa visible=false inicialmente ao AccountContextMenu", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const props = jest.mocked(AccountContextMenu).mock.calls[0][0] as any;
    expect(props.visible).toBe(false);
  });

  it("passa isAdmin ao AccountContextMenu", () => {
    render(
      <AccountsTab
        republicId="rep-1"
        currentResidentId="r-1"
        residents={[]}
        isAdmin
      />
    );
    const props = jest.mocked(AccountContextMenu).mock.calls[0][0] as any;
    expect(props.isAdmin).toBe(true);
  });

  it("onClose do AccountContextMenu fecha o menu", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    // abre via long press
    const { onLongPress } = jest.mocked(AccountSection).mock.calls[0][0] as any;
    act(() => {
      onLongPress("a-1", { x: 0, y: 0, width: 0, height: 0 });
    });
    // fecha
    const { onClose } = jest
      .mocked(AccountContextMenu)
      .mock.calls.at(-1)?.[0] as any;
    act(() => {
      onClose();
    });
    const lastProps = jest
      .mocked(AccountContextMenu)
      .mock.calls.at(-1)?.[0] as any;
    expect(lastProps.visible).toBe(false);
  });

  it("onDelete fecha o menu e abre a confirmação de exclusão", () => {
    mockHandleDelete.mockResolvedValue(undefined);
    jest.mocked(useAccountsTab).mockReturnValue(
      makeTabReturn({
        contasOrdenadas: {
          abertas: [{ id: "a-42", descricao: "Água" }],
          pagas: [],
        },
      }) as any
    );
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const { onLongPress } = jest.mocked(AccountSection).mock.calls[0][0] as any;
    act(() => {
      onLongPress("a-42", { x: 0, y: 0, width: 0, height: 0 });
    });
    const { onDelete } = jest
      .mocked(AccountContextMenu)
      .mock.calls.at(-1)?.[0] as any;
    act(() => {
      onDelete();
    });
    expect(mockHandleDelete).not.toHaveBeenCalled();
    const toastProps = jest.mocked(ToastConfirm).mock.calls.at(-1)?.[0] as any;
    expect(toastProps.message).toBe("Água");
    const lastProps = jest
      .mocked(AccountContextMenu)
      .mock.calls.at(-1)?.[0] as any;
    expect(lastProps.visible).toBe(false);
  });

  it("onConfirm do ToastConfirm chama handleDelete com o accountId", () => {
    mockHandleDelete.mockResolvedValue(undefined);
    jest.mocked(useAccountsTab).mockReturnValue(
      makeTabReturn({
        contasOrdenadas: {
          abertas: [{ id: "a-42", descricao: "Água" }],
          pagas: [],
        },
      }) as any
    );
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const { onLongPress } = jest.mocked(AccountSection).mock.calls[0][0] as any;
    act(() => {
      onLongPress("a-42", { x: 0, y: 0, width: 0, height: 0 });
    });
    const { onDelete } = jest
      .mocked(AccountContextMenu)
      .mock.calls.at(-1)?.[0] as any;
    act(() => {
      onDelete();
    });
    const { onConfirm } = jest
      .mocked(ToastConfirm)
      .mock.calls.at(-1)?.[0] as any;
    act(() => {
      onConfirm();
    });
    expect(mockHandleDelete).toHaveBeenCalledWith("a-42");
  });

  it("onDelete não chama handleDelete quando accountId é null", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
    const { onDelete } = jest.mocked(AccountContextMenu).mock
      .calls[0][0] as any;
    act(() => {
      onDelete();
    });
    expect(mockHandleDelete).not.toHaveBeenCalled();
  });
});

// ─── pendingPaymentsCount / onPendingPaymentsCountChange ──────────────────────

describe("AccountsTab — pendingPaymentsCount", () => {
  it("chama onPendingPaymentsCountChange com a contagem de AGUARDANDO_CONFIRMACAO", () => {
    const mockOnPendingChange = jest.fn();
    jest
      .mocked(getMoradorStatusVisual)
      .mockReturnValueOnce(StatusPagamento.AGUARDANDO_CONFIRMACAO as any)
      .mockReturnValueOnce(StatusPagamento.PAGO as any)
      .mockReturnValueOnce(StatusPagamento.AGUARDANDO_CONFIRMACAO as any);

    jest.mocked(useAccountsTab).mockReturnValue(
      makeTabReturn({
        accountResidentsById: {
          "a-1": [{ id: "r-1" }, { id: "r-2" }],
          "a-2": [{ id: "r-3" }],
        },
      }) as any
    );

    render(
      <AccountsTab
        republicId="rep-1"
        currentResidentId="r-1"
        residents={[]}
        onPendingPaymentsCountChange={mockOnPendingChange}
      />
    );

    expect(mockOnPendingChange).toHaveBeenCalledWith(2);
  });

  it("chama onPendingPaymentsCountChange com 0 quando accountResidentsById está vazio", () => {
    const mockOnPendingChange = jest.fn();
    render(
      <AccountsTab
        republicId="rep-1"
        currentResidentId="r-1"
        residents={[]}
        onPendingPaymentsCountChange={mockOnPendingChange}
      />
    );
    expect(mockOnPendingChange).toHaveBeenCalledWith(0);
  });

  it("não lança erro quando onPendingPaymentsCountChange não é fornecido", () => {
    render(
      <AccountsTab republicId="rep-1" currentResidentId="r-1" residents={[]} />
    );
  });
});
