import { ScrollView, Text, View, TouchableOpacity, Linking, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOutGoogle } from "@/lib/google-signin";
import { unregisterCurrentDeviceToken } from "@/lib/push-register";
import { useTranslation } from "@/hooks/use-locale";

export default function MoreScreen() {
  const colors = useColors();
  const { t } = useTranslation();

  const handleAbout = async () => {
    const url = "https://natta.app";
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  };

  const handleSignOut = () => {
    const doSignOut = async () => {
      try {
        await unregisterCurrentDeviceToken();
      } catch {
        // best-effort before auth is cleared
      }
      try {
        await getFirebaseAuth().signOut();
      } catch {
        // best-effort
      }
      await signOutGoogle();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = "/auth/login";
      } else {
        router.replace("/auth/login" as any);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(t("more.signOutMessage"))) doSignOut();
      return;
    }

    Alert.alert(t("more.signOutTitle"), t("more.signOutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("more.signOut"), style: "destructive", onPress: doSignOut },
    ]);
  };

  const menuItems = [
    {
      id: 1,
      title: t("more.accountSettings"),
      description: t("more.accountSettingsDesc"),
      icon: "person.fill",
      onPress: () => router.push("/account-settings"),
    },
    {
      id: 2,
      title: t("more.notifications"),
      description: t("more.notificationsDesc"),
      icon: "bell",
      onPress: () => router.push("/notifications-settings"),
    },
    {
      id: 3,
      title: t("more.helpSupport"),
      description: t("more.helpSupportDesc"),
      icon: "ellipsis.circle",
      onPress: () => router.push("/help-support"),
    },
    {
      id: 4,
      title: t("more.aboutNatta"),
      description: t("more.aboutNattaDesc"),
      icon: "ellipsis.circle",
      onPress: handleAbout,
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-foreground">{t("more.title")}</Text>
          <Text className="text-sm text-muted mt-1">{t("more.subtitle")}</Text>
        </View>

        <View className="px-6">
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} className="mb-3" onPress={item.onPress}>
              <Card>
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-muted/10 rounded-full items-center justify-center">
                    <IconSymbol name={item.icon as any} size={24} color={colors.foreground} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground mb-1">{item.title}</Text>
                    <Text className="text-sm text-muted">{item.description}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          <View className="mt-4">
            <TouchableOpacity onPress={handleSignOut}>
              <Card className="bg-error/10 border-error/30">
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-error/10 rounded-full items-center justify-center">
                    <IconSymbol name="xmark" size={24} color={colors.error} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-error mb-1">{t("more.signOut")}</Text>
                    <Text className="text-sm text-muted">{t("more.signOutDesc")}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.error} />
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
