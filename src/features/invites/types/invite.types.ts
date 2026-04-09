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
  nomeMorador: string;
  imagemMorador: string | null;
  nomeAdmin: string;
  nomeRepublica: string;
  imagemRepublica: string | null;
}

export interface InviteRequest {
  email: string;
  republicaId: string;
}

export interface PatchInviteStatusResponse {
  id: string;
  status: StatusInvite;
}

/*
  interface deprecated, backend retorna o mesmo modelo para a listagem de convites do usuário e da república, então mantemos apenas o Invite para ambos os casos.
export interface GetInvitesByUser {
  id: string;
  email: string;
  republicaId: string;
  status: StatusInvite;
  criadoEm: string;
  atualizadoEm: string;
}
*/
