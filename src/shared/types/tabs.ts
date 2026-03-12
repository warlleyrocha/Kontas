// Tipo das chaves de navegação das tabs
export type TabKey = "resumo" | "contas" | "moradores";

// Interface do contexto de Tabs (para compartilhamento de estado)
export interface TabsContextType {
  readonly value: TabKey;
  readonly setValue: (v: TabKey) => void;
}

// Tipo de cada tab individual
export type Tab = {
  readonly key: TabKey;
  readonly label: string;
  readonly icon: (color: string) => React.ReactElement;
};

// Props do componente Tabs
export interface TabsProps {
  value: TabKey;
  onChange: (v: TabKey) => void;
}
