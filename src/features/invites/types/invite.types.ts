export enum StatusInvite {
  PENDENTE = "PENDENTE",
  ACEITO = "ACEITO",
  RECUSADO = "RECUSADO",
}
export interface Invite {
  id: string;
  email: string;
  republicaId: string;
  status: StatusInvite;
  criadoEm: string;
  atualizadoEm: string;
}

export interface InviteRequest {
  email: string;
  republicaId: string;
}

export interface PatchInviteStatusResponse {
  id: string;
  status: StatusInvite;
}

export interface GetInvitesByUser {
  id: string;
  email: string;
  republicaId: string;
  status: StatusInvite;
  criadoEm: string;
  atualizadoEm: string;
}
