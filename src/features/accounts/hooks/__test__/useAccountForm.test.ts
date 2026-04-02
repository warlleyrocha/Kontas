import { act, renderHook } from "@testing-library/react-native";
import { Platform } from "react-native";
import { useResidents } from "@/src/features/residents/hooks/useResidents";
import { MetodoPagamento } from "../../types/account.types";
import {
  applyEqualSplitValues,
  applySplitByType,
  splitEvenly,
} from "../../utils/accountForm.utils";
import { useAccountForm } from "../useAccountForm";

jest.mock("@/src/features/residents/hooks/useResidents", () => ({
  useResidents: jest.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockFetchResidents = jest.fn();
const mockOnClose = jest.fn();

const mockResident = {
  id: "r-1",
  nome: "Ana",
  email: "ana@email.com",
  fotoPerfil: null,
  chavePix: null,
  telefone: null,
};

const mockResident2 = { ...mockResident, id: "r-2", nome: "Bruno" };

function setupResidentsMock(residents: (typeof mockResident)[] = []) {
  jest.mocked(useResidents).mockReturnValue({
    residents,
    fetchResidents: mockFetchResidents,
    setResidents: jest.fn(),
  } as any);
}

function renderForm(
  overrides: Partial<{
    republicId: string;
    visible: boolean;
    onClose: () => void;
  }> = {}
) {
  return renderHook(() =>
    useAccountForm({
      republicId: "rep-1",
      visible: true,
      onClose: mockOnClose,
      ...overrides,
    })
  );
}

function createMoradorDivisao(
  overrides: Partial<{
    moradorId: string;
    nome: string;
    checked: boolean;
    valor: string;
  }> = {}
) {
  return {
    moradorId: "r-1",
    nome: "Ana",
    checked: true,
    valor: "",
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  setupResidentsMock();
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── useAccountForm ───────────────────────────────────────────────────────────

describe("useAccountForm helpers de divisão", () => {
  it("splitEvenly retorna array vazio quando não há partes", () => {
    expect(splitEvenly(10, 0)).toEqual([]);
  });

  it("applySplitByType no modo custom preserva valor preenchido de morador marcado", () => {
    const result = applySplitByType(
      [
        createMoradorDivisao({ valor: "7,50" }),
        createMoradorDivisao({
          moradorId: "r-2",
          nome: "Bruno",
          checked: false,
          valor: "4,00",
        }),
      ],
      "custom",
      "20,00"
    );

    expect(result).toEqual([
      createMoradorDivisao({ valor: "7,50" }),
      createMoradorDivisao({
        moradorId: "r-2",
        nome: "Bruno",
        checked: false,
        valor: "",
      }),
    ]);
  });

  it("applySplitByType no modo custom usa '0,00' quando o morador marcado não tem valor", () => {
    const result = applySplitByType(
      [createMoradorDivisao()],
      "custom",
      "20,00"
    );

    expect(result).toEqual([createMoradorDivisao({ valor: "0,00" })]);
  });

  it("applyEqualSplitValues usa 0,00 quando faltar valor calculado para um morador marcado", () => {
    const result = applyEqualSplitValues(
      [
        createMoradorDivisao(),
        createMoradorDivisao({ moradorId: "r-2", nome: "Bruno" }),
      ],
      [5]
    );

    expect(result).toEqual([
      createMoradorDivisao({ valor: "5,00" }),
      createMoradorDivisao({
        moradorId: "r-2",
        nome: "Bruno",
        valor: "0,00",
      }),
    ]);
  });
});

describe("useAccountForm — estado inicial", () => {
  it("formData começa com valores padrão", () => {
    const { result } = renderForm();
    expect(result.current.formData.descricao).toBe("");
    expect(result.current.formData.valorTotal).toBe("");
    expect(result.current.formData.metodoPagamento).toBe(MetodoPagamento.PIX);
    expect(result.current.formData.tipoDivisao).toBe("equal");
    expect(result.current.formData.moradoresDivisao).toEqual([]);
  });

  it("showDatepicker começa como false", () => {
    const { result } = renderForm();
    expect(result.current.showDatepicker).toBe(false);
  });

  it("totalDivisaoPreenchido começa em 0", () => {
    const { result } = renderForm();
    expect(result.current.totalDivisaoPreenchido).toBe(0);
  });
});

describe("useAccountForm — carregamento de moradores", () => {
  it("passa republicId para useResidents para habilitar a query automática", () => {
    renderForm({ visible: true });
    expect(jest.mocked(useResidents)).toHaveBeenCalledWith("rep-1");
  });

  it("inicializa moradoresDivisao quando residents chegam (checked=true)", () => {
    setupResidentsMock([mockResident]);
    const { result } = renderForm();
    const morador = result.current.formData.moradoresDivisao[0];
    expect(morador.moradorId).toBe("r-1");
    expect(morador.nome).toBe("Ana");
    expect(morador.checked).toBe(true);
  });

  it("inicializa múltiplos moradores com checked=true", () => {
    setupResidentsMock([mockResident, mockResident2]);
    const { result } = renderForm();
    expect(result.current.formData.moradoresDivisao).toHaveLength(2);
    result.current.formData.moradoresDivisao.forEach((m) => {
      expect(m.checked).toBe(true);
    });
  });
});

describe("useAccountForm — handleOpenDatepicker / handleConfirmDate", () => {
  it("handleOpenDatepicker exibe o datepicker", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleOpenDatepicker();
    });
    expect(result.current.showDatepicker).toBe(true);
  });

  it("handleOpenDatepicker sincroniza tempVencimento com formData.vencimento", () => {
    const { result } = renderForm();
    const current = result.current.formData.vencimento;
    act(() => {
      result.current.handleOpenDatepicker();
    });
    expect(result.current.tempVencimento).toEqual(current);
  });

  it("handleConfirmDate atualiza vencimento a partir de tempVencimento e fecha datepicker", () => {
    const { result } = renderForm();
    const newDate = new Date("2026-06-15");
    act(() => {
      result.current.setTempVencimento(newDate);
    });
    act(() => {
      result.current.handleConfirmDate();
    });
    expect(result.current.formData.vencimento).toEqual(newDate);
    expect(result.current.showDatepicker).toBe(false);
  });
});

describe("useAccountForm — handleDateChange", () => {
  it("Android: atualiza vencimento e fecha o datepicker", () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, "OS", {
      value: "android",
      configurable: true,
    });

    const { result } = renderForm();
    const date = new Date("2026-07-01");
    act(() => {
      result.current.handleDateChange(null, date);
    });

    expect(result.current.formData.vencimento).toEqual(date);
    expect(result.current.showDatepicker).toBe(false);

    Object.defineProperty(Platform, "OS", {
      value: originalOS,
      configurable: true,
    });
  });

  it("iOS: atualiza apenas tempVencimento sem fechar datepicker", () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, "OS", {
      value: "ios",
      configurable: true,
    });

    const { result } = renderForm();
    const before = result.current.formData.vencimento;
    const date = new Date("2026-07-01");
    act(() => {
      result.current.handleDateChange(null, date);
    });

    expect(result.current.tempVencimento).toEqual(date);
    expect(result.current.formData.vencimento).toEqual(before);

    Object.defineProperty(Platform, "OS", {
      value: originalOS,
      configurable: true,
    });
  });

  it("não faz nada quando selectedDate é undefined", () => {
    const { result } = renderForm();
    const before = result.current.formData.vencimento;
    act(() => {
      result.current.handleDateChange(null);
    });
    expect(result.current.formData.vencimento).toEqual(before);
  });
});

