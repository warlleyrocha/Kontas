import { GoogleSignin } from "@react-native-google-signin/google-signin";

export function configureGoogleSignin() {
  GoogleSignin.configure({
    iosClientId:
      "475215012202-oq93e4s85f7uuhfji6k2nkhdb7i2dfm3.apps.googleusercontent.com",
    webClientId:
      "475215012202-3au572tua9mtmv5647hbdsu342402sko.apps.googleusercontent.com",
  });
}
