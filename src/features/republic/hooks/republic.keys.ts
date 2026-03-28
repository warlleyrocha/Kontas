export const republicKeys = {
  all: ["republics"] as const,
  list: () => [...republicKeys.all, "list"] as const,
  details: () => [...republicKeys.all, "detail"] as const,
  detail: (id: string) => [...republicKeys.details(), id] as const,
};