describe("useAccountForm — handleCloseModal", () => {
  it("chama onClose ao ser invocado", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleCloseModal();
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

describe("useAccountForm — handleSetTipoDivisao", () => {
  it("atualiza tipoDivisao para 'custom'", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleSetTipoDivisao("custom");
    });
    expect(result.current.formData.tipoDivisao).toBe("custom");
  });

  it("atualiza tipoDivisao de volta para 'equal'", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleSetTipoDivisao("custom");
    });
    act(() => {
      result.current.handleSetTipoDivisao("equal");
    });
    expect(result.current.formData.tipoDivisao).toBe("equal");
  });
});

describe("useAccountForm — handleToggleMorador", () => {
  beforeEach(() => {
    setupResidentsMock([mockResident]);
  });

  it("desmarca um morador marcado", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleToggleMorador("r-1");
    });
    const morador = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    expect(morador?.checked).toBe(false);
  });

  it("marca novamente um morador desmarcado", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleToggleMorador("r-1");
    });
    act(() => {
      result.current.handleToggleMorador("r-1");
    });
    const morador = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    expect(morador?.checked).toBe(true);
  });
});

describe("useAccountForm — handleMoradorValorChange", () => {
  beforeEach(() => {
    setupResidentsMock([mockResident]);
  });

  it("atualiza o valor do morador", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("100,00");
    });
    act(() => {
      result.current.handleMoradorValorChange("r-1", "12,50");
    });
    const morador = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    expect(morador?.valor).toBe("12,50");
  });

  it("remove caracteres inválidos (letras, símbolos) do valor", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("100,00");
    });
    act(() => {
      result.current.handleMoradorValorChange("r-1", "1a2b,5!0");
    });
    const morador = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    expect(morador?.valor).toBe("12,50");
  });

  it("não permite valor acima do restante disponível", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("50,00");
    });
    act(() => {
      result.current.handleMoradorValorChange("r-1", "80,00");
    });
    const morador = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    expect(morador?.valor).toBe("50,00");
  });
});

