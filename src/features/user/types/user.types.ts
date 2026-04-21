export interface UpdateUserRequest {
  nome?: string;
  telefone?: string;
  chavePix?: string;
  fotoPerfil?: string;
}

export interface CompleteProfileRequest {
  nome: string;
  telefone: string;
  chavePix: string;
  fotoPerfil?: string;
}

export interface User {
  id: string;
  nome?: string;
  email: string;
  fotoPerfil?: string | null;
  perfilCompleto: boolean;
  telefone?: string;
  chavePix?: string;
}
