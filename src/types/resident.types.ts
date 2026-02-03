// ENUMS
export enum ResidentRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum ResidentStatus {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  PENDENTE = "PENDENTE",
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
  fotoPerfil: string;
  chavePix: string;
  telefone: string;
  role: ResidentRole;
  status: ResidentStatus;
}
