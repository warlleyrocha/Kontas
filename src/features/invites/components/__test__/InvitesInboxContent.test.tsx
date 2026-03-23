import { fireEvent, render, screen } from "@testing-library/react-native";
import { EmptyState } from "@/src/shared/components/EmptyState";
import { StatusInvite, type GetInvitesByUser } from "../../types/invite.types";
import { InvitesInboxContent } from "../InvitesInboxContent";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("@/src/shared/utils/formats", () => ({
  formatDate: jest.fn((d: string) => `fmt:${d}`),
}));
jest.mock("@/src/shared/components/EmptyState", () => ({
  EmptyState: jest.fn(() => null),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeInvite(id: string, republicaId = "rep-1"): GetInvitesByUser {
  return {
    id,
    email: `${id}@email.com`,
    republicaId,
    status: StatusInvite.PENDENTE,
    criadoEm: "2026-01-01",
    atualizadoEm: "2026-01-01",
  };
}

const defaultProps = {
  error: null,
  invites: [] as GetInvitesByUser[],
  onRetry: jest.fn(),
  onEmptyStatePress: jest.fn(),
  onAcceptInvite: jest.fn(),
  onRejectInvite: jest.fn(),
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

// ─── InvitesInboxContent ──────────────────────────────────────────────────────

describe("InvitesInboxContent — estado vazio", () => {
  it("exibe 'Nenhum convite pendente' quando não há convites", () => {
    render(<InvitesInboxContent {...defaultProps} invites={[]} />);
    const props = jest.mocked(EmptyState).mock.calls[0][0] as any;
    expect(props.title).toBe("Nenhum convite pendente");
  });

  it("chama onEmptyStatePress ao pressionar o botão do estado vazio", () => {
    const onEmptyStatePress = jest.fn();
    render(
      <InvitesInboxContent
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

describe("InvitesInboxContent — estado de erro", () => {
  it("exibe o título padrão de erro", () => {
    render(<InvitesInboxContent {...defaultProps} error="Falha de rede" />);
    const props = jest.mocked(EmptyState).mock.calls[0][0] as any;
    expect(props.title).toBe("Não foi possível carregar os convites");
  });

  it("chama onRetry ao pressionar 'Tentar novamente'", () => {
    const onRetry = jest.fn();
    render(
      <InvitesInboxContent {...defaultProps} error="Erro" onRetry={onRetry} />
    );
    const { onPress } = jest.mocked(EmptyState).mock.calls[0][0] as any;
    onPress();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("InvitesInboxContent — lista de convites", () => {
  it("renderiza um InviteCardMe para cada convite", () => {
    const invites = [makeInvite("inv-1"), makeInvite("inv-2")];
    render(<InvitesInboxContent {...defaultProps} invites={invites} />);
    expect(screen.getByText("inv-1")).toBeTruthy();
    expect(screen.getByText("inv-2")).toBeTruthy();
  });

  it("chama onAcceptInvite com inviteId e republicaId ao aceitar", () => {
    const onAcceptInvite = jest.fn();
    const invite = makeInvite("inv-1", "rep-42");
    render(
      <InvitesInboxContent
        {...defaultProps}
        invites={[invite]}
        onAcceptInvite={onAcceptInvite}
      />
    );
    fireEvent.press(screen.getByLabelText("Aceitar convite de rep-42"));
    expect(onAcceptInvite).toHaveBeenCalledWith("inv-1", "rep-42");
  });

  it("chama onRejectInvite com inviteId ao recusar", () => {
    const onRejectInvite = jest.fn();
    const invite = makeInvite("inv-1", "rep-42");
    render(
      <InvitesInboxContent
        {...defaultProps}
        invites={[invite]}
        onRejectInvite={onRejectInvite}
      />
    );
    fireEvent.press(screen.getByLabelText("Recusar convite de rep-42"));
    expect(onRejectInvite).toHaveBeenCalledWith("inv-1");
  });

  it("callbacks de múltiplos convites são independentes", () => {
    const onAcceptInvite = jest.fn();
    const invites = [
      makeInvite("inv-1", "rep-1"),
      makeInvite("inv-2", "rep-2"),
    ];
    render(
      <InvitesInboxContent
        {...defaultProps}
        invites={invites}
        onAcceptInvite={onAcceptInvite}
      />
    );
    fireEvent.press(screen.getByLabelText("Aceitar convite de rep-2"));
    expect(onAcceptInvite).toHaveBeenCalledWith("inv-2", "rep-2");
  });
});
