import { StatusInvite } from "@/src/features/invites/types/invite.types";
import {
  INVITE_STATUS_STYLES,
  getInviteStatusStyle,
} from "../inviteStatusStyles";

// ─── INVITE_STATUS_STYLES ─────────────────────────────────────────────────────

describe("INVITE_STATUS_STYLES", () => {
  it("contém entradas para todos os status do enum StatusInvite", () => {
    Object.values(StatusInvite).forEach((status) => {
      expect(INVITE_STATUS_STYLES).toHaveProperty(status);
    });
  });

  it("PENDENTE tem as propriedades de estilo corretas", () => {
    const style = INVITE_STATUS_STYLES[StatusInvite.PENDENTE];
    expect(style.badgeColorClass).toBe("bg-yellow-100");
    expect(style.textColorClass).toBe("text-yellow-800");
    expect(style.iconColor).toBe("#F59E0B");
    expect(style.iconName).toBe("time-outline");
    expect(style.label).toBe("Pendente");
  });

  it("PENDENTE possui badgeStyle com sombra configurada", () => {
    const style = INVITE_STATUS_STYLES[StatusInvite.PENDENTE];
    expect(style.badgeStyle).toBeDefined();
    expect(style.badgeStyle?.shadowColor).toBe("#F59E0B");
    expect(style.badgeStyle?.elevation).toBe(2);
    expect(style.badgeStyle?.shadowOpacity).toBeGreaterThan(0);
  });

  it("ACEITO tem as propriedades de estilo corretas", () => {
    const style = INVITE_STATUS_STYLES[StatusInvite.ACEITO];
    expect(style.badgeColorClass).toBe("bg-green-100");
    expect(style.textColorClass).toBe("text-green-800");
    expect(style.iconColor).toBe("#10B981");
    expect(style.iconName).toBe("checkmark-circle-outline");
    expect(style.label).toBe("Aceito");
    expect(style.badgeStyle).toBeUndefined();
  });

  it("RECUSADO tem as propriedades de estilo corretas", () => {
    const style = INVITE_STATUS_STYLES[StatusInvite.RECUSADO];
    expect(style.badgeColorClass).toBe("bg-red-100");
    expect(style.textColorClass).toBe("text-red-800");
    expect(style.iconColor).toBe("#EF4444");
    expect(style.iconName).toBe("close-circle-outline");
    expect(style.label).toBe("Recusado");
    expect(style.badgeStyle).toBeUndefined();
  });
});

// ─── getInviteStatusStyle ─────────────────────────────────────────────────────

describe("getInviteStatusStyle", () => {
  it("retorna o estilo de PENDENTE para 'PENDENTE'", () => {
    expect(getInviteStatusStyle("PENDENTE")).toBe(
      INVITE_STATUS_STYLES[StatusInvite.PENDENTE]
    );
  });

  it("retorna o estilo de ACEITO para 'ACEITO'", () => {
    expect(getInviteStatusStyle("ACEITO")).toBe(
      INVITE_STATUS_STYLES[StatusInvite.ACEITO]
    );
  });

  it("retorna o estilo de RECUSADO para 'RECUSADO'", () => {
    expect(getInviteStatusStyle("RECUSADO")).toBe(
      INVITE_STATUS_STYLES[StatusInvite.RECUSADO]
    );
  });

  it("é case-insensitive (aceita 'pendente' em minúsculas)", () => {
    expect(getInviteStatusStyle("pendente")).toBe(
      INVITE_STATUS_STYLES[StatusInvite.PENDENTE]
    );
  });

  it("é case-insensitive (aceita 'Aceito' com capitalização mista)", () => {
    expect(getInviteStatusStyle("Aceito")).toBe(
      INVITE_STATUS_STYLES[StatusInvite.ACEITO]
    );
  });

  it("retorna estilo padrão para status desconhecido", () => {
    const style = getInviteStatusStyle("INVALIDO");
    expect(style.badgeColorClass).toBe("bg-gray-100");
    expect(style.textColorClass).toBe("text-gray-800");
    expect(style.iconColor).toBe("#6B7280");
    expect(style.iconName).toBe("help-circle-outline");
    expect(style.label).toBe("Desconhecido");
  });

  it("retorna estilo padrão para string vazia", () => {
    const style = getInviteStatusStyle("");
    expect(style.label).toBe("Desconhecido");
  });
});
