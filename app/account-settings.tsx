import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { getFirebaseAuth } from "@/lib/firebase";
import { useFirebaseUser, nicknameFromUser, refreshFirebaseUserProfile } from "@/hooks/use-firebase-user";
import { useTranslation } from "@/hooks/use-locale";
import type { LocaleId } from "@/lib/i18n";

const LANGUAGE_OPTIONS: { locale: LocaleId; labelKey: "language.portuguese" | "language.english" }[] = [
  { locale: "pt-BR", labelKey: "language.portuguese" },
  { locale: "en", labelKey: "language.english" },
];

export default function AccountSettingsScreen() {
  const colors = useColors();
  const { t, locale, setLocale, languageLabel } = useTranslation();
  const firebaseUser = useFirebaseUser();
  const email = firebaseUser?.email ?? "—";

  const [name, setName] = useState(() => nicknameFromUser(firebaseUser));
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    setName(nicknameFromUser(firebaseUser));
  }, [firebaseUser]);

  const openNameModal = () => {
    setNewName(name);
    setShowNameModal(true);
  };

  const saveName = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert(t("common.error"), t("account.invalidNickname"));
      return;
    }
    setSavingName(true);
    try {
      await getFirebaseAuth().currentUser?.updateProfile({ displayName: trimmed });
      await refreshFirebaseUserProfile();
      setName(trimmed);
      setShowNameModal(false);
      setNewName("");
      Alert.alert(t("common.success"), t("account.nicknameUpdated"));
    } catch {
      Alert.alert(t("common.error"), t("account.nicknameUpdateFailed"));
    } finally {
      setSavingName(false);
    }
  };

  const saveLanguage = async (nextLocale: LocaleId, label: string) => {
    try {
      await setLocale(nextLocale);
      setShowLanguageModal(false);
      Alert.alert(t("common.success"), t("account.languageChanged", { language: label }));
    } catch {
      Alert.alert(t("common.error"), t("account.languageUpdateFailed"));
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(t("account.deleteAccountTitle"), t("account.deleteAccountMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("account.deleteAccount"),
        style: "destructive",
        onPress: () => Alert.alert(t("common.success"), t("account.deleteAccountDone")),
      },
    ]);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">{t("account.title")}</Text>
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-sm font-semibold text-muted mb-3">{t("account.sectionAccount")}</Text>

          <TouchableOpacity onPress={openNameModal}>
            <Card className="mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {t("account.nickname")}
                  </Text>
                  <Text className="text-sm text-muted">{name || "—"}</Text>
                </View>
                <IconSymbol name="pencil" size={18} color={colors.muted} />
              </View>
            </Card>
          </TouchableOpacity>

          <Card>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground mb-1">{t("account.email")}</Text>
              <Text className="text-sm text-muted">{email}</Text>
            </View>
          </Card>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-sm font-semibold text-muted mb-3">{t("account.preferences")}</Text>

          <TouchableOpacity onPress={() => setShowLanguageModal(true)}>
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {t("account.language")}
                  </Text>
                  <Text className="text-sm text-muted">{languageLabel}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        <View className="px-6">
          <Text className="text-sm font-semibold text-muted mb-3">{t("account.dangerZone")}</Text>
          <TouchableOpacity onPress={handleDeleteAccount}>
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-error">{t("account.deleteAccount")}</Text>
                <IconSymbol name="chevron.right" size={20} color={colors.error} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showNameModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-surface rounded-2xl p-6 w-full max-w-sm" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xl font-bold text-foreground mb-4">{t("account.changeNickname")}</Text>

            <TextInput
              className="bg-background rounded-lg px-4 py-3 text-foreground mb-4"
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              placeholder={t("account.nicknamePlaceholder")}
              placeholderTextColor={colors.muted}
              value={newName}
              onChangeText={setNewName}
              autoCapitalize="words"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowNameModal(false);
                  setNewName("");
                }}
                className="flex-1 bg-background rounded-lg py-3 items-center"
                style={{ backgroundColor: colors.background }}
              >
                <Text className="text-foreground font-semibold">{t("common.cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveName}
                disabled={savingName}
                className="flex-1 rounded-lg py-3 items-center"
                style={{ backgroundColor: colors.primary, opacity: savingName ? 0.6 : 1 }}
              >
                <Text className="text-white font-semibold">
                  {savingName ? "…" : t("common.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showLanguageModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-surface rounded-2xl p-6 w-full max-w-sm" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xl font-bold text-foreground mb-4">{t("account.selectLanguage")}</Text>

            {LANGUAGE_OPTIONS.map(({ locale: loc, labelKey }) => {
              const label = t(labelKey);
              return (
                <TouchableOpacity
                  key={loc}
                  onPress={() => saveLanguage(loc, label)}
                  className="py-3 border-b"
                  style={{ borderBottomColor: colors.border }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-foreground">{label}</Text>
                    {locale === loc && (
                      <IconSymbol name="checkmark" size={20} color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setShowLanguageModal(false)}
              className="mt-4 bg-background rounded-lg py-3 items-center"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="text-foreground font-semibold">{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
