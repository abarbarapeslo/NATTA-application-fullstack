import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
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
import { useFirebaseUser, firstNameFromUser } from "@/hooks/use-firebase-user";
import { useApplications } from "@/hooks/use-applications";
import { telemetry } from "@/lib/telemetry";
import type { ApplicationStatus, ApplicationWithDetails } from "@/types/natta-router";

const STATUSES: ApplicationStatus[] = [
  "Applied",
  "In Progress",
  "Accepted",
  "Rejected",
];

export default function HomeScreen() {
  const colors = useColors();
  const firebaseUser = useFirebaseUser();
  const firstName = firstNameFromUser(firebaseUser);

  const {
    applications,
    stats,
    status,
    refreshing,
    error,
    reload,
    refresh,
    updateStatus,
    removeApplication,
  } = useApplications();

  const [editOpen, setEditOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);

  useEffect(() => {
    telemetry.screen("home");
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const openEdit = (app: ApplicationWithDetails) => {
    setSelectedApp(app);
    setEditOpen(true);
  };

  const setNewStatus = async (s: ApplicationStatus) => {
    if (!selectedApp) return;
    try {
      await updateStatus(selectedApp.id, s);
      setEditOpen(false);
      setSelectedApp(null);
    } catch (err: any) {
      Alert.alert("Could not update status", err?.message ?? "Try again.");
    }
  };

  const confirmRemove = (app: ApplicationWithDetails) => {
    Alert.alert(
      "Remove application",
      `Remove your application to ${app.opportunity.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeApplication(app.id);
              setEditOpen(false);
              setSelectedApp(null);
            } catch (err: any) {
              Alert.alert("Could not remove", err?.message ?? "Try again.");
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
          <TouchableOpacity>
            <IconSymbol name="bell" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Welcome */}
        <View className="px-6 mb-6">
          <Text className="text-3xl font-bold text-foreground">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </Text>
        </View>

        {/* Metrics */}
        <View className="flex-row px-6 mb-3 gap-3">
          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">In Progress</Text>
            <Text className="text-3xl font-bold text-foreground">
              {stats.inProgress}
            </Text>
          </Card>
          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">Applied</Text>
            <Text className="text-3xl font-bold text-foreground">{stats.applied}</Text>
          </Card>
        </View>
        <View className="flex-row px-6 mb-6 gap-3">
          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">Accepted</Text>
            <Text className="text-3xl font-bold text-foreground">{stats.accepted}</Text>
          </Card>
          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">Rejected</Text>
            <Text className="text-3xl font-bold text-foreground">{stats.rejected}</Text>
          </Card>
        </View>

        {/* Applications List */}
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Your Applications</Text>
            <TouchableOpacity
              className="bg-primary rounded-full px-4 py-2"
              onPress={() => router.push("/(tabs)/search" as any)}
            >
              <Text className="text-surface font-semibold text-sm">
                + Browse opportunities
              </Text>
            </TouchableOpacity>
          </View>

          {status === "loading" && applications.length === 0 ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-3">Loading your applications...</Text>
            </View>
          ) : status === "error" ? (
            <Card className="p-6 items-center">
              <IconSymbol name="exclamationmark.triangle" size={32} color={colors.error} />
              <Text className="text-foreground mt-3 text-center">{error}</Text>
              <TouchableOpacity
                className="mt-4 bg-primary rounded-full px-5 py-2"
                onPress={reload}
              >
                <Text className="text-surface font-semibold">Try again</Text>
              </TouchableOpacity>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="p-6 items-center">
              <IconSymbol name="doc" size={48} color={colors.muted} />
              <Text className="text-muted mt-3 text-center">
                No applications yet. Tap &quot;Browse opportunities&quot; to find your
                first one.
              </Text>
            </Card>
          ) : (
            applications.map((app) => (
              <TouchableOpacity
                key={app.id}
                className="mb-3"
                onPress={() => openEdit(app)}
              >
                <Card className="p-4">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 pr-3">
                      <Text className="text-lg font-bold text-foreground mb-1">
                        {app.opportunity.title}
                      </Text>
                      {app.opportunity.organization && (
                        <Text className="text-sm text-muted">
                          {app.opportunity.organization}
                        </Text>
                      )}
                    </View>
                    <View
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: `${statusColor(app.status)}20` }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: statusColor(app.status) }}
                      >
                        {app.status}
                      </Text>
                    </View>
                  </View>
                  {app.opportunity.deadline && (
                    <Text className="text-xs text-muted">
                      Deadline:{" "}
                      {new Date(app.opportunity.deadline).toLocaleDateString()}
                    </Text>
                  )}
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Update Status Modal */}
      <Modal animationType="fade" transparent visible={editOpen}>
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-background rounded-2xl w-full max-w-md p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Update Status</Text>
              <TouchableOpacity onPress={() => setEditOpen(false)}>
                <Text className="text-2xl text-muted">×</Text>
              </TouchableOpacity>
            </View>

            {selectedApp && (
              <View className="mb-6">
                <Text className="text-base font-bold text-foreground mb-1">
                  {selectedApp.opportunity.title}
                </Text>
                {selectedApp.opportunity.organization && (
                  <Text className="text-sm text-muted mb-2">
                    {selectedApp.opportunity.organization}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => {
                    const id = selectedApp.opportunity.id;
                    setEditOpen(false);
                    router.push(`/opportunities/${id}` as any);
                  }}
                >
                  <Text className="text-primary text-sm font-semibold">
                    View opportunity →
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="mb-6 gap-2">
              {STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  className={`rounded-lg px-4 py-3 border ${
                    selectedApp?.status === s
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                  onPress={() => setNewStatus(s)}
                >
                  <Text
                    className={`text-base font-semibold ${
                      selectedApp?.status === s ? "text-white" : "text-foreground"
                    }`}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedApp && (
              <TouchableOpacity
                className="bg-surface border border-border rounded-full py-3 items-center mb-2"
                onPress={() => confirmRemove(selectedApp)}
              >
                <Text className="text-error font-semibold">Remove application</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="bg-surface border border-border rounded-full py-3 items-center"
              onPress={() => setEditOpen(false)}
            >
              <Text className="text-foreground font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
