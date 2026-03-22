import { renderHook } from "@testing-library/react-native";
import { logger } from "@/src/shared/utils/logger";
import { useComponentLogger } from "./useComponentLogger";

jest.mock("@/src/shared/utils/logger", () => ({
  __esModule: true,
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

const mockLogger = jest.mocked(logger);

describe("useComponentLogger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loga render, mount, rerender e unmount", () => {
    const { rerender, unmount } = renderHook(
      ({ name }) => useComponentLogger(name),
      {
        initialProps: { name: "ProfileCard" },
      },
    );

    expect(mockLogger.debug).toHaveBeenCalledWith("ProfileCard", "render #1");
    expect(mockLogger.info).toHaveBeenCalledWith("ProfileCard", "mounted");

    rerender({ name: "ProfileCard" });

    expect(mockLogger.debug).toHaveBeenCalledWith("ProfileCard", "render #2");

    unmount();

    expect(mockLogger.info).toHaveBeenCalledWith("ProfileCard", "unmounted");
  });

  it("refaz o efeito quando o nome muda", () => {
    const { rerender } = renderHook(({ name }) => useComponentLogger(name), {
      initialProps: { name: "OldName" },
    });

    rerender({ name: "NewName" });

    expect(mockLogger.info).toHaveBeenCalledWith("OldName", "unmounted");
    expect(mockLogger.info).toHaveBeenCalledWith("NewName", "mounted");
    expect(mockLogger.debug).toHaveBeenCalledWith("NewName", "render #2");
  });
});
