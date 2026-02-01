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

export interface GetInvitesByRepublicId {
  id: string;
  usuarioId: string;
  status: string;
}

export interface getInvitesByEmail {
  id: string;
  email: string;
  republicaId: string;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
}
