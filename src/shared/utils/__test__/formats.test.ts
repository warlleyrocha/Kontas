import { formatDate, formatMounthYear } from "../formats";

describe("formats", () => {
  it("formata ano e mês abreviado", () => {
    expect(formatMounthYear("2026-03")).toBe("Mar/2026");
    expect(formatMounthYear("2026-12")).toBe("Dez/2026");
  });

  it("formata data usando locale pt-BR com dia e mês", () => {
    const toLocaleDateStringSpy = jest
      .spyOn(Date.prototype, "toLocaleDateString")
      .mockReturnValue("20 de mar.");

    expect(formatDate("2026-03-20")).toBe("20 de mar.");
    expect(toLocaleDateStringSpy).toHaveBeenCalledWith("pt-BR", {
      day: "2-digit",
      month: "short",
    });

    toLocaleDateStringSpy.mockRestore();
  });
});
