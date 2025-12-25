export interface GoogleLoginRequest {
  token: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  fotoPerfil: string;
  perfilCompleto: boolean;
  telefone?: string;
  chavePix?: string;
}

export interface CompleteProfileRequest {
  nome: string;
  telefone: string;
  chavePix: string;
  fotoPerfil?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
