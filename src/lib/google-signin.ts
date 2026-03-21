import { GoogleSignin } from "@react-native-google-signin/google-signin";

export function configureGoogleSignin() {
  GoogleSignin.configure({
    iosClientId: "...",
    webClientId: "...",
  });
}
