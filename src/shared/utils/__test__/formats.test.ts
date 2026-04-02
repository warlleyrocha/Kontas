import { formatDate, formatIntWithDots, formatMounthYear } from "../formats";

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

  describe("formatIntWithDots", () => {
    it("insere pontos de milhar em números com 4+ dígitos", () => {
      expect(formatIntWithDots("1500")).toBe("1.500");
      expect(formatIntWithDots("1000000")).toBe("1.000.000");
    });

    it("não insere ponto em números com até 3 dígitos", () => {
      expect(formatIntWithDots("999")).toBe("999");
      expect(formatIntWithDots("1")).toBe("1");
    });
  });
});
