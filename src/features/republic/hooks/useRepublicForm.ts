// hooks/useRepublicForm.ts
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useState } from "react";

export function useRepublicForm() {
  const [republicName, setRepublicName] = useState("");
  const [republicImage, setRepublicImage] = useState<string | undefined>();

  async function handleSelectImageRepublic() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
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
