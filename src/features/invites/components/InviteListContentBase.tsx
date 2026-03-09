import { EmptyState } from "@/src/components/EmptyState";
import { Fragment, type ComponentProps, type ReactNode } from "react";
import { ScrollView } from "react-native";

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

interface InviteListContentBaseProps<TItem> {
  readonly error: string | null;
  readonly items: readonly TItem[];
  readonly onRetry: () => void;
  readonly emptyState: EmptyStateProps;
  readonly keyExtractor: (item: TItem, index: number) => string;
  readonly renderItem: (item: TItem, index: number) => ReactNode;
}

export function InviteListContentBase<TItem>({
  error,
  items,
  onRetry,
  emptyState,
  keyExtractor,
  renderItem,
}: InviteListContentBaseProps<TItem>) {
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

  if (items.length === 0) {
    return <EmptyState {...emptyState} />;
  }

  return (
    <ScrollView className="flex-1 px-4 pt-4">
      {items.map((item, index) => (
        <Fragment key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </Fragment>
      ))}
    </ScrollView>
  );
}
