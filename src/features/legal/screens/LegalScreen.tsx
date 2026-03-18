import { ScrollView, Text, View } from "react-native";
import Header from "@/src/shared/components/Header";
import type { Block, LegalDoc } from "@/src/shared/constants/legalContent";

interface LegalScreenProps {
  readonly doc: LegalDoc;
}

function renderBlock(block: Block, index: number) {
  switch (block.kind) {
    case "h3":
      return (
        <Text
          key={index}
          className="mb-1 mt-4 font-inter-semibold text-[14px] text-gray-800"
        >
          {block.text}
        </Text>
      );

    case "p":
      return (
        <Text
          key={index}
          className="mb-3 font-inter text-[14px] leading-[22px] text-gray-700"
        >
          {block.text}
        </Text>
      );

    case "bullets":
      return (
        <View key={index} className="mb-3 gap-1">
          {block.items.map((item, i) => (
            <View key={i} className="flex-row gap-2">
              <Text className="mt-[5px] h-[6px] w-[6px] rounded-full bg-teal" />
              <Text className="flex-1 font-inter text-[14px] leading-[22px] text-gray-700">
                {item}
              </Text>
            </View>
          ))}
        </View>
      );

    case "numbered":
      return (
        <View key={index} className="mb-3 gap-2">
          {block.items.map((item, i) => (
            <View key={i} className="flex-row gap-2">
              <Text className="font-inter-semibold text-[14px] text-teal">
                {i + 1}.
              </Text>
              <Text className="flex-1 font-inter text-[14px] leading-[22px] text-gray-700">
                {item}
              </Text>
            </View>
          ))}
        </View>
      );

    case "table":
      return (
        <View
          key={index}
          className="mb-3 overflow-hidden rounded-lg border border-gray-200"
        >
          {/* header row */}
          <View className="flex-row bg-teal/10">
            {block.headers.map((h, i) => (
              <View
                key={i}
                className={`flex-1 px-3 py-2 ${i === 0 ? "border-r border-gray-200" : ""}`}
              >
                <Text className="font-inter-semibold text-[13px] text-gray-800">
                  {h}
                </Text>
              </View>
            ))}
          </View>
          {/* data rows */}
          {block.rows.map((row, ri) => (
            <View
              key={ri}
              className={`flex-row ${ri < block.rows.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              {row.map((cell, ci) => (
                <View
                  key={ci}
                  className={`flex-1 px-3 py-2 ${ci === 0 ? "border-r border-gray-200" : ""} ${ri % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                >
                  <Text className="font-inter text-[13px] leading-[20px] text-gray-700">
                    {cell}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      );
  }
}

export function LegalScreen({ doc }: LegalScreenProps) {
  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <Header title={doc.title} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-6 font-inter text-[13px] text-gray-400">
          Última atualização: {doc.lastUpdated}
        </Text>

        {doc.sections.map((section, si) => (
          <View key={si} className="mb-6">
            <Text className="mb-3 font-inter-bold text-[16px] text-gray-900">
              {section.title}
            </Text>
            {section.blocks.map((block, bi) => renderBlock(block, bi))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
