export const republicKeys = {
  all: ["republics"] as const,
  lists: () => [...republicKeys.all, "list"] as const,
  list: () => [...republicKeys.lists()] as const,
  details: () => [...republicKeys.all, "detail"] as const,
  detail: (id: string) => [...republicKeys.details(), id] as const,
};
