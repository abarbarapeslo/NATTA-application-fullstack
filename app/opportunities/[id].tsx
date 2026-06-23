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
import { IconSymbol } from "@/components/ui/icon-symbol";
import { OpportunityDetailView } from "@/components/opportunity-detail-view";
import { useColors } from "@/hooks/use-colors";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useApplications } from "@/hooks/use-applications";
import {
  opportunities as nattaOpportunities,
  NattaApiError,
} from "@/lib/natta-api";
import { telemetry } from "@/lib/telemetry";
import type { Opportunity } from "@/types/natta-router";

export default function OpportunityDetailScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);

  const {
    applications,
    applyToOpportunity,
    removeApplication,
    reload: reloadApplications,
  } = useApplications();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  const existingApplication = useMemo(
    () => applications.find((a) => a.opportunityId === id) ?? null,
    [applications, id],
  );

  useEffect(() => {
    telemetry.screen("opportunity_detail");
    if (!Number.isFinite(id)) {
      setError("Invalid opportunity id.");
      setStatus("error");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const detail = await nattaOpportunities.getById(id);
        if (cancelled) return;
        if (!detail) {
          setError("Opportunity not found.");
          setStatus("error");
          return;
        }
        setOpp(detail);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof NattaApiError ? err.message : "Could not load.");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Saved/bookmark removed by product decision: tracking happens only via
  // "I applied — track it" → shows up in Your Applications on Home.

  const markAsApplied = async () => {
    if (!opp) return;
    setMarking(true);
    try {
      await applyToOpportunity({ opportunityId: opp.id });
      telemetry.event("opportunity_mark_applied", { opportunity_id: opp.id });
      Alert.alert(
        "Marked as applied",
        `${opp.title} is now in Your Applications on the home screen.`,
      );
    } catch (err) {
      const message = err instanceof NattaApiError ? err.message : "Try again.";
      Alert.alert("Could not mark as applied", message);
    } finally {
      setMarking(false);
    }
  };

  const unmarkApplied = async () => {
    if (!existingApplication) return;
    Alert.alert(
      "Remove from Your Applications",
      "This won't undo your real application on the site.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setMarking(true);
            try {
              await removeApplication(existingApplication.id);
              await reloadApplications();
            } catch (err) {
              const message =
                err instanceof NattaApiError ? err.message : "Try again.";
              Alert.alert("Could not remove", message);
            } finally {
              setMarking(false);
            }
          },
        },
      ],
    );
  };

  if (status === "loading") {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (status === "error" || !opp) {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <IconSymbol name="exclamationmark.triangle" size={40} color={colors.error} />
          <Text className="text-foreground mt-3 text-center">
            {error ?? "Something went wrong."}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Image
            source={require("@/assets/images/natta_icon.png")}
            style={{ width: 100, height: 28 }}
            resizeMode="contain"
          />
          <View style={{ width: 24 }} />
        </View>

        {/* Already-applied banner */}
        {existingApplication && (
          <View className="px-6 mb-4">
            <Card className="bg-success/10 border border-success/30">
              <View className="flex-row items-center gap-3">
                <IconSymbol
                  name="checkmark.circle"
                  size={22}
                  color={colors.success}
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    Marked as applied
                  </Text>
                  <Text className="text-xs text-muted">
                    Tracked in Your Applications on the home screen.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        <OpportunityDetailView opportunity={opp} />

        {/* Mark / Unmark applied */}
        <View className="px-6 mt-3">
          {existingApplication ? (
            <TouchableOpacity
              className="bg-surface border border-border rounded-full py-4 items-center flex-row justify-center gap-2"
              onPress={unmarkApplied}
              disabled={marking}
              style={{ opacity: marking ? 0.6 : 1 }}
            >
              <IconSymbol name="xmark" size={16} color={colors.foreground} />
              <Text className="text-foreground font-semibold">
                {marking ? "Updating..." : "Unmark as applied"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-surface border border-border rounded-full py-4 items-center flex-row justify-center gap-2"
              onPress={markAsApplied}
              disabled={marking}
              style={{ opacity: marking ? 0.6 : 1 }}
            >
              <IconSymbol name="checkmark" size={16} color={colors.foreground} />
              <Text className="text-foreground font-semibold">
                {marking ? "Saving..." : "I applied — track it"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
