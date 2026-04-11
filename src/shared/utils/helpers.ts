import { UpdateUserRequest, User } from "@/src/features/user/types/user.types";
import { showToast } from "@/src/shared/utils/showToast";

// Verificação de campos para completar o perfil, envia apenas quando algo mudar
export const buildProfileChanges = (
  user: User,
  name: string,
  phone?: string,
  pixKey?: string,
  fotoPerfilUrl?: string
): UpdateUserRequest => {
  const changes: UpdateUserRequest = {};

  if (name !== user.nome) changes.nome = name;
  if (phone !== user.telefone) changes.telefone = phone;
  if (pixKey !== user.chavePix) changes.chavePix = pixKey;
  if (fotoPerfilUrl && fotoPerfilUrl !== user.fotoPerfil)
    changes.fotoPerfil = fotoPerfilUrl;

  return changes;
};

// Validação para completar o perfil, exige telefone e chave Pix
export const validateProfileCompletion = (
  isCompletingProfile: boolean,
  phone?: string,
  pixKey?: string
): boolean => {
  if (isCompletingProfile && (!phone || !pixKey)) {
    showToast.error("Por favor, preencha o telefone e a chave Pix.");
    return false;
  }
  return true;
};

// Verifica se a URI da foto é local (precisa ser enviada para o backend) ou já é uma URL (já foi enviada antes)
export const isLocalPhotoUri = (photo: string): boolean =>
  photo.startsWith("file://") ||
  photo.startsWith("content://") ||
  photo.startsWith("ph://");
