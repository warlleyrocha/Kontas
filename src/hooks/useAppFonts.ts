import { useFonts } from "expo-font";
import { useEffect } from "react";
import { APP_FONTS } from "@/src/lib/fonts";

export default function useAppFonts() {
  const [loaded, error] = useFonts(APP_FONTS);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return loaded;
}
