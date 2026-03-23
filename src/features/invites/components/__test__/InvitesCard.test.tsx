import { render, screen } from "@testing-library/react-native";
import { getInviteStatusStyle } from "../../constants/inviteStatusStyles";
import { StatusInvite, type Invite } from "../../types/invite.types";
import { InvitesCard } from "../InvitesCard";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("@/src/shared/utils/formats", () => ({
  formatDate: jest.fn((d: string) => `fmt:${d}`),
}));
jest.mock("../../constants/inviteStatusStyles", () => ({
  getInviteStatusStyle: jest.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockStatusStyle = {
  badgeColorClass: "bg-yellow-100",
  textColorClass: "text-yellow-800",
  iconColor: "#F59E0B",
  iconName: "time-outline" as const,
  label: "Pendente",
  badgeStyle: undefined,
};

const mockInvite: Invite = {
  id: "inv-1",
  email: "user@email.com",
  republicaId: "rep-1",
  status: StatusInvite.PENDENTE,
  criadoEm: "2026-01-10",
  atualizadoEm: "2026-01-10",
};

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getInviteStatusStyle).mockReturnValue(mockStatusStyle);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── InvitesCard ──────────────────────────────────────────────────────────────

describe("InvitesCard — renderização", () => {
  it("renderiza o email do convite", () => {
    render(<InvitesCard invite={mockInvite} />);
    expect(screen.getByText("user@email.com")).toBeTruthy();
  });

  it("renderiza o label do status retornado por getInviteStatusStyle", () => {
    render(<InvitesCard invite={mockInvite} />);
    expect(screen.getByText("Pendente")).toBeTruthy();
  });

  it("chama getInviteStatusStyle com o status do convite", () => {
    render(<InvitesCard invite={mockInvite} />);
    expect(jest.mocked(getInviteStatusStyle)).toHaveBeenCalledWith(
      StatusInvite.PENDENTE
    );
  });

  it("renderiza a data de envio formatada", () => {
    render(<InvitesCard invite={mockInvite} />);
    expect(screen.getByText("Enviado em fmt:2026-01-10")).toBeTruthy();
  });
});

describe("InvitesCard — data de atualização", () => {
  it("não exibe 'Atualizado em' quando criadoEm === atualizadoEm", () => {
    render(<InvitesCard invite={mockInvite} />);
    expect(screen.queryByText(/Atualizado em/)).toBeNull();
  });

  it("exibe 'Atualizado em' quando atualizadoEm é diferente de criadoEm", () => {
    const invite: Invite = {
      ...mockInvite,
      atualizadoEm: "2026-02-20",
    };
    render(<InvitesCard invite={invite} />);
    expect(screen.getByText("Atualizado em fmt:2026-02-20")).toBeTruthy();
  });
});

describe("InvitesCard — status diferentes", () => {
  it("exibe 'Aceito' para status ACEITO", () => {
    jest.mocked(getInviteStatusStyle).mockReturnValue({
      ...mockStatusStyle,
      label: "Aceito",
    });
    render(
      <InvitesCard invite={{ ...mockInvite, status: StatusInvite.ACEITO }} />
    );
    expect(screen.getByText("Aceito")).toBeTruthy();
  });

  it("exibe 'Recusado' para status RECUSADO", () => {
    jest.mocked(getInviteStatusStyle).mockReturnValue({
      ...mockStatusStyle,
      label: "Recusado",
    });
    render(
      <InvitesCard invite={{ ...mockInvite, status: StatusInvite.RECUSADO }} />
    );
    expect(screen.getByText("Recusado")).toBeTruthy();
  });
});
