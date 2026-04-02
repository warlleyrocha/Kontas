export const residentKeys = {
  all: ["residents"] as const,
  byRepublic: (republicId: string) =>
    [...residentKeys.all, "republic", republicId] as const,
};
