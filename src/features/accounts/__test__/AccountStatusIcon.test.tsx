import { render, screen } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import { AccountStatusIcon } from "../components/shared/AccountStatusIcon";

jest.mock("@expo/vector-icons/MaterialIcons", () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => {
    const { View } = require("react-native");
    return <View testID={`material-${name}`} />;
  },
}));

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => {
    const { View } = require("react-native");
    return <View testID={`material-community-${name}`} />;
  },
}));

const materialIcon = {
  library: "material" as const,
  name: "payment" as const,
  color: "#16a34a" as const,
};

const materialCommunityIcon = {
  library: "material-community" as const,
  name: "cash-clock" as const,
  color: "#6b7280" as const,
};

describe("AccountStatusIcon", () => {
  it("monta sem erros", () => {
    render(
      <AccountStatusIcon icon={materialIcon} size={24} isLoading={false} />,
    );
  });

  it("exibe ActivityIndicator quando isLoading é true", () => {
    const { UNSAFE_getByType } = render(
      <AccountStatusIcon icon={materialIcon} size={24} isLoading={true} />,
    );
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("não exibe ActivityIndicator quando isLoading é false", () => {
    const { UNSAFE_queryByType } = render(
      <AccountStatusIcon icon={materialIcon} size={24} isLoading={false} />,
    );
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it("renderiza MaterialIcons quando library é 'material'", () => {
    render(
      <AccountStatusIcon icon={materialIcon} size={24} isLoading={false} />,
    );
    expect(screen.getByTestId("material-payment")).toBeTruthy();
  });

  it("renderiza MaterialCommunityIcons quando library é 'material-community'", () => {
    render(
      <AccountStatusIcon
        icon={materialCommunityIcon}
        size={20}
        isLoading={false}
      />,
    );
    expect(screen.getByTestId("material-community-cash-clock")).toBeTruthy();
  });
});
