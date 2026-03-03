import { Alert, Linking } from "react-native";

const TERMS_OF_USE_URL =
  process.env.EXPO_PUBLIC_TERMS_OF_USE_URL?.trim() ?? "";
const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() ?? "";

export const legalLinks = {
  termsOfUse: TERMS_OF_USE_URL,
  privacyPolicy: PRIVACY_POLICY_URL,
};

export async function openLegalLink(url: string, label: string) {
  if (!url) {
    Alert.alert(
      "Link não configurado",
      `Defina a URL pública de ${label} no ambiente do app.`
    );
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error("URL não suportada");
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Não foi possível abrir o link",
      `Verifique se a URL pública de ${label} está válida.`
    );
  }
}
