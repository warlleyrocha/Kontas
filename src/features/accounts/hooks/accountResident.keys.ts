export const accountResidentKeys = {
  all: ["accountResidents"] as const,
  accounts: () => [...accountResidentKeys.all, "account"] as const,
  byAccount: (accountId: string) =>
    [...accountResidentKeys.accounts(), accountId] as const,
  residents: () => [...accountResidentKeys.all, "resident"] as const,
  byResident: (residentId: string) =>
    [...accountResidentKeys.residents(), residentId] as const,
};
