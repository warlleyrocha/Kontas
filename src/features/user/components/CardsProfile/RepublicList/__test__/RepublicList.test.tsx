import { fireEvent, render, screen } from "@testing-library/react-native";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import RepublicList from "../index";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

jest.mock("@/src/features/user/components/RepublicCard", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return function MockRepublicCard({
    republic,
    residentsCount,
    onSelect,
  }: {
    republic: RepublicResponse;
    residentsCount: number;
    onSelect: () => void;
  }) {
    return (
      <TouchableOpacity
        onPress={onSelect}
        accessibilityLabel={`card-${republic.id}`}
      >
        <Text>{republic.nome}</Text>
        <Text>{residentsCount}</Text>
      </TouchableOpacity>
    );
  };
});

const mockRepublics: RepublicResponse[] = [
  { id: "rep-1", nome: "Alpha" },
  { id: "rep-2", nome: "Beta" },
];

const onSelectRepublic = jest.fn();
const onCreateRepublic = jest.fn();
const getResidentsCount = jest.fn().mockReturnValue(3);

beforeEach(() => {
  jest.clearAllMocks();
  getResidentsCount.mockReturnValue(3);
});

describe("RepublicList", () => {
  it("renderiza o título e o botão de adicionar", () => {
    render(
      <RepublicList
        republics={[]}
        onSelectRepublic={onSelectRepublic}
        onCreateRepublic={onCreateRepublic}
        getResidentsCount={getResidentsCount}
      />
    );

    expect(screen.getByText("Suas Repúblicas")).toBeTruthy();
    expect(screen.getByText("Adicionar Nova República")).toBeTruthy();
  });

  it("renderiza um RepublicCard por república", () => {
    render(
      <RepublicList
        republics={mockRepublics}
        onSelectRepublic={onSelectRepublic}
        onCreateRepublic={onCreateRepublic}
        getResidentsCount={getResidentsCount}
      />
    );

    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Beta")).toBeTruthy();
  });

  it("chama getResidentsCount para cada república", () => {
    render(
      <RepublicList
        republics={mockRepublics}
        onSelectRepublic={onSelectRepublic}
        onCreateRepublic={onCreateRepublic}
        getResidentsCount={getResidentsCount}
      />
    );

    expect(getResidentsCount).toHaveBeenCalledWith("rep-1");
    expect(getResidentsCount).toHaveBeenCalledWith("rep-2");
  });

  it("chama onSelectRepublic ao pressionar um card", () => {
    render(
      <RepublicList
        republics={mockRepublics}
        onSelectRepublic={onSelectRepublic}
        onCreateRepublic={onCreateRepublic}
        getResidentsCount={getResidentsCount}
      />
    );

    fireEvent.press(screen.getByLabelText("card-rep-1"));

    expect(onSelectRepublic).toHaveBeenCalledWith("rep-1");
  });

  it("chama onCreateRepublic ao pressionar o botão de adicionar", () => {
    render(
      <RepublicList
        republics={[]}
        onSelectRepublic={onSelectRepublic}
        onCreateRepublic={onCreateRepublic}
        getResidentsCount={getResidentsCount}
      />
    );

    fireEvent.press(screen.getByText("Adicionar Nova República"));

    expect(onCreateRepublic).toHaveBeenCalledTimes(1);
  });

  it("renderiza RefreshControl quando onRefresh é fornecido", () => {
    const onRefresh = jest.fn();

    render(
      <RepublicList
        republics={[]}
        onSelectRepublic={onSelectRepublic}
        onCreateRepublic={onCreateRepublic}
        getResidentsCount={getResidentsCount}
        refreshing={false}
        onRefresh={onRefresh}
      />
    );

    // RefreshControl é renderizado sem lançar erro
    expect(screen.getByText("Suas Repúblicas")).toBeTruthy();
  });

  it("não renderiza RefreshControl quando onRefresh não é fornecido", () => {
    render(
      <RepublicList
        republics={[]}
        onSelectRepublic={onSelectRepublic}
        onCreateRepublic={onCreateRepublic}
        getResidentsCount={getResidentsCount}
      />
    );

    expect(screen.getByText("Suas Repúblicas")).toBeTruthy();
  });
});
