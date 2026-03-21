import { hideAsync } from "expo-splash-screen";
import { useEffect } from "react";
import useAppFonts from "./useAppFonts";

export default function useAppReady() {
  const fontsLoaded = useAppFonts();

  const ready = fontsLoaded;

  useEffect(() => {
    if (ready) void hideAsync();
  }, [ready]);

  return ready;
}
