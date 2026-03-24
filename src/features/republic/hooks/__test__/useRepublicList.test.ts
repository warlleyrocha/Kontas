import { renderHook } from "@testing-library/react-native";
import { useRepublicListContext } from "@/src/features/republic/contexts/RepublicListContext";
import { useRepublicList } from "../useRepublicList";

jest.mock("@/src/features/republic/contexts/RepublicListContext", () => ({
  __esModule: true,
  useRepublicListContext: jest.fn(),
}));

const mockUseRepublicListContext = jest.mocked(useRepublicListContext);

describe("useRepublicList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna o valor de useRepublicListContext", () => {
    const contextValue = {
      republics: [],
      setRepublics: jest.fn(),
      fetchRepublics: jest.fn(),
      fetchRepublicById: jest.fn(),
    };

    mockUseRepublicListContext.mockReturnValue(contextValue);

    const { result } = renderHook(() => useRepublicList());

    expect(mockUseRepublicListContext).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(contextValue);
  });
});
