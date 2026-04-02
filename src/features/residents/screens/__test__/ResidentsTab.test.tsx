import { act, render, screen } from "@testing-library/react-native";
import { PlusButton } from "@/src/shared/components/PlusButton";
import { InviteModal } from "@/src/features/invites/components/InviteModal";
import { useSendInviteMutation } from "@/src/features/invites/hooks/useInvitesQueries";
import { ResidentCard } from "@/src/features/residents/components/ResidentCard";
import { useTabResidents } from "@/src/features/residents/hooks/useTabResidents";
import { getErrorMessage } from "@/src/services/httpError";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import {
  ResidentRole,
  type ResidentResponse,
} from "@/src/shared/types/resident.types";
import { ResidentsTab } from "../ResidentsTab";

jest.mock("@expo/vector-icons/Feather", () => "Feather");
jest.mock("@/src/features/invites/components/InviteModal", () => ({
  InviteModal: jest.fn(() => null),
}));
jest.mock("@/src/features/invites/hooks/useInvitesQueries", () => ({
  useSendInviteMutation: jest.fn(),
}));
jest.mock("@/src/features/residents/components/ResidentCard", () => ({
  ResidentCard: jest.fn(() => null),
}));
jest.mock("@/src/features/residents/hooks/useTabResidents", () => ({
  useTabResidents: jest.fn(),
}));
jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  useRefresh: jest.fn(),
}));
jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));
jest.mock("@/src/shared/components/PlusButton", () => ({
  PlusButton: jest.fn(() => null),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeResident(id: string, nome = "Morador"): ResidentResponse {
  return {
    id,
    nome,
    email: `${id}@email.com`,
    fotoPerfil: null,
    chavePix: null,
    telefone: null,
    role: ResidentRole.USER,
  };
}

const mockSendInvite = jest.fn();
const mockCopiarChavePix = jest.fn();
const mockOnRefresh = jest.fn();

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useSendInviteMutation).mockReturnValue({
    mutateAsync: mockSendInvite,
    isPending: false,
    error: null,
  } as any);
  jest
    .mocked(useTabResidents)
    .mockReturnValue({ copiarChavePix: mockCopiarChavePix });
  jest
    .mocked(useRefresh)
    .mockReturnValue({ refreshing: false, onRefresh: mockOnRefresh } as any);
  jest
    .mocked(getErrorMessage)
    .mockImplementation((error) =>
      error instanceof Error ? error.message : "Erro ao enviar convite."
    );
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── ResidentsTab ─────────────────────────────────────────────────────────────

describe("ResidentsTab — lista de moradores", () => {
  it("exibe estado vazio quando não há moradores", () => {
    render(<ResidentsTab residents={[]} republicId="rep-1" />);
    expect(screen.getByText("Nenhum morador cadastrado")).toBeTruthy();
  });

  it("renderiza um ResidentCard por morador", () => {
    const residents = [makeResident("r-1"), makeResident("r-2")];
    render(<ResidentsTab residents={residents} republicId="rep-1" />);
    expect(jest.mocked(ResidentCard)).toHaveBeenCalledTimes(2);
  });

  it("passa morador correto para cada ResidentCard", () => {
    const resident = makeResident("r-1", "Ana Silva");
    render(<ResidentsTab residents={[resident]} republicId="rep-1" />);
    const props = jest.mocked(ResidentCard).mock.calls[0][0] as any;
    expect(props.morador).toBe(resident);
  });

  it("passa copiarChavePix do hook para ResidentCard", () => {
    render(
      <ResidentsTab residents={[makeResident("r-1")]} republicId="rep-1" />
    );
    const props = jest.mocked(ResidentCard).mock.calls[0][0] as any;
    expect(props.onCopyPix).toBe(mockCopiarChavePix);
  });
});

describe("ResidentsTab — controle de admin", () => {
  it("renderiza PlusButton quando isAdmin=true", () => {
    render(<ResidentsTab residents={[]} republicId="rep-1" isAdmin={true} />);
    expect(jest.mocked(PlusButton)).toHaveBeenCalled();
  });

  it("não renderiza PlusButton quando isAdmin=false", () => {
    render(<ResidentsTab residents={[]} republicId="rep-1" isAdmin={false} />);
    expect(jest.mocked(PlusButton)).not.toHaveBeenCalled();
  });

  it("não renderiza PlusButton quando isAdmin não é passado", () => {
    render(<ResidentsTab residents={[]} republicId="rep-1" />);
    expect(jest.mocked(PlusButton)).not.toHaveBeenCalled();
  });
});

describe("ResidentsTab — modal de convite", () => {
  it("renderiza InviteModal com open=false inicialmente", () => {
    render(<ResidentsTab residents={[]} republicId="rep-1" isAdmin={true} />);
    const props = jest.mocked(InviteModal).mock.calls[0][0] as any;
    expect(props.open).toBe(false);
  });

  it("abre o modal ao pressionar PlusButton", () => {
    render(<ResidentsTab residents={[]} republicId="rep-1" isAdmin={true} />);
    const { onPress } = jest.mocked(PlusButton).mock.calls[0][0] as any;
    act(() => {
      onPress();
    });
    const lastProps = jest.mocked(InviteModal).mock.calls.at(-1)?.[0] as any;
    expect(lastProps.open).toBe(true);
  });

  it("fecha o modal ao chamar onClose do InviteModal", () => {
    render(<ResidentsTab residents={[]} republicId="rep-1" isAdmin={true} />);
    const { onPress } = jest.mocked(PlusButton).mock.calls[0][0] as any;
    act(() => {
      onPress();
    });
    const { onClose } = jest.mocked(InviteModal).mock.calls.at(-1)?.[0] as any;
    act(() => {
      onClose();
    });
    const lastProps = jest.mocked(InviteModal).mock.calls.at(-1)?.[0] as any;
    expect(lastProps.open).toBe(false);
  });

  it("passa republicaId correto ao InviteModal", () => {
    render(<ResidentsTab residents={[]} republicId="rep-42" />);
    const props = jest.mocked(InviteModal).mock.calls[0][0] as any;
    expect(props.republicaId).toBe("rep-42");
  });

  it("passa sendInvite, loading e error do contexto ao InviteModal", () => {
    jest.mocked(useSendInviteMutation).mockReturnValue({
      mutateAsync: mockSendInvite,
      isPending: true,
      error: new Error("Erro de envio"),
    } as any);
    render(<ResidentsTab residents={[]} republicId="rep-1" />);
    const props = jest.mocked(InviteModal).mock.calls[0][0] as any;
    expect(props.sendInvite).toBe(mockSendInvite);
    expect(props.loading).toBe(true);
    expect(props.error).toBe("Erro de envio");
  });
});
