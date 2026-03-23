import { render, screen } from "@testing-library/react-native";
import { EmptyState } from "@/src/shared/components/EmptyState";
import { StatusInvite, type Invite } from "../../types/invite.types";
import { InvitesSentContent } from "../InvitesSentContent";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("@/src/shared/utils/formats", () => ({
  formatDate: jest.fn((d: string) => `fmt:${d}`),
}));
jest.mock("@/src/shared/components/EmptyState", () => ({
  EmptyState: jest.fn(() => null),
}));
jest.mock("../../constants/inviteStatusStyles", () => ({
  getInviteStatusStyle: jest.fn(() => ({
    badgeColorClass: "bg-yellow-100",
    textColorClass: "text-yellow-800",
    iconColor: "#F59E0B",
    iconName: "time-outline",
    label: "Pendente",
    badgeStyle: undefined,
  })),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeInvite(id: string): Invite {
  return {
    id,
    email: `${id}@email.com`,
    republicaId: "rep-1",
    status: StatusInvite.PENDENTE,
    criadoEm: "2026-01-01",
    atualizadoEm: "2026-01-01",
  };
}

const defaultProps = {
  error: null,
  invites: [] as Invite[],
  onRetry: jest.fn(),
  onEmptyStatePress: jest.fn(),
};

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── InvitesSentContent ───────────────────────────────────────────────────────

describe("InvitesSentContent — estado vazio", () => {
  it("exibe 'Nenhum convite enviado' quando não há convites", () => {
    render(<InvitesSentContent {...defaultProps} invites={[]} />);
    const props = jest.mocked(EmptyState).mock.calls[0][0] as any;
    expect(props.title).toBe("Nenhum convite enviado");
  });

  it("chama onEmptyStatePress ao pressionar o botão do estado vazio", () => {
    const onEmptyStatePress = jest.fn();
    render(
      <InvitesSentContent
        {...defaultProps}
        invites={[]}
        onEmptyStatePress={onEmptyStatePress}
      />
    );
    const { onPress } = jest.mocked(EmptyState).mock.calls[0][0] as any;
    onPress();
    expect(onEmptyStatePress).toHaveBeenCalledTimes(1);
  });
});

describe("InvitesSentContent — estado de erro", () => {
  it("exibe o título padrão de erro", () => {
    render(<InvitesSentContent {...defaultProps} error="Falha de rede" />);
    const props = jest.mocked(EmptyState).mock.calls[0][0] as any;
    expect(props.title).toBe("Não foi possível carregar os convites");
  });

  it("chama onRetry ao pressionar 'Tentar novamente'", () => {
    const onRetry = jest.fn();
    render(
      <InvitesSentContent {...defaultProps} error="Erro" onRetry={onRetry} />
    );
    const { onPress } = jest.mocked(EmptyState).mock.calls[0][0] as any;
    onPress();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("InvitesSentContent — lista de convites", () => {
  it("renderiza o email de cada convite", () => {
    const invites = [makeInvite("inv-1"), makeInvite("inv-2")];
    render(<InvitesSentContent {...defaultProps} invites={invites} />);
    expect(screen.getByText("inv-1@email.com")).toBeTruthy();
    expect(screen.getByText("inv-2@email.com")).toBeTruthy();
  });

  it("renderiza um InvitesCard por convite (status label visível)", () => {
    const invites = [makeInvite("inv-1"), makeInvite("inv-2")];
    render(<InvitesSentContent {...defaultProps} invites={invites} />);
    const labels = screen.getAllByText("Pendente");
    expect(labels).toHaveLength(2);
  });

  it("renderiza a data de envio de cada convite", () => {
    render(
      <InvitesSentContent {...defaultProps} invites={[makeInvite("inv-1")]} />
    );
    expect(screen.getByText("Enviado em fmt:2026-01-01")).toBeTruthy();
  });
});
