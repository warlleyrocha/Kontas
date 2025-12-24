export interface GoogleLoginRequest {
  token: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  fotoPerfil: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
