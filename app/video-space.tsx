import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useState } from "react";
import { useFirebaseUser, firstNameFromUser } from "@/hooks/use-firebase-user";

export default function VideoSpaceScreen() {
  const colors = useColors();
  const firebaseUser = useFirebaseUser();
  const firstName = firstNameFromUser(firebaseUser) || "there";
  const [isRecording, setIsRecording] = useState(false);
  const [timer] = useState("00:00");

  const yourVideos = [
    {
      id: 1,
      title: "MIT Pitch Video",
      duration: "02:30",
      date: "Oct 20, 2024",
    },
    {
      id: 2,
      title: "Introduction Video",
      duration: "01:45",
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
          <TouchableOpacity>
            <IconSymbol name="pencil" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Camera Preview */}
        <View className="px-6 mb-4">
          <Card className="aspect-video bg-background items-center justify-center">
            <IconSymbol name="video.fill" size={64} color={colors.muted} />
            <Text className="text-sm text-muted mt-2">Camera Preview</Text>
          </Card>
        </View>

        {/* Teleprompter */}
        <View className="px-6 mb-4">
          <Card>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-bold text-foreground">Teleprompter</Text>
              <TouchableOpacity>
                <IconSymbol name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-muted leading-5">
              {`Hello, my name is ${firstName} and I'm excited to introduce myself. Tap the pencil to write your own teleprompter script...`}
            </Text>
          </Card>
        </View>

        {/* Recording Controls */}
        <View className="px-6 mb-6">
          <Card>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity className="w-12 h-12 bg-background rounded-full items-center justify-center">
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>

              <TouchableOpacity
                className={`w-20 h-20 rounded-full items-center justify-center ${
                  isRecording ? "bg-error" : "bg-primary"
                }`}
                onPress={() => setIsRecording(!isRecording)}
              >
                <View
                  className={`w-8 h-8 ${
                    isRecording ? "bg-surface" : "bg-surface rounded-full"
                  }`}
                />
              </TouchableOpacity>

              <View className="items-center">
                <Text className="text-lg font-bold text-foreground">{timer}</Text>
                <Text className="text-xs text-muted">Timer</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Your Videos */}
        <View className="px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Your Videos</Text>

          {yourVideos.map((video) => (
            <TouchableOpacity key={video.id} className="mb-3">
              <Card>
                <View className="flex-row items-center gap-4">
                  <View className="w-20 h-20 bg-background rounded-xl items-center justify-center">
                    <IconSymbol name="video.fill" size={32} color={colors.foreground} />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground mb-1">{video.title}</Text>
                    <Text className="text-sm text-muted">
                      {video.duration} • {video.date}
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity className="w-10 h-10 bg-primary rounded-full items-center justify-center">
                      <IconSymbol name="paperplane.fill" size={18} color={colors.surface} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
