export const accountKeys = {
  all: ["accounts"] as const,
  byRepublic: (republicId: string) =>
    [...accountKeys.all, "republic", republicId] as const,
  byResident: (moradorId: string) =>
    [...accountKeys.all, "resident", moradorId] as const,
};
