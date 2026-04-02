import {
  maskPhone,
  maskPhoneWrite,
  formatCurrencyBRL,
  maskCurrencyBRL,
  unmaskCurrencyBRL,
} from "../inputMasks";

describe("inputMasks", () => {
  describe("maskPhone", () => {
    it("aplica a máscara de telefone fixo", () => {
      expect(maskPhone("1198765432")).toBe("(11) 9876-5432");
    });

    it("aplica a máscara de celular", () => {
      expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
    });

    it("remove hífen sobrando quando faltam dígitos", () => {
      expect(maskPhone("119876")).toBe("(11) 9876");
    });

    it('avalia o fallback de endsWith(" ") na condição da linha 17', () => {
      const originalEndsWith = String.prototype.endsWith;
      let spaceChecks = 0;
      const endsWithSpy = jest
        .spyOn(String.prototype, "endsWith")
        .mockImplementation(function (
          this: string,
          searchString: string,
          endPosition?: number
        ) {
          if (searchString === "-") {
            return undefined as unknown as boolean;
          }

          if (searchString === " ") {
            spaceChecks += 1;
            return (spaceChecks === 1) as boolean;
          }

          return originalEndsWith.call(this, searchString, endPosition);
        });

      expect(maskPhone("119876")).toBe("(11) 9876");
      expect(endsWithSpy).toHaveBeenCalledWith("-");
      expect(endsWithSpy).toHaveBeenCalledWith(" ");

      endsWithSpy.mockRestore();
    });
  });

  describe("maskPhoneWrite", () => {
    it("retorna vazio quando não houver dígitos", () => {
      expect(maskPhoneWrite("abc")).toBe("");
    });

    it("retorna o início do DDD quando houver até dois dígitos", () => {
      expect(maskPhoneWrite("1")).toBe("(1");
      expect(maskPhoneWrite("11")).toBe("(11");
    });

    it("retorna o telefone parcial quando o restante tiver até quatro dígitos", () => {
      expect(maskPhoneWrite("119")).toBe("(11) 9");
      expect(maskPhoneWrite("119876")).toBe("(11) 9876");
    });

    it("aplica a máscara de telefone fixo com até dez dígitos", () => {
      expect(maskPhoneWrite("1198765432")).toBe("(11) 9876-5432");
    });

    it("aplica a máscara de celular com onze dígitos e ignora excesso", () => {
      expect(maskPhoneWrite("11 98765-43210")).toBe("(11) 98765-4321");
    });
  });

  describe("formatCurrencyBRL", () => {
    it("formata centavos para o padrão BRL", () => {
      expect(formatCurrencyBRL(150099)).toBe("R$\u00a01.500,99");
    });

    it("formata zero centavos", () => {
      expect(formatCurrencyBRL(0)).toBe("R$\u00a00,00");
    });

    it("formata valores menores que um real", () => {
      expect(formatCurrencyBRL(50)).toBe("R$\u00a00,50");
    });
  });

  describe("maskCurrencyBRL", () => {
    it("retorna vazio quando a string não contém dígitos", () => {
      expect(maskCurrencyBRL("")).toBe("");
      expect(maskCurrencyBRL("abc")).toBe("");
    });

    it("aplica máscara BRL com centavos", () => {
      expect(maskCurrencyBRL("150099")).toBe("1.500,99");
    });

    it("aplica máscara para valores pequenos", () => {
      expect(maskCurrencyBRL("50")).toBe("0,50");
    });
  });

  describe("unmaskCurrencyBRL", () => {
    it("remove a máscara e retorna valor em centavos", () => {
      expect(unmaskCurrencyBRL("1.500,99")).toBe(150099);
    });

    it("retorna 0 para string sem dígitos", () => {
      expect(unmaskCurrencyBRL("")).toBe(0);
    });
  });
});