describe("useAccountForm — handleValorTotalChange", () => {
  it("atualiza valorTotal", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("50,00");
    });
    expect(result.current.formData.valorTotal).toBe("50,00");
  });

  it("modo equal: distribui o valor igualmente entre moradores marcados", () => {
    setupResidentsMock([mockResident, mockResident2]);
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("10,00");
    });
    const valores = result.current.formData.moradoresDivisao.map(
      (m) => m.valor
    );
    expect(valores).toEqual(["5,00", "5,00"]);
  });

  it("modo equal: distribui o centavo extra para o primeiro morador", () => {
    setupResidentsMock([mockResident, mockResident2]);
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("10,01");
    });
    const valores = result.current.formData.moradoresDivisao.map(
      (m) => m.valor
    );
    expect(valores).toEqual(["5,01", "5,00"]);
  });

  it("modo custom: não recalcula o valor dos moradores", () => {
    setupResidentsMock([mockResident]);
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("50,00");
    });
    act(() => {
      result.current.handleSetTipoDivisao("custom");
    });
    act(() => {
      result.current.handleMoradorValorChange("r-1", "3,00");
    });
    act(() => {
      result.current.handleValorTotalChange("99,00");
    });
    const morador = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    expect(morador?.valor).toBe("3,00");
  });
});

describe("useAccountForm — handleValorTotalChange (parseCurrencyValue não-finito)", () => {
  it("valorTotal não numérico é tratado como zero no modo equal", () => {
    setupResidentsMock([mockResident]);
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("xyz");
    });
    const morador = result.current.formData.moradoresDivisao[0];
    expect(morador.valor).toBe("0,00");
  });
});

describe("useAccountForm — applySplitByType: modo custom com moradores", () => {
  beforeEach(() => {
    setupResidentsMock([mockResident, mockResident2]);
  });

  it("morador marcado com valor vazio recebe '0,00'", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleSetTipoDivisao("custom");
    });
    const morador = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    expect(morador?.valor).toBe("0,00");
  });

  it("morador desmarcado recebe valor '' no modo custom", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleSetTipoDivisao("custom");
    });
    act(() => {
      result.current.handleToggleMorador("r-1");
    });
    const morador = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    expect(morador?.valor).toBe("");
  });

  it("morador marcado com valor definido mantém o valor ao redistribuir no modo custom", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("100,00");
    });
    act(() => {
      result.current.handleSetTipoDivisao("custom");
    });
    act(() => {
      result.current.handleMoradorValorChange("r-1", "7,50");
    });
    act(() => {
      result.current.handleToggleMorador("r-2");
    });
    const r1 = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    expect(r1?.valor).toBe("7,50");
  });
});

describe("useAccountForm — handleToggleMorador no modo equal com lista mista", () => {
  beforeEach(() => {
    setupResidentsMock([mockResident, mockResident2]);
  });

  it("morador desmarcado recebe '' e o marcado absorve o total inteiro", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("10,00");
    });
    act(() => {
      result.current.handleToggleMorador("r-1");
    });
    const r1 = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-1"
    );
    const r2 = result.current.formData.moradoresDivisao.find(
      (m) => m.moradorId === "r-2"
    );
    expect(r1?.valor).toBe("");
    expect(r2?.valor).toBe("10,00");
  });
});

describe("useAccountForm — totalDivisaoPreenchido", () => {
  beforeEach(() => {
    setupResidentsMock([mockResident, mockResident2]);
  });

  it("soma os valores dos moradores marcados no modo equal", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("20,00");
    });
    expect(result.current.totalDivisaoPreenchido).toBeCloseTo(20);
  });

  it("ignora moradores desmarcados no cálculo do total", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValorTotalChange("100,00");
    });
    // Troca para custom para poder definir valores fixos sem recalculá-los
    act(() => {
      result.current.handleSetTipoDivisao("custom");
    });
    act(() => {
      result.current.handleMoradorValorChange("r-1", "15,00");
    });
    act(() => {
      result.current.handleMoradorValorChange("r-2", "8,00");
    });
    // Ambos marcados: 15 + 8 = 23
    expect(result.current.totalDivisaoPreenchido).toBeCloseTo(23);
    // Desmarca r-1 (valor dele fica "" no recálculo custom)
    act(() => {
      result.current.handleToggleMorador("r-1");
    });
    // Apenas r-2 é somado = 8
    expect(result.current.totalDivisaoPreenchido).toBeCloseTo(8);
  });
});
