export interface UpdateUserRequest {
  nome?: string;
  telefone?: string;
  chavePix?: string;
  fotoPerfil?: string;
}

export { User } from "../features/auth/types/auth.types";
