import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "@/hooks/use-locale";

interface NotificationSettings {
  deadlines: boolean;
  statusUpdates: boolean;
  newOpportunities: boolean;
  weeklyDigest: boolean;
  aiSuggestions: boolean;
  interviewReminders: boolean;
}

export default function NotificationsSettingsScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<NotificationSettings>({
    deadlines: true,
    statusUpdates: true,
    newOpportunities: true,
    weeklyDigest: false,
    aiSuggestions: true,
    interviewReminders: true,
  });

  useEffect(() => {
    AsyncStorage.getItem("notificationSettings")
      .then((saved) => {
        if (saved) setSettings(JSON.parse(saved));
      })
      .catch(() => {});
  }, []);

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings));
    } catch (err) {
      console.error("Error saving notification settings:", err);
    }
  };

  const notificationOptions = [
    {
      key: "deadlines" as keyof NotificationSettings,
      title: t("notifications.deadlines"),
      description: t("notifications.deadlinesDesc"),
      icon: "bell",
    },
    {
      key: "statusUpdates" as keyof NotificationSettings,
      title: t("notifications.statusUpdates"),
      description: t("notifications.statusUpdatesDesc"),
      icon: "bell",
    },
    {
      key: "newOpportunities" as keyof NotificationSettings,
      title: t("notifications.newOpportunities"),
      description: t("notifications.newOpportunitiesDesc"),
      icon: "bell",
    },
    {
      key: "weeklyDigest" as keyof NotificationSettings,
      title: t("notifications.weeklyDigest"),
      description: t("notifications.weeklyDigestDesc"),
      icon: "bell",
    },
    {
      key: "aiSuggestions" as keyof NotificationSettings,
      title: t("notifications.aiSuggestions"),
      description: t("notifications.aiSuggestionsDesc"),
      icon: "bell",
    },
    {
      key: "interviewReminders" as keyof NotificationSettings,
      title: t("notifications.interviewReminders"),
      description: t("notifications.interviewRemindersDesc"),
      icon: "bell",
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">{t("notifications.title")}</Text>
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-sm text-muted">{t("notifications.description")}</Text>
        </View>

        <View className="px-6">
          {notificationOptions.map((option, index) => (
            <View key={option.key} className={index < notificationOptions.length - 1 ? "mb-3" : ""}>
              <Card>
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                    <IconSymbol name={option.icon as any} size={20} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">{option.title}</Text>
                    <Text className="text-sm text-muted">{option.description}</Text>
                  </View>
                  <Switch
                    value={settings[option.key]}
                    onValueChange={(value) => updateSetting(option.key, value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              </Card>
            </View>
          ))}
        </View>

        <View className="px-6 mt-6">
          <View className="bg-primary/10 rounded-lg p-4">
            <View className="flex-row items-start gap-3">
              <IconSymbol name="ellipsis.circle" size={20} color={colors.primary} />
              <Text className="flex-1 text-sm text-foreground">{t("notifications.info")}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
