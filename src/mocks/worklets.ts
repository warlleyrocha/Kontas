// Mock vazio para react-native-worklets — usado apenas no ambiente Megler/Docker
// Executa o callback imediatamente em vez de agendar na thread UI nativa

export function scheduleOnRN(callback) {
  callback();
}

export function createWorklet() {
  return () => {};
}

export function runOnJS(fn) {
  return fn;
}
