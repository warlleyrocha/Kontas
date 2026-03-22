import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "../showToast";
import { toastErrors } from "../toastMessages";

jest.mock("@/src/services/httpError", () => ({
  __esModule: true,
  getErrorMessage: jest.fn(),
}));

jest.mock("../showToast", () => ({
  __esModule: true,
  showToast: {
    error: jest.fn(),
  },
}));

const mockGetErrorMessage = jest.mocked(getErrorMessage);
const mockShowToast = jest.mocked(showToast);

describe("toastMessages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetErrorMessage.mockReturnValue("mensagem tratada");
  });

  it("mostra erro de logout", () => {
    const error = new Error("logout");

    toastErrors.logoutFailed(error);

    expect(mockGetErrorMessage).toHaveBeenCalledWith(
      error,
      "Não foi possível fazer logout. Tente novamente.",
    );
    expect(mockShowToast.error).toHaveBeenCalledWith("mensagem tratada");
  });

  it("mostra erro de atualização de perfil", () => {
    const error = new Error("perfil");

    toastErrors.profileUpdateFailed(error);

    expect(mockGetErrorMessage).toHaveBeenCalledWith(
      error,
      "Erro ao atualizar o perfil.",
    );
    expect(mockShowToast.error).toHaveBeenCalledWith("mensagem tratada");
  });

  it("mostra erro de rede", () => {
    const error = new Error("rede");

    toastErrors.networkError(error);

    expect(mockGetErrorMessage).toHaveBeenCalledWith(
      error,
      "Erro de conexão. Verifique sua internet.",
    );
    expect(mockShowToast.error).toHaveBeenCalledWith("mensagem tratada");
  });
});
