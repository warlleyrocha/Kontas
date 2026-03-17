// ENUMS
export enum ResidentRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

// Request Types
export interface CreateResidentRequest {
  usuarioId: string;
  republicaId: string;
  role: ResidentRole;
}
// Resposnse Types
export interface ResidentResponse {
  id: string;
  nome: string;
  email: string;
  fotoPerfil: string | null;
  chavePix: string | null;
  telefone: string | null;
  role: ResidentRole;
}
