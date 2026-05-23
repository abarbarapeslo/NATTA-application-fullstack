import { ScrollView, Text, View, TouchableOpacity, Linking, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOutGoogle } from "@/lib/google-signin";

export default function MoreScreen() {
  const colors = useColors();

  const handleAbout = async () => {
    const url = "https://natta.app";
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleSignOut = () => {
    const doSignOut = async () => {
      try {
        await getFirebaseAuth().signOut();
      } catch {
        // best-effort: even if signOut throws, fall through to redirect
      }
      await signOutGoogle();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = "/auth/login";
      } else {
        router.replace("/auth/login" as any);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to sign out?")) {
        doSignOut();
      }
      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: doSignOut },
    ]);
  };

  const menuItems = [
    {
      id: 1,
      title: "Account Settings",
      description: "Manage your profile and preferences",
      icon: "person.fill",
      onPress: () => router.push("/account-settings"),
    },
    {
      id: 2,
      title: "Notifications",
      description: "Configure notification preferences",
      icon: "bell",
      onPress: () => router.push("/notifications-settings"),
    },
    {
      id: 3,
      title: "Help & Support",
      description: "Get help and contact support",
      icon: "ellipsis.circle",
      onPress: () => router.push("/help-support"),
    },
    {
      id: 4,
      title: "About Natta",
      description: "Learn more about Natta",
      icon: "ellipsis.circle",
      onPress: handleAbout,
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-foreground">More</Text>
          <Text className="text-sm text-muted mt-1">Explore all Natta features</Text>
        </View>

        {/* Menu Items */}
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

          {/* Sign Out Button */}
          <View className="mt-4">
            <TouchableOpacity onPress={handleSignOut}>
              <Card className="bg-error/10 border-error/30">
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-error/10 rounded-full items-center justify-center">
                    <IconSymbol name="xmark" size={24} color={colors.error} />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-bold text-error mb-1">Sign Out</Text>
                    <Text className="text-sm text-muted">Log out of your account</Text>
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
