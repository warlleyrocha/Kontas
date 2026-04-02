export const inviteKeys = {
  all: ["invites"] as const,
  byUser: () => [...inviteKeys.all, "me"] as const,
  byRepublic: (republicId: string) =>
    [...inviteKeys.all, "republic", republicId] as const,
};
