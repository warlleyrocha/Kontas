import { parseContaVencimento } from "../accountStatus.utils";

describe("accountStatus.utils", () => {
  it("retorna a data parseada quando vencimento é uma data válida com horário", () => {
    const vencimento = "2026-03-23T10:20:30.000Z";

    expect(parseContaVencimento(vencimento)).toEqual(new Date(vencimento));
  });

  it("retorna null quando vencimento é inválido", () => {
    expect(parseContaVencimento("data-invalida")).toBeNull();
  });
});
