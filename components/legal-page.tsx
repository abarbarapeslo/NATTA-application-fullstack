import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

export type LegalSection = {
  heading: string;
  body: string;
};

export function LegalPage({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}) {
  const colors = useColors();

  return (
    <ScreenContainer className="bg-background">
      <View className="px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <IconSymbol name="xmark" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">{title}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        <Text className="text-xs text-muted mb-6">Last updated: {lastUpdated}</Text>

        <Text className="text-base text-foreground leading-relaxed mb-6">{intro}</Text>

        {sections.map((s, i) => (
          <View key={i} className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-2">
              {i + 1}. {s.heading}
            </Text>
            <Text className="text-sm text-muted leading-relaxed">{s.body}</Text>
          </View>
        ))}

        <Text className="text-xs text-muted mt-6 text-center">
          Questions? Contact us at contato@natta.pro.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
