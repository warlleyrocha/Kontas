import { userKeys } from "../user.keys";

describe("userKeys", () => {
  it("define a chave base como ['user']", () => {
    expect(userKeys.all).toEqual(["user"]);
  });

  it("gera a chave current como ['user', 'current']", () => {
    expect(userKeys.current()).toEqual(["user", "current"]);
  });
});
