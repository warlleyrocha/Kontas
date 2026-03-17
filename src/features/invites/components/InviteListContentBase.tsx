import { type ComponentProps, type ReactNode } from "react";
import { ScrollView } from "react-native";
import { EmptyState } from "@/src/shared/components/EmptyState";

type EmptyStateProps = Pick<
  ComponentProps<typeof EmptyState>,
  | "icon"
  | "iconColor"
  | "bgColor"
  | "title"
  | "description"
  | "buttonText"
  | "onPress"
>;

interface InviteListContentBaseProps {
  readonly error: string | null;
  readonly hasItems: boolean;
  readonly onRetry: () => void;
  readonly emptyState: EmptyStateProps;
  readonly children: ReactNode;
}

export function InviteListContentBase({
  error,
  hasItems,
  onRetry,
  emptyState,
  children,
}: InviteListContentBaseProps) {
  if (error) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        iconColor="#EF4444"
        bgColor="bg-red-50"
        title="Não foi possível carregar os convites"
        description={error}
        buttonText="Tentar novamente"
        onPress={onRetry}
      />
    );
  }

  if (!hasItems) {
    return <EmptyState {...emptyState} />;
  }

  return (
    <ScrollView className="flex-1 bg-teal/5 px-4 pt-4">
      {children}
    </ScrollView>
  );
}
