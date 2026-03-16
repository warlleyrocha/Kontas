// hooks/useRepublicForm.ts
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from "expo-image-picker";
import { Alert } from "react-native";
import { useState } from "react";

export function useRepublicForm() {
  const [republicName, setRepublicName] = useState("");
  const [republicImage, setRepublicImage] = useState<string | undefined>();

  async function handleSelectImageRepublic() {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária");
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setRepublicImage(result.assets[0].uri);
    }
  }

  return {
    republicName,
    setRepublicName,
    republicImage,
    setRepublicImage,
    handleSelectImageRepublic,
  };
}
