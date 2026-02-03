import { Redirect, useLocalSearchParams } from "expo-router";
import { RepublicScreen } from "@/src/features/republic";

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <Redirect href="/" />;
  }

  return <RepublicScreen republicId={id} />;
}
