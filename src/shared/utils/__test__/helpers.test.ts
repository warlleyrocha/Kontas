import type {
  RepublicPost,
  RepublicResponse,
} from "@/src/features/republic/types/republic.types";
import type { User } from "@/src/features/user/types/user.types";
import { showToast } from "@/src/shared/utils/showToast";
import {
  buildImageFormData,
  buildProfileChanges,
  buildRepublicChanges,
  isLocalPhotoUri,
  validateProfileCompletion,
} from "../helpers";

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: {
    error: jest.fn(),
  },
}));

const mockShowToastError = jest.mocked(showToast.error);

describe("helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("buildProfileChanges", () => {
    const mockUser: User = {
      id: "u-1",
      email: "ana@email.com",
      nome: "Ana",
      telefone: "11999999999",
      chavePix: "ana@pix.com",
      fotoPerfil: "https://example.com/foto.jpg",
      perfilCompleto: true,
    };

    it("retorna objeto vazio quando nenhum campo mudou", () => {
      const result = buildProfileChanges(
        mockUser,
        "Ana",
        "11999999999",
        "ana@pix.com",
        "https://example.com/foto.jpg"
      );

      expect(result).toEqual({});
    });

    it("inclui nome quando diferente", () => {
      const result = buildProfileChanges(
        mockUser,
        "Bruno",
        "11999999999",
        "ana@pix.com"
      );

      expect(result).toEqual({ nome: "Bruno" });
    });

    it("inclui telefone quando diferente", () => {
      const result = buildProfileChanges(
        mockUser,
        "Ana",
        "11888888888",
        "ana@pix.com"
      );

      expect(result).toEqual({ telefone: "11888888888" });
    });

    it("inclui chavePix quando diferente", () => {
      const result = buildProfileChanges(
        mockUser,
        "Ana",
        "11999999999",
        "novo@pix.com"
      );

      expect(result).toEqual({ chavePix: "novo@pix.com" });
    });

    it("inclui fotoPerfil quando provided e diferente da atual", () => {
      const result = buildProfileChanges(
        mockUser,
        "Ana",
        "11999999999",
        "ana@pix.com",
        "https://example.com/nova-foto.jpg"
      );

      expect(result).toEqual({
        fotoPerfil: "https://example.com/nova-foto.jpg",
      });
    });

    it("não inclui fotoPerfil quando é undefined", () => {
      const result = buildProfileChanges(
        mockUser,
        "Ana",
        "11999999999",
        "ana@pix.com",
        undefined
      );

      expect(result).toEqual({});
    });

    it("não inclui fotoPerfil quando é igual à atual", () => {
      const result = buildProfileChanges(
        mockUser,
        "Ana",
        "11999999999",
        "ana@pix.com",
        "https://example.com/foto.jpg"
      );

      expect(result).toEqual({});
    });

    it("retorna múltiplas mudanças combinadas", () => {
      const result = buildProfileChanges(
        mockUser,
        "Bruno",
        "11888888888",
        "novo@pix.com",
        "https://example.com/nova-foto.jpg"
      );

      expect(result).toEqual({
        nome: "Bruno",
        telefone: "11888888888",
        chavePix: "novo@pix.com",
        fotoPerfil: "https://example.com/nova-foto.jpg",
      });
    });
  });

  describe("buildRepublicChanges", () => {
    const mockRepublic: RepublicResponse = {
      id: "rep-1",
      nome: "República Alpha",
      imagemRepublica: "https://example.com/republica.jpg",
    };

    it("retorna objeto vazio quando nenhum campo mudou", () => {
      const data: RepublicPost = {
        nome: "República Alpha",
        imagemRepublica: "https://example.com/republica.jpg",
      };

      const result = buildRepublicChanges(mockRepublic, data);

      expect(result).toEqual({});
    });

    it("inclui nome quando diferente", () => {
      const data: RepublicPost = {
        nome: "Nova República",
        imagemRepublica: "https://example.com/republica.jpg",
      };

      const result = buildRepublicChanges(mockRepublic, data);

      expect(result).toEqual({ nome: "Nova República" });
    });

    it("inclui imagemRepublica quando diferente", () => {
      const data: RepublicPost = {
        nome: "República Alpha",
        imagemRepublica: "https://example.com/nova-imagem.jpg",
      };

      const result = buildRepublicChanges(mockRepublic, data);

      expect(result).toEqual({
        imagemRepublica: "https://example.com/nova-imagem.jpg",
      });
    });

    it("não inclui imagemRepublica quando é undefined", () => {
      const data: RepublicPost = {
        nome: "República Alpha",
      };

      const result = buildRepublicChanges(mockRepublic, data);

      expect(result).toEqual({});
    });

    it("não inclui imagemRepublica quando é igual à atual", () => {
      const data: RepublicPost = {
        nome: "República Alpha",
        imagemRepublica: "https://example.com/republica.jpg",
      };

      const result = buildRepublicChanges(mockRepublic, data);

      expect(result).toEqual({});
    });

    it("retorna múltiplas mudanças combinadas", () => {
      const data: RepublicPost = {
        nome: "Nova República",
        imagemRepublica: "https://example.com/nova-imagem.jpg",
      };

      const result = buildRepublicChanges(mockRepublic, data);

      expect(result).toEqual({
        nome: "Nova República",
        imagemRepublica: "https://example.com/nova-imagem.jpg",
      });
    });
  });

  describe("validateProfileCompletion", () => {
    it("retorna true quando não está completando perfil", () => {
      const result = validateProfileCompletion(false, undefined, undefined);

      expect(result).toBe(true);
      expect(mockShowToastError).not.toHaveBeenCalled();
    });

    it("retorna true quando completando perfil com phone e pixKey", () => {
      const result = validateProfileCompletion(
        true,
        "11999999999",
        "pix@email.com"
      );

      expect(result).toBe(true);
      expect(mockShowToastError).not.toHaveBeenCalled();
    });

    it("retorna false e exibe toast quando phone está ausente", () => {
      const result = validateProfileCompletion(
        true,
        undefined,
        "pix@email.com"
      );

      expect(result).toBe(false);
      expect(mockShowToastError).toHaveBeenCalledWith(
        "Por favor, preencha o telefone e a chave Pix."
      );
    });

    it("retorna false e exibe toast quando pixKey está ausente", () => {
      const result = validateProfileCompletion(true, "11999999999", undefined);

      expect(result).toBe(false);
      expect(mockShowToastError).toHaveBeenCalledWith(
        "Por favor, preencha o telefone e a chave Pix."
      );
    });

    it("retorna false e exibe toast quando ambos estão ausentes", () => {
      const result = validateProfileCompletion(true, undefined, undefined);

      expect(result).toBe(false);
      expect(mockShowToastError).toHaveBeenCalledWith(
        "Por favor, preencha o telefone e a chave Pix."
      );
    });
  });

  describe("isLocalPhotoUri", () => {
    it("retorna true para URIs file://", () => {
      expect(isLocalPhotoUri("file:///data/user/0/photo.jpg")).toBe(true);
    });

    it("retorna true para URIs content://", () => {
      expect(isLocalPhotoUri("content://media/external/photo/1")).toBe(true);
    });

    it("retorna true para URIs ph://", () => {
      expect(isLocalPhotoUri("ph://media/photo/123")).toBe(true);
    });

    it("retorna false para URLs http/https", () => {
      expect(isLocalPhotoUri("https://example.com/foto.jpg")).toBe(false);
      expect(isLocalPhotoUri("http://example.com/foto.jpg")).toBe(false);
    });

    it("retorna false para caminhos relativos", () => {
      expect(isLocalPhotoUri("./assets/foto.jpg")).toBe(false);
      expect(isLocalPhotoUri("/path/to/foto.jpg")).toBe(false);
    });
  });

  describe("buildImageFormData", () => {
    it("extrai filename e tipo corretamente de URI", () => {
      const result = buildImageFormData("/path/to/photo.jpg");

      expect(result.filename).toBe("photo.jpg");
      expect(result.type).toBe("image/jpg");
    });

    it("extrai extensão correta para png", () => {
      const result = buildImageFormData("/path/to/image.png");

      expect(result.filename).toBe("image.png");
      expect(result.type).toBe("image/png");
    });

    it("usa image/jpeg como fallback quando extensão não reconhecida", () => {
      const result = buildImageFormData("/path/to/image.unknown");

      expect(result.filename).toBe("image.unknown");
      expect(result.type).toBe("image/unknown");
    });

    it("retorna string vazia quando URI está vazia", () => {
      const result = buildImageFormData("");

      expect(result.filename).toBe("");
    });

    it("retorna FormData com arquivo", () => {
      const result = buildImageFormData("/path/to/photo.jpg");

      expect(result.formData).toBeInstanceOf(FormData);
      expect(result.formData.get("file")).toBeDefined();
    });
  });
});
