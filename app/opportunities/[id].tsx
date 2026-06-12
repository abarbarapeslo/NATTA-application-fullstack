import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useApplications } from "@/hooks/use-applications";
import {
  opportunities as nattaOpportunities,
  savedOpportunities as nattaSaved,
  NattaApiError,
} from "@/lib/natta-api";
import { telemetry } from "@/lib/telemetry";
import type { Opportunity } from "@/types/natta-router";

function formatDeadline(d: Date | null): string {
  if (!d) return "No deadline";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function OpportunityDetailScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);

  const { applyToOpportunity } = useApplications();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const [applyOpen, setApplyOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [programStart, setProgramStart] = useState("");
  const [programEnd, setProgramEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        const [detail, isSaved] = await Promise.all([
          nattaOpportunities.getById(id),
          nattaSaved.isSaved(id).catch(() => false),
        ]);
        if (cancelled) return;
        if (!detail) {
          setError("Opportunity not found.");
          setStatus("error");
          return;
        }
        setOpp(detail);
        setSaved(isSaved);
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

  const toggleSave = async () => {
    if (!opp) return;
    setSaving(true);
    try {
      if (saved) {
        await nattaSaved.unsave(opp.id);
        setSaved(false);
      } else {
        await nattaSaved.save(opp.id);
        setSaved(true);
        telemetry.event("opportunity_save", { opportunity_id: opp.id, source: "detail" });
      }
    } catch (err) {
      const message = err instanceof NattaApiError ? err.message : "Try again.";
      Alert.alert("Could not update saved list", message);
    } finally {
      setSaving(false);
    }
  };

  const openOriginal = async () => {
    if (!opp?.url) return;
    try {
      await Linking.openURL(opp.url);
    } catch {
      Alert.alert("Could not open link", "The URL may be invalid.");
    }
  };

  const parseDate = (s: string): Date | undefined => {
    if (!s.trim()) return undefined;
    const t = Date.parse(s);
    return Number.isNaN(t) ? undefined : new Date(t);
  };

  const submitApply = async () => {
    if (!opp) return;
    setSubmitting(true);
    try {
      await applyToOpportunity({
        opportunityId: opp.id,
        notes: notes.trim() || undefined,
        programStartDate: parseDate(programStart),
        programEndDate: parseDate(programEnd),
      });
      telemetry.event("opportunity_apply", { opportunity_id: opp.id, source: "detail" });
      setApplyOpen(false);
      Alert.alert("Application created", `You applied to ${opp.title}.`);
    } catch (err) {
      const message = err instanceof NattaApiError ? err.message : "Try again.";
      Alert.alert("Could not apply", message);
    } finally {
      setSubmitting(false);
    }
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

  const allTags = [opp.field, opp.stage, opp.mode, opp.region].filter(
    (s): s is string => Boolean(s),
  );

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
          <TouchableOpacity onPress={toggleSave} disabled={saving}>
            <IconSymbol
              name={saved ? "bookmark.fill" : "bookmark"}
              size={26}
              color={saved ? colors.primary : colors.foreground}
            />
          </TouchableOpacity>
        </View>

        {/* Title block */}
        <View className="px-6 mb-4">
          {opp.type && (
            <View className="self-start mb-3">
              <Tag label={opp.type} variant="primary" />
            </View>
          )}
          <Text className="text-2xl font-bold text-foreground mb-2">{opp.title}</Text>
          {opp.organization && (
            <Text className="text-base text-muted">{opp.organization}</Text>
          )}
        </View>

        {/* Meta */}
        <View className="px-6 mb-4">
          <Card>
            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <IconSymbol name="calendar" size={18} color={colors.muted} />
                <Text className="text-sm text-foreground">
                  Deadline: {formatDeadline(opp.deadline)}
                </Text>
              </View>
              {opp.region && (
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
                  <Text className="text-sm text-foreground">{opp.region}</Text>
                </View>
              )}
              {opp.funding && (
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="sparkles" size={18} color={colors.primary} />
                  <Text className="text-sm font-semibold text-primary">
                    {opp.funding}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Description */}
        {opp.description && (
          <View className="px-6 mb-4">
            <Text className="text-base font-bold text-foreground mb-2">About</Text>
            <Card>
              <Text className="text-sm text-foreground leading-6">
                {opp.description}
              </Text>
            </Card>
          </View>
        )}

        {/* Tags */}
        {allTags.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-base font-bold text-foreground mb-2">Details</Text>
            <View className="flex-row flex-wrap gap-2">
              {allTags.map((tag, idx) => (
                <Tag key={`${tag}-${idx}`} label={tag} />
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="px-6 gap-3">
          <TouchableOpacity
            className="bg-primary rounded-full py-4 items-center"
            onPress={() => setApplyOpen(true)}
          >
            <Text className="text-surface font-bold text-base">Apply</Text>
          </TouchableOpacity>

          {opp.url && (
            <TouchableOpacity
              className="bg-surface border border-border rounded-full py-4 items-center flex-row justify-center gap-2"
              onPress={openOriginal}
            >
              <IconSymbol name="paperplane.fill" size={18} color={colors.foreground} />
              <Text className="text-foreground font-semibold">Open original page</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Apply Modal */}
      <Modal visible={applyOpen} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-background rounded-3xl w-full max-w-md max-h-[85%]">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">
                Apply to {opp.title}
              </Text>
            </View>
            <ScrollView className="px-6 py-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Notes</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4 min-h-[90px]"
                value={notes}
                onChangeText={setNotes}
                placeholder="Any notes about why you're applying or context to remember later..."
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
              />

              <Text className="text-sm font-semibold text-foreground mb-2">
                Program start date
              </Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={programStart}
                onChangeText={setProgramStart}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor={colors.muted}
              />

              <Text className="text-sm font-semibold text-foreground mb-2">
                Program end date
              </Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={programEnd}
                onChangeText={setProgramEnd}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor={colors.muted}
              />

              <Text className="text-xs text-muted">
                You can update or remove this application later from the home screen.
              </Text>
            </ScrollView>
            <View className="flex-row gap-3 px-6 py-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl py-3 items-center"
                onPress={() => setApplyOpen(false)}
                disabled={submitting}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={submitApply}
                disabled={submitting}
                style={{ opacity: submitting ? 0.6 : 1 }}
              >
                <Text className="text-surface font-semibold">
                  {submitting ? "Applying..." : "Apply"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
