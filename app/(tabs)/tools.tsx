import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

export default function ToolsScreen() {
  const colors = useColors();

  const tools = [
    {
      id: 1,
      name: "Browse opportunities",
      description: "Find scholarships, internships and more",
      icon: "magnifyingglass" as const,
      route: "/opportunities",
      color: colors.primary,
    },
    {
      id: 2,
      name: "Saved",
      description: "Opportunities you bookmarked",
      icon: "bookmark" as const,
      route: "/saved",
      color: colors.primary,
    },
    {
      id: 3,
      name: "Video Space",
      description: "Record application videos with teleprompter",
      icon: "video" as const,
      route: "/video-space",
      color: colors.primary,
    },
    {
      id: 4,
      name: "Resume Assistant",
      description: "Write essays, cover letters and CV text with AI",
      icon: "doc" as const,
      route: "/resume-assistant",
      color: colors.primary,
    },
    {
      id: 5,
      name: "Document Reader",
      description: "Open and read your documents",
      icon: "pencil" as const,
      route: "/writing-hub",
      color: colors.primary,
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Image
            source={require("@/assets/images/natta_icon.png")}
            style={{ width: 120, height: 32 }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View className="px-6 mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Tools</Text>
          <Text className="text-base text-muted">
            Access all Natta tools to enhance your application process
          </Text>
        </View>

        {/* Tools Grid */}
        <View className="px-6">
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              onPress={() => router.push(tool.route as any)}
              className="mb-3"
            >
              <Card className="p-4">
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${tool.color}15` }}
                  >
                    <IconSymbol name={tool.icon} size={24} color={tool.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {tool.name}
                    </Text>
                    <Text className="text-sm text-muted">{tool.description}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
