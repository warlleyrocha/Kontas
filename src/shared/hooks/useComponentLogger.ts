import { useEffect, useRef } from "react";
import { logger } from "@/src/shared/utils/logger";

/**
 * Loga o ciclo de vida do componente: mount, renders e unmount.
 * Exibido apenas em development (controlado pelo logger).
 *
 * @param name - Nome do componente para identificação no log
 */
export function useComponentLogger(name: string) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Loga cada re-render com contador
  logger.debug(name, `render #${renderCount.current}`);

  // biome-ignore lint/correctness/useExhaustiveDependencies: executa apenas no mount/unmount
  useEffect(() => {
    logger.info(name, "mounted");
    return () => {
      logger.info(name, "unmounted");
    };
  }, []);
}
