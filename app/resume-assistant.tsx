import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

export default function ResumeAssistantScreen() {
  const colors = useColors();

  const recentDocuments = [
    {
      id: 1,
      title: "Software Engineer CV",
      type: "CV",
      date: "Oct 20, 2024",
    },
    {
      id: 2,
      title: "MIT Cover Letter",
      type: "Cover Letter",
      date: "Oct 18, 2024",
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Image
              source={require("@/assets/images/natta_icon.png")}
              style={{ width: 100, height: 28 }}
              resizeMode="contain"
            />
          </View>
          <View className="w-6" />
        </View>

        {/* Create Options */}
        <View className="px-6 mb-6">
          <TouchableOpacity className="mb-4">
            <Card className="bg-primary/5">
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 bg-primary/20 rounded-2xl items-center justify-center">
                  <IconSymbol name="doc.text" size={32} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground mb-1">Create CV</Text>
                  <Text className="text-sm text-muted">
                    Build a professional resume with AI assistance
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card className="bg-primary/5">
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 bg-primary/20 rounded-2xl items-center justify-center">
                  <IconSymbol name="doc.text" size={32} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground mb-1">
                    Create Cover Letter
                  </Text>
                  <Text className="text-sm text-muted">
                    Write a compelling cover letter for your application
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Recent Documents */}
        <View className="px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Recent Documents</Text>

          {recentDocuments.map((doc) => (
            <TouchableOpacity key={doc.id} className="mb-3">
              <Card>
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-background rounded-xl items-center justify-center">
                    <IconSymbol name="doc.text" size={24} color={colors.foreground} />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground mb-1">{doc.title}</Text>
                    <Text className="text-sm text-muted">{doc.type} • {doc.date}</Text>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity className="w-10 h-10 bg-background rounded-full items-center justify-center">
                      <IconSymbol name="magnifyingglass" size={18} color={colors.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity className="w-10 h-10 bg-background rounded-full items-center justify-center">
                      <IconSymbol name="paperplane.fill" size={18} color={colors.foreground} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Assistant Button */}
        <View className="px-6 mt-6">
          <TouchableOpacity className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2">
            <IconSymbol name="sparkles" size={20} color={colors.surface} />
            <Text className="text-surface font-bold text-base">Start with AI Assistant</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
