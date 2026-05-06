import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { Tag } from "@/components/ui/tag";

export default function DesignSpaceScreen() {
  const colors = useColors();

  const templates = [
    { id: 1, name: "Harvard", style: "Classic" },
    { id: 2, name: "Modern", style: "Contemporary" },
    { id: 3, name: "Creative", style: "Bold" },
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
          <TouchableOpacity>
            <IconSymbol name="paperplane.fill" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Templates Carousel */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Choose Template</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            {templates.map((template) => (
              <TouchableOpacity key={template.id} className="mr-3">
                <Card className="w-40">
                  <View className="w-full aspect-[3/4] bg-background rounded-xl items-center justify-center mb-2">
                    <IconSymbol name="doc.text" size={48} color={colors.muted} />
                  </View>
                  <Text className="text-sm font-bold text-foreground mb-1">{template.name}</Text>
                  <Tag label={template.style} variant="primary" />
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CV Preview */}
        <View className="px-6 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">Preview</Text>

          <Card className="aspect-[3/4] bg-surface p-4">
            {/* Mock CV Content */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-background items-center justify-center mb-2">
                <IconSymbol name="person.fill" size={32} color={colors.muted} />
              </View>
              <Text className="text-lg font-bold text-foreground">Giulia Alvares</Text>
              <Text className="text-sm text-muted">Business Student</Text>
            </View>

            <View className="mb-3">
              <Text className="text-sm font-bold text-foreground mb-1">Education</Text>
              <View className="h-px bg-border mb-2" />
              <Text className="text-xs text-muted">PUCPR - Business Administration</Text>
            </View>

            <View className="mb-3">
              <Text className="text-sm font-bold text-foreground mb-1">Experience</Text>
              <View className="h-px bg-border mb-2" />
              <Text className="text-xs text-muted">Business Strategy Intern</Text>
            </View>

            <View>
              <Text className="text-sm font-bold text-foreground mb-1">Skills</Text>
              <View className="h-px bg-border mb-2" />
              <View className="flex-row flex-wrap gap-1">
                <Tag label="Project Management" />
                <Tag label="Marketing" />
                <Tag label="Leadership" />
              </View>
            </View>
          </Card>
        </View>

        {/* Editing Tools */}
        <View className="px-6 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">Editing Tools</Text>

          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1">
              <Card className="items-center py-4">
                <IconSymbol name="doc.text" size={32} color={colors.primary} />
                <Text className="text-sm text-foreground mt-2">Text</Text>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1">
              <Card className="items-center py-4">
                <IconSymbol name="pencil" size={32} color={colors.primary} />
                <Text className="text-sm text-foreground mt-2">Format</Text>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1">
              <Card className="items-center py-4">
                <IconSymbol name="sparkles" size={32} color={colors.primary} />
                <Text className="text-sm text-foreground mt-2">AI Edit</Text>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 gap-3">
          <TouchableOpacity className="bg-primary rounded-2xl py-4 items-center">
            <Text className="text-surface font-bold text-base">Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-background rounded-2xl py-4 items-center border border-border">
            <Text className="text-foreground font-bold text-base">Export as PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
