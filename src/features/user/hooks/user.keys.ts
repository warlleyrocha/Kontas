export const userKeys = {
  all: ["user"] as const,
  current: () => [...userKeys.all, "current"] as const,
  cached: () => [...userKeys.all, "cached"] as const,
};
