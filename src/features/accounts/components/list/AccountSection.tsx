import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, TouchableOpacity, View } from "react-native";
import type { ContaMorador } from "@/src/features/accounts/types/accountResidents.types";
import type { Conta, MetodoPagamento } from "../../types/account.types";
import { type CardPosition } from "../AccountContextMenu";
import { AccountCard } from "./AccountCard";

interface AccountSectionProps {
  readonly label: string;
  readonly contas: Conta[];
  readonly visivel: boolean;
  readonly onToggle: () => void;
  readonly headerBg: string;
  readonly headerTextColor: string;
  readonly headerIconColor: string;
  readonly expandedAccountId: string | null;
  readonly onToggleExpand: (accountId: string) => void;
  readonly accountResidentsById: Record<string, ContaMorador[]>;
  readonly loadingResidentsById: Record<string, boolean>;
  readonly errorResidentsById: Record<string, boolean>;
  readonly updatingResidentById: Record<string, boolean>;
  readonly currentResidentId: string | null;
  readonly onLongPress: (accountId: string, position: CardPosition) => void;
  readonly onConfirmResidentPayment: (
    accountId: string,
    accountResidentId: string
  ) => Promise<void> | void;
  readonly onPatch: (
    accountId: string,
    metodoPagamento: MetodoPagamento
  ) => Promise<void> | void;
  readonly onCopyPix: (conta: Conta) => boolean | Promise<boolean>;
}

export function AccountSection({
  label,
  contas,
  visivel,
  onToggle,
  headerBg,
  headerTextColor,
  headerIconColor,
  expandedAccountId,
  onToggleExpand,
  accountResidentsById,
  loadingResidentsById,
  errorResidentsById,
  updatingResidentById,
  currentResidentId,
  onLongPress,
  onConfirmResidentPayment,
  onPatch,
  onCopyPix,
}: AccountSectionProps) {
  if (contas.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={onToggle}
        className={`mb-3 flex-row items-center justify-between rounded-lg p-4 ${headerBg}`}
      >
        <Text className={`text-lg font-semibold ${headerTextColor}`}>
          {label} ({contas.length})
        </Text>
        <MaterialCommunityIcons
          name={visivel ? "chevron-up" : "chevron-down"}
          size={24}
          color={headerIconColor}
        />
      </TouchableOpacity>

      {visivel &&
        contas.map((conta) => (
          <AccountCard
            key={conta.id}
            conta={conta}
            criadoPorNome={conta.criadoPorNome}
            expanded={expandedAccountId === conta.id}
            onToggleExpand={() => onToggleExpand(conta.id)}
            moradores={accountResidentsById[conta.id] ?? []}
            isLoadingMoradores={Boolean(loadingResidentsById[conta.id])}
            hasError={Boolean(errorResidentsById[conta.id])}
            updatingResidentById={updatingResidentById}
            currentResidentId={currentResidentId}
            onLongPress={(position) => onLongPress(conta.id, position)}
            onConfirmResidentPayment={onConfirmResidentPayment}
            onPatch={onPatch}
            onCopyPix={onCopyPix}
          />
        ))}
    </View>
  );
}
