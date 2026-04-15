import { Text, View } from "react-native";
import type {
  MoradorDivisao,
} from "../../types/accountForm.types";
import ResidentRow from "./AddAccountModalResidentRow";

interface AddAccountModalResidentsSectionProps {
  readonly moradoresDivisao: MoradorDivisao[];
  readonly onToggleMorador: (moradorId: string) => void;
  readonly onMoradorValorChange: (moradorId: string, value: string) => void;
}

export function AddAccountModalResidentsSection({
  moradoresDivisao,
  onToggleMorador,
  onMoradorValorChange,
}: AddAccountModalResidentsSectionProps) {
 
  return (
    
      <View className="mb-4">
        <Text className="mb-2 text-sm text-gray-700">
          Selecione os Moradores
        </Text>

        <View className="gap-3">
          {moradoresDivisao.map((morador) => (
            <ResidentRow
              key={morador.moradorId}
              morador={morador}
              onToggle={() => onToggleMorador(morador.moradorId)}
              onValorChange={(value) =>
                onMoradorValorChange(morador.moradorId, value)
              }
            />
          ))}
        </View>
      </View>
    
  );
}
