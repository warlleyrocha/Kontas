import { RepublicPost, RepublicResponse } from "@/src/features/republic/types/republic.types";
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

// Verificação para campos de república, envia apenas quando algo mudar
export const buildRepublicChanges = (
  republic: RepublicResponse,
  data: RepublicPost
): Partial<RepublicPost> => {
  const changes: Partial<RepublicPost> = {};

  if (data.nome !== republic.nome) changes.nome = data.nome;
  if (data.imagemRepublica && data.imagemRepublica !== republic.imagemRepublica)
    changes.imagemRepublica = data.imagemRepublica;

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

// Função para construir o FormData para upload de imagem, extraindo o nome do arquivo e o tipo MIME
export const buildImageFormData = (uri: string): {
  formData: FormData;
  filename: string;
  type: string;
} => {
  const filename = uri.split("/").pop() ?? "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  const formData = new FormData();
  formData.append("file", { uri, name: filename, type } as any);

  return { formData, filename, type };
};
