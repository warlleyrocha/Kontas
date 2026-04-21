export const accountResidentKeys = {
  all: ["accountResidents"] as const,
  byRepublic: (republicId: string) =>
    [...accountResidentKeys.all, "republic", republicId] as const,
  accounts: (republicId: string) =>
    [...accountResidentKeys.byRepublic(republicId), "account"] as const,
  byAccount: (republicId: string, accountId: string) =>
    [...accountResidentKeys.accounts(republicId), accountId] as const,
  residents: (republicId: string) =>
    [...accountResidentKeys.byRepublic(republicId), "resident"] as const,
  byResident: (republicId: string, residentId: string) =>
    [...accountResidentKeys.residents(republicId), residentId] as const,
};
