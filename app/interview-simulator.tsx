import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useState } from "react";

export default function InterviewSimulatorScreen() {
  const colors = useColors();
  const [currentQuestion] = useState(1);
  const totalQuestions = 5;
  const [timeLeft] = useState("02:30");

  const question =
    "Tell me about a time when you faced a significant challenge in a team project. How did you handle it, and what was the outcome?";

  const tips = [
    "Use the STAR method (Situation, Task, Action, Result)",
    "Be specific with examples",
    "Keep your answer between 1-2 minutes",
    "Maintain eye contact with the camera",
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
              source={require("@/assets/images/logo.png")}
              style={{ width: 100, height: 28 }}
              resizeMode="contain"
            />
          </View>
          <View className="w-6" />
        </View>

        {/* Opportunity Card */}
        <View className="px-6 mb-4">
          <Card className="bg-primary/5">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center">
                <IconSymbol name="doc.text" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground">
                  Software Engineer - TechCorp
                </Text>
                <Text className="text-sm text-muted">Technical Interview</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Progress Indicator */}
        <View className="px-6 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-muted">
              Question {currentQuestion} of {totalQuestions}
            </Text>
            <Text className="text-sm font-bold text-primary">{timeLeft}</Text>
          </View>

          <View className="flex-row gap-2">
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <View
                key={index}
                className={`flex-1 h-1.5 rounded-full ${
                  index < currentQuestion ? "bg-primary" : "bg-background"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Question Card */}
        <View className="px-6 mb-4">
          <Card>
            <Text className="text-lg font-bold text-foreground mb-4">{question}</Text>

            <TouchableOpacity className="bg-primary rounded-2xl py-4 items-center mb-3">
              <View className="flex-row items-center gap-2">
                <IconSymbol name="mic.fill" size={20} color={colors.surface} />
                <Text className="text-surface font-bold text-base">Start Recording</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <Text className="text-muted text-sm">Skip Question</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Interview Tips */}
        <View className="px-6">
          <TouchableOpacity>
            <Card className="bg-warning/5">
              <View className="flex-row items-center gap-2 mb-3">
                <IconSymbol name="sparkles" size={20} color={colors.warning} />
                <Text className="text-base font-bold text-foreground">Interview Tips</Text>
              </View>

              {tips.map((tip, index) => (
                <View key={index} className="flex-row items-start gap-2 mb-2">
                  <View className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                  <Text className="text-sm text-foreground leading-5 flex-1">{tip}</Text>
                </View>
              ))}
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
