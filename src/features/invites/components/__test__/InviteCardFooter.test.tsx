import { fireEvent, render, screen } from "@testing-library/react-native";
import { StatusInvite } from "../../types/invite.types";
import { InviteCardFooter } from "../InviteCardFooter";

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

describe("InviteCardFooter - received variant", () => {
  it("exibe botões de aceitar e recusar quando PENDENTE e recebido", () => {
    render(
      <InviteCardFooter
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
      <InviteCardFooter
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
      <InviteCardFooter
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
      <InviteCardFooter
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

describe("InviteCardFooter - sent variant", () => {
  it("exibe status pendente quando enviado e PENDENTE", () => {
    render(
      <InviteCardFooter
        invite={mockInvite}
        variant="sent"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(screen.getByText("Pendente")).toBeTruthy();
  });

  it("exibe status atualizado quando atualizadoEm != criadoEm", () => {
    const inviteAtualizado = { ...mockInvite, atualizadoEm: "2026-01-02" };
    render(
      <InviteCardFooter
        invite={inviteAtualizado}
        variant="sent"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(screen.getByText("Pendente em fmt:2026-01-02")).toBeTruthy();
  });

  it("não exibe nada quando status não é PENDENTE e datas são iguais", () => {
    const inviteNormal = { ...mockInvite, status: StatusInvite.ACEITO };
    render(
      <InviteCardFooter
        invite={inviteNormal}
        variant="sent"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(screen.getByText("")).toBeTruthy(); // Should render null
  });
});