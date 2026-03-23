import { fireEvent, render, screen } from "@testing-library/react-native";
import InviteCardMe from "../InviteCardMe";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("@/src/shared/utils/formats", () => ({
  formatDate: jest.fn((d: string) => `fmt:${d}`),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockInvite = {
  id: "inv-1",
  email: "user@email.com",
  republicaId: "rep-1",
  status: "PENDENTE",
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
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

// ─── InviteCardMe ─────────────────────────────────────────────────────────────

describe("InviteCardMe — renderização", () => {
  it("renderiza o id do convite", () => {
    render(
      <InviteCardMe invite={mockInvite} onAccept={jest.fn()} onReject={jest.fn()} />
    );
    expect(screen.getByText("inv-1")).toBeTruthy();
  });

  it("renderiza 'Convidado por' com o republicaId", () => {
    render(
      <InviteCardMe invite={mockInvite} onAccept={jest.fn()} onReject={jest.fn()} />
    );
    expect(screen.getByText("Convidado por rep-1")).toBeTruthy();
  });

  it("renderiza a data formatada de criadoEm", () => {
    render(
      <InviteCardMe invite={mockInvite} onAccept={jest.fn()} onReject={jest.fn()} />
    );
    expect(screen.getByText("Recebido em: fmt:2026-01-01")).toBeTruthy();
  });
});

describe("InviteCardMe — status PENDENTE", () => {
  it("exibe o botão de aceitar", () => {
    render(
      <InviteCardMe invite={mockInvite} onAccept={jest.fn()} onReject={jest.fn()} />
    );
    expect(screen.getByLabelText("Aceitar convite de rep-1")).toBeTruthy();
  });

  it("exibe o botão de recusar", () => {
    render(
      <InviteCardMe invite={mockInvite} onAccept={jest.fn()} onReject={jest.fn()} />
    );
    expect(screen.getByLabelText("Recusar convite de rep-1")).toBeTruthy();
  });

  it("chama onAccept ao pressionar o botão de aceitar", () => {
    const onAccept = jest.fn();
    render(
      <InviteCardMe invite={mockInvite} onAccept={onAccept} onReject={jest.fn()} />
    );
    fireEvent.press(screen.getByLabelText("Aceitar convite de rep-1"));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("chama onReject ao pressionar o botão de recusar", () => {
    const onReject = jest.fn();
    render(
      <InviteCardMe invite={mockInvite} onAccept={jest.fn()} onReject={onReject} />
    );
    fireEvent.press(screen.getByLabelText("Recusar convite de rep-1"));
    expect(onReject).toHaveBeenCalledTimes(1);
  });
});

describe("InviteCardMe — status ACEITO", () => {
  const invite = { ...mockInvite, status: "ACEITO" };

  it("exibe o texto 'Aceito'", () => {
    render(<InviteCardMe invite={invite} onAccept={jest.fn()} onReject={jest.fn()} />);
    expect(screen.getByText("Aceito")).toBeTruthy();
  });

  it("não exibe botões de ação", () => {
    render(<InviteCardMe invite={invite} onAccept={jest.fn()} onReject={jest.fn()} />);
    expect(screen.queryByLabelText("Aceitar convite de rep-1")).toBeNull();
    expect(screen.queryByLabelText("Recusar convite de rep-1")).toBeNull();
  });
});

describe("InviteCardMe — status RECUSADO", () => {
  const invite = { ...mockInvite, status: "RECUSADO" };

  it("exibe o texto 'Recusado'", () => {
    render(<InviteCardMe invite={invite} onAccept={jest.fn()} onReject={jest.fn()} />);
    expect(screen.getByText("Recusado")).toBeTruthy();
  });

  it("não exibe botões de ação", () => {
    render(<InviteCardMe invite={invite} onAccept={jest.fn()} onReject={jest.fn()} />);
    expect(screen.queryByLabelText("Aceitar convite de rep-1")).toBeNull();
    expect(screen.queryByLabelText("Recusar convite de rep-1")).toBeNull();
  });
});
