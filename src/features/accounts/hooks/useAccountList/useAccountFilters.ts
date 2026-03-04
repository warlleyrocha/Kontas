// mesSelecionado, mostrarAbertas, mostrarPagas
import { useState } from "react";

interface UseAccountFiltersReturn {
  mesSelecionado: string;
  mostrarContasAbertas: boolean;
  mostrarContasPagas: boolean;
  setMesSelecionado: (mes: string) => void;
  setMostrarContasAbertas: (value: boolean) => void;
  setMostrarContasPagas: (value: boolean) => void;
}

export function useAccountFilters(): UseAccountFiltersReturn {
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
  const [mostrarContasAbertas, setMostrarContasAbertas] = useState(true);
  const [mostrarContasPagas, setMostrarContasPagas] = useState(false);

  return {
    mesSelecionado,
    mostrarContasAbertas,
    mostrarContasPagas,
    setMesSelecionado,
    setMostrarContasAbertas,
    setMostrarContasPagas,
  };
}
