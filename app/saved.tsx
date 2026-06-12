import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useEffect } from "react";
import { useSavedOpportunities } from "@/hooks/use-opportunities";
import { useApplications } from "@/hooks/use-applications";
import { NattaApiError } from "@/lib/natta-api";
import { telemetry } from "@/lib/telemetry";

function formatDeadline(d: Date | null | undefined): string {
  if (!d) return "No deadline";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function SavedScreen() {
  const colors = useColors();
  const { saved, status, reload, unsave } = useSavedOpportunities();
  const { applyToOpportunity } = useApplications();

  useEffect(() => {
    telemetry.screen("saved");
  }, []);

  const handleApply = async (opportunityId: number, title: string) => {
    try {
      await applyToOpportunity({ opportunityId });
      telemetry.event("opportunity_apply", { opportunity_id: opportunityId, source: "saved" });
      Alert.alert("Application created", `You applied to ${title}.`);
    } catch (err) {
      const message =
        err instanceof NattaApiError ? err.message : "Could not apply.";
      Alert.alert("Could not apply", message);
    }
  };

  const handleUnsave = (opportunityId: number, title: string) => {
    Alert.alert("Remove from saved", `Remove ${title} from your saved list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await unsave(opportunityId);
          } catch {
            Alert.alert("Could not remove", "Try again in a moment.");
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Image
              source={require("@/assets/images/natta_icon.png")}
              style={{ width: 100, height: 28 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="px-6 mb-4">
          <Text className="text-3xl font-bold text-foreground mb-2">Saved</Text>
          <Text className="text-base text-muted">
            Opportunities you bookmarked to apply to later
          </Text>
        </View>

        <View className="px-6">
          {status === "loading" && saved.length === 0 ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-3">Loading saved opportunities...</Text>
            </View>
          ) : status === "error" ? (
            <Card className="p-6 items-center">
              <IconSymbol
                name="exclamationmark.triangle"
                size={32}
                color={colors.error}
              />
              <Text className="text-foreground mt-3 text-center">
                Could not load saved opportunities.
              </Text>
              <TouchableOpacity
                className="mt-4 bg-primary rounded-full px-5 py-2"
                onPress={reload}
              >
                <Text className="text-surface font-semibold">Try again</Text>
              </TouchableOpacity>
            </Card>
          ) : saved.length === 0 ? (
            <Card className="p-6 items-center">
              <IconSymbol name="bookmark" size={40} color={colors.muted} />
              <Text className="text-muted mt-3 text-center">
                No saved opportunities yet.
              </Text>
              <TouchableOpacity
                className="mt-4 bg-primary rounded-full px-5 py-2"
                onPress={() => router.push("/opportunities" as any)}
              >
                <Text className="text-surface font-semibold">Browse opportunities</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            saved.map((item) => {
              const opp = item.opportunity;
              if (!opp) {
                return (
                  <Card key={item.id} className="mb-3 p-4">
                    <Text className="text-muted">
                      Opportunity #{item.opportunityId} (details unavailable)
                    </Text>
                  </Card>
                );
              }
              return (
                <Card key={item.id} className="mb-3">
                  <Text className="text-lg font-bold text-foreground mb-1">
                    {opp.title}
                  </Text>
                  {opp.organization && (
                    <Text className="text-sm text-muted mb-2">
                      {opp.organization}
                    </Text>
                  )}
                  {opp.description && (
                    <Text
                      className="text-sm text-foreground mb-3"
                      numberOfLines={3}
                    >
                      {opp.description}
                    </Text>
                  )}
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {opp.type && <Tag label={opp.type} />}
                    {opp.field && <Tag label={opp.field} />}
                    {opp.region && <Tag label={opp.region} />}
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-muted">
                      Deadline: {formatDeadline(opp.deadline)}
                    </Text>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className="bg-surface border border-border rounded-full px-3 py-2"
                        onPress={() => handleUnsave(opp.id, opp.title)}
                      >
                        <IconSymbol
                          name="bookmark.fill"
                          size={16}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-primary rounded-full px-4 py-2"
                        onPress={() => handleApply(opp.id, opp.title)}
                      >
                        <Text className="text-surface font-semibold text-sm">
                          Apply
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
