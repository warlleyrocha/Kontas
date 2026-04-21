import { fireEvent, render, screen } from "@testing-library/react-native";
import { StatusInvite } from "../../types/invite.types";
import { InviteCard } from "../InviteCard";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("@/src/shared/utils/formats", () => ({
  formatDate: jest.fn((d: string) => `fmt:${d}`),
}));
jest.mock("@/src/features/invites/constants/inviteStatusStyles", () => ({
  getInviteStatusStyle: jest.fn(() => ({
    badgeColorClass: "bg-yellow-100",
    textColorClass: "text-yellow-800",
    iconColor: "#F59E0B",
    iconName: "time-outline",
    label: "Pendente",
  })),
}));

const mockInvite = {
  id: "inv-1",
  email: "user@email.com",
  republicaId: "rep-1",
  status: StatusInvite.PENDENTE,
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
  nomeMorador: "João Silva",
  imagemMorador: null,
  nomeAdmin: "Admin Teste",
  nomeRepublica: "República Alpha",
  imagemRepublica: null,
};

describe("InviteCard — variant received", () => {
  it("renderiza o nome da república", () => {
    render(
      <InviteCard
        invite={mockInvite}
        variant="received"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(screen.getByText("República Alpha")).toBeTruthy();
  });

  it("renderiza 'Convidado por' com nome do admin", () => {
    render(
      <InviteCard
        invite={mockInvite}
        variant="received"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(screen.getByText("Convidado por Admin Teste")).toBeTruthy();
  });

  it("renderiza a data de recebimento", () => {
    render(
      <InviteCard
        invite={mockInvite}
        variant="received"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(screen.getByText("Recebido em: fmt:2026-01-01")).toBeTruthy();
  });

  it("exibe botões de aceitar e recusar quando PENDENTE", () => {
    render(
      <InviteCard
        invite={mockInvite}
        variant="received"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(screen.getByLabelText("Aceitar convite de rep-1")).toBeTruthy();
    expect(screen.getByLabelText("Recusar convite de rep-1")).toBeTruthy();
  });

  it("chama onAccept ao pressionar aceitar", () => {
    const onAccept = jest.fn();
    render(
      <InviteCard
        invite={mockInvite}
        variant="received"
        onAccept={onAccept}
        onReject={jest.fn()}
      />
    );
    fireEvent.press(screen.getByLabelText("Aceitar convite de rep-1"));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("chama onReject ao pressionar recusar", () => {
    const onReject = jest.fn();
    render(
      <InviteCard
        invite={mockInvite}
        variant="received"
        onAccept={jest.fn()}
        onReject={onReject}
      />
    );
    fireEvent.press(screen.getByLabelText("Recusar convite de rep-1"));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it("não exibe botões quando status é ACEITO", () => {
    const inviteAceito = { ...mockInvite, status: StatusInvite.ACEITO };
    render(
      <InviteCard
        invite={inviteAceito}
        variant="received"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(screen.queryByLabelText("Aceitar convite de rep-1")).toBeNull();
    expect(screen.queryByLabelText("Recusar convite de rep-1")).toBeNull();
  });
});

describe("InviteCard — variant sent", () => {
  it("renderiza o nome do morador", () => {
    render(<InviteCard invite={mockInvite} variant="sent" />);
    expect(screen.getByText("João Silva")).toBeTruthy();
  });

  it("não renderiza 'Convidado por'", () => {
    render(<InviteCard invite={mockInvite} variant="sent" />);
    expect(screen.queryByText(/Convidado por/)).toBeNull();
  });

  it("renderiza a data de envio", () => {
    render(<InviteCard invite={mockInvite} variant="sent" />);
    expect(screen.getByText("Enviado em fmt:2026-01-01")).toBeTruthy();
  });

  it("não exibe botões de ação", () => {
    render(
      <InviteCard
        invite={mockInvite}
        variant="sent"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(screen.queryByLabelText("Aceitar convite")).toBeNull();
    expect(screen.queryByLabelText("Recusar convite")).toBeNull();
  });
});
