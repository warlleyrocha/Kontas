import { getInitials } from "../getInitials";

describe("getInitials", () => {
  it("retorna as duas primeiras iniciais em maiúsculo", () => {
    expect(getInitials("Warlley Rocha")).toBe("WR");
  });

  it("ignora espaços extras e limita a duas palavras", () => {
    expect(getInitials("  maria   clara  silva ")).toBe("MC");
  });

  it("retorna vazio quando o nome não tiver partes válidas", () => {
    expect(getInitials("   ")).toBe("");
  });

  it('usa o fallback "" quando uma parte não tiver inicial', () => {
    const filterSpy = jest
      .spyOn(Array.prototype, "filter")
      .mockImplementationOnce(() => ["", "Rocha"] as unknown as string[]);

    expect(getInitials("qualquer nome")).toBe("R");

    filterSpy.mockRestore();
  });
});
