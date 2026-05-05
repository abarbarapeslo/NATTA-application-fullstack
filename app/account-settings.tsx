import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AccountSettingsScreen() {
  const colors = useColors();
  const [email, setEmail] = useState("user@example.com");
  const [language, setLanguage] = useState("English");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("userEmail");
      const savedLanguage = await AsyncStorage.getItem("userLanguage");
      
      if (savedEmail) setEmail(savedEmail);
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveEmail = async () => {
    if (!newEmail.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }
    
    try {
      await AsyncStorage.setItem("userEmail", newEmail);
      setEmail(newEmail);
      setShowEmailModal(false);
      setNewEmail("");
      Alert.alert("Success", "Email updated successfully");
    } catch {
      Alert.alert("Error", "Failed to update email");
    }
  };

  const saveLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem("userLanguage", lang);
      setLanguage(lang);
      setShowLanguageModal(false);
      Alert.alert("Success", `Language changed to ${lang}`);
    } catch {
      Alert.alert("Error", "Failed to update language");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => Alert.alert("Account Deleted", "Your account has been deleted")
        }
      ]
    );
  };

  const languages = ["English", "Portuguese", "Spanish", "French", "German"];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Account Settings</Text>
          </View>
        </View>

        {/* Email Section */}
        <View className="px-6 mb-6">
          <Text className="text-sm font-semibold text-muted mb-3">ACCOUNT</Text>
          <TouchableOpacity onPress={() => setShowEmailModal(true)}>
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">Email</Text>
                  <Text className="text-sm text-muted">{email}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View className="px-6 mb-6">
          <Text className="text-sm font-semibold text-muted mb-3">PREFERENCES</Text>
          
          <TouchableOpacity onPress={() => setShowLanguageModal(true)}>
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">Language</Text>
                  <Text className="text-sm text-muted">{language}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="px-6">
          <Text className="text-sm font-semibold text-muted mb-3">DANGER ZONE</Text>
          <TouchableOpacity onPress={handleDeleteAccount}>
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-error">Delete Account</Text>
                <IconSymbol name="chevron.right" size={20} color={colors.error} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Email Modal */}
      <Modal visible={showEmailModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-surface rounded-2xl p-6 w-full max-w-sm" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xl font-bold text-foreground mb-4">Change Email</Text>
            
            <TextInput
              className="bg-background rounded-lg px-4 py-3 text-foreground mb-4"
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              placeholder="Enter new email"
              placeholderTextColor={colors.muted}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowEmailModal(false);
                  setNewEmail("");
                }}
                className="flex-1 bg-background rounded-lg py-3 items-center"
                style={{ backgroundColor: colors.background }}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveEmail}
                className="flex-1 rounded-lg py-3 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-surface rounded-2xl p-6 w-full max-w-sm" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xl font-bold text-foreground mb-4">Select Language</Text>
            
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => saveLanguage(lang)}
                className="py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-foreground">{lang}</Text>
                  {language === lang && (
                    <IconSymbol name="checkmark" size={20} color={colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowLanguageModal(false)}
              className="mt-4 bg-background rounded-lg py-3 items-center"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="text-foreground font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
