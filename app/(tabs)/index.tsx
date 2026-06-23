import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { useFirebaseUser, nicknameFromUser, notifyUserProfileChanged } from "@/hooks/use-firebase-user";
import { useTranslation } from "@/hooks/use-locale";
import { translateApplicationStatus } from "@/lib/i18n";
import { useApplications } from "@/hooks/use-applications";
import { telemetry } from "@/lib/telemetry";
import { formatDeadline } from "@/lib/opportunity-format";
import { OpportunityDetailView } from "@/components/opportunity-detail-view";
import { opportunities as nattaOpportunities } from "@/lib/natta-api";
import type {
  ApplicationStatus,
  ApplicationWithDetails,
  Opportunity,
} from "@/types/natta-router";

const STATUSES: ApplicationStatus[] = [
  "Applied",
  "In Progress",
  "Accepted",
  "Rejected",
];

export default function HomeScreen() {
  const colors = useColors();
  const { t, locale } = useTranslation();
  const firebaseUser = useFirebaseUser();
  const nickname = nicknameFromUser(firebaseUser);

  const {
    applications,
    stats,
    status,
    refreshing,
    error,
    reload,
    refresh,
    silentRefresh,
    updateStatus,
    removeApplication,
  } = useApplications();

  const [editOpen, setEditOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  // Fetched on demand when the application from the API came back without
  // a nested opportunity (no join on the backend side).
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [loadingOpp, setLoadingOpp] = useState(false);

  useEffect(() => {
    telemetry.screen("home");
  }, []);

  // Silent refresh on focus: applications may have changed in the detail
  // screen (Mark as applied / Unmark). No spinner — UI stays still.
  useFocusEffect(
    useCallback(() => {
      notifyUserProfileChanged();
      silentRefresh();
    }, [silentRefresh]),
  );

  const openEdit = (app: ApplicationWithDetails) => {
    setSelectedApp(app);
    setEditOpen(true);
    // The list endpoint returns a flat subset of the opportunity (title,
    // organizer, deadline, type). For the full detail view inside the
    // modal we still need description/requirements/benefits/link, so we
    // fetch the complete opportunity on demand.
    setSelectedOpp(null);
    setLoadingOpp(true);
    nattaOpportunities
      .getById(app.opportunityId)
      .then((opp) => {
        setSelectedOpp(opp ?? null);
      })
      .catch((err) => {
        console.warn("[home] could not load opportunity for app", app.id, err);
      })
      .finally(() => setLoadingOpp(false));
  };

  const setNewStatus = async (s: ApplicationStatus) => {
    if (!selectedApp) return;
    try {
      await updateStatus(selectedApp.id, s);
      setEditOpen(false);
      setSelectedApp(null);
    } catch (err: any) {
      Alert.alert(t("home.couldNotUpdateStatus"), err?.message ?? t("common.tryAgain"));
    }
  };

  const confirmRemove = (app: ApplicationWithDetails) => {
    Alert.alert(
      t("home.removeApplicationTitle"),
      t("home.removeApplicationMessage", { title: app.title }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("home.removeApplication"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeApplication(app.id);
              setEditOpen(false);
              setSelectedApp(null);
            } catch (err: any) {
              Alert.alert(t("home.couldNotRemove"), err?.message ?? t("common.tryAgain"));
            }
          },
        },
      ],
    );
  };

  const statusColor = (s: ApplicationStatus) => {
    switch (s) {
      case "In Progress":
        return colors.primary;
      case "Applied":
        return colors.warning;
      case "Accepted":
        return colors.success;
      case "Rejected":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Image
            source={require("@/assets/images/natta_icon.png")}
            style={{ width: 120, height: 32 }}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={() => router.push("/notifications-settings" as any)}>
            <IconSymbol name="bell" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Welcome */}
        <View className="px-6 mb-6">
          <Text className="text-3xl font-bold text-foreground">
            {nickname ? t("home.welcomeNamed", { name: nickname }) : t("home.welcome")}
          </Text>
        </View>

        {/* Metrics */}
        <View className="flex-row px-6 mb-3 gap-3">
          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">{t("home.inProgress")}</Text>
            <Text className="text-3xl font-bold text-foreground">
              {stats.inProgress}
            </Text>
          </Card>
          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">{t("home.applied")}</Text>
            <Text className="text-3xl font-bold text-foreground">{stats.applied}</Text>
          </Card>
        </View>
        <View className="flex-row px-6 mb-6 gap-3">
          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">{t("home.accepted")}</Text>
            <Text className="text-3xl font-bold text-foreground">{stats.accepted}</Text>
          </Card>
          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">{t("home.rejected")}</Text>
            <Text className="text-3xl font-bold text-foreground">{stats.rejected}</Text>
          </Card>
        </View>

        {/* Applications List */}
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">{t("home.yourApplications")}</Text>
            <TouchableOpacity
              className="bg-primary rounded-full px-4 py-2"
              onPress={() => router.push("/(tabs)/search" as any)}
            >
              <Text className="text-surface font-semibold text-sm">
                {t("home.browseOpportunities")}
              </Text>
            </TouchableOpacity>
          </View>

          {status === "loading" && applications.length === 0 ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-3">{t("home.loadingApplications")}</Text>
            </View>
          ) : status === "error" ? (
            <Card className="p-6 items-center">
              <IconSymbol name="exclamationmark.triangle" size={32} color={colors.error} />
              <Text className="text-foreground mt-3 text-center">{error}</Text>
              <TouchableOpacity
                className="mt-4 bg-primary rounded-full px-5 py-2"
                onPress={reload}
              >
                <Text className="text-surface font-semibold">{t("common.tryAgain")}</Text>
              </TouchableOpacity>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="p-6 items-center">
              <IconSymbol name="doc" size={48} color={colors.muted} />
              <Text className="text-muted mt-3 text-center">
                {t("home.noApplications")}
              </Text>
            </Card>
          ) : (
            applications.map((app) => (
              <View key={app.id} className="mb-3">
                <Pressable
                  onPress={() => openEdit(app)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.6 : 1,
                    borderRadius: 12,
                  })}
                >
                  <Card className="p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1 pr-3">
                        <Text className="text-lg font-bold text-foreground mb-1">
                          {app.title}
                        </Text>
                        {app.organizer && (
                          <Text className="text-sm text-muted">
                            {app.organizer}
                          </Text>
                        )}
                      </View>
                      <View
                        className="rounded-full px-3 py-1"
                        style={{
                          backgroundColor: `${statusColor(app.status)}20`,
                        }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: statusColor(app.status) }}
                        >
                          {translateApplicationStatus(locale, app.status)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-muted">
                      {t("home.deadline")}: {formatDeadline(app.deadline)}
                    </Text>
                  </Card>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Application Detail Modal — full-screen view of the underlying
          opportunity + status/remove actions for the application.
          Rendered conditionally so that when closed it doesn't sit in the
          tree intercepting Android touches. */}
      {editOpen && (
      <Modal
        animationType="slide"
        transparent={false}
        visible={true}
        onRequestClose={() => setEditOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 32 }}>
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
            <TouchableOpacity
              onPress={() => setEditOpen(false)}
              className="flex-row items-center gap-2"
            >
              <IconSymbol name="xmark" size={22} color={colors.foreground} />
              <Text className="text-foreground font-semibold">{t("common.close")}</Text>
            </TouchableOpacity>
            <Text className="text-foreground font-semibold">{t("home.application")}</Text>
            <View className="w-16" />
          </View>

          {selectedApp ? (
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
              <View className="px-6 pt-4 pb-2">
                <View
                  className="self-start rounded-full px-3 py-1 mb-3"
                  style={{
                    backgroundColor: `${statusColor(selectedApp.status)}20`,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: statusColor(selectedApp.status) }}
                  >
                    {translateApplicationStatus(locale, selectedApp.status)}
                  </Text>
                </View>
              </View>

              {selectedOpp ? (
                <OpportunityDetailView opportunity={selectedOpp} />
              ) : loadingOpp ? (
                <View className="py-10 items-center">
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text className="text-muted mt-3">{t("home.loadingOpportunity")}</Text>
                </View>
              ) : (
                <View className="py-10 items-center px-6">
                  <Text className="text-muted text-center">
                    {t("home.couldNotLoadOpportunity")}
                  </Text>
                </View>
              )}

              {/* Status management */}
              <View className="px-6 mt-4">
                <Text className="text-base font-bold text-foreground mb-3">
                  {t("home.updateStatus")}
                </Text>
                <View className="gap-2">
                  {STATUSES.map((s) => (
                    <TouchableOpacity
                      key={s}
                      className={`rounded-lg px-4 py-3 border ${
                        selectedApp.status === s
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                      onPress={() => setNewStatus(s)}
                    >
                      <Text
                        className={`text-base font-semibold ${
                          selectedApp.status === s
                            ? "text-white"
                            : "text-foreground"
                        }`}
                      >
                        {translateApplicationStatus(locale, s)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  className="bg-surface border border-border rounded-full py-3 items-center mt-4"
                  onPress={() => confirmRemove(selectedApp)}
                >
                  <Text className="text-error font-semibold">
                    {t("home.removeApplication")}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-muted">{t("home.noApplicationSelected")}</Text>
            </View>
          )}
        </View>
      </Modal>
      )}
    </ScreenContainer>
  );
}
