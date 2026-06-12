import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { useApplications } from "@/hooks/use-applications";
import { savedOpportunities as nattaSaved, NattaApiError } from "@/lib/natta-api";
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

export default function OpportunitiesScreen() {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const filters = useMemo(
    () => (search.trim() ? { search: search.trim() } : undefined),
    [search],
  );
  const { opportunities, status, error, reload } = useOpportunities(filters);
  const { applyToOpportunity } = useApplications();

  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [programStart, setProgramStart] = useState("");
  const [programEnd, setProgramEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    telemetry.screen("opportunities");
  }, []);

  const openApply = (opp: Opportunity) => {
    setSelected(opp);
    setNotes("");
    setProgramStart("");
    setProgramEnd("");
    setApplyOpen(true);
  };

  const parseDate = (s: string): Date | undefined => {
    if (!s.trim()) return undefined;
    const t = Date.parse(s);
    return Number.isNaN(t) ? undefined : new Date(t);
  };

  const submitApply = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await applyToOpportunity({
        opportunityId: selected.id,
        notes: notes.trim() || undefined,
        programStartDate: parseDate(programStart),
        programEndDate: parseDate(programEnd),
      });
      telemetry.event("opportunity_apply", { opportunity_id: selected.id });
      setApplyOpen(false);
      Alert.alert("Application created", `You applied to ${selected.title}.`);
    } catch (err) {
      const message =
        err instanceof NattaApiError ? err.message : "Could not submit application.";
      Alert.alert("Could not apply", message);
    } finally {
      setSubmitting(false);
    }
  };

  const saveOne = async (opp: Opportunity) => {
    setSavingId(opp.id);
    try {
      await nattaSaved.save(opp.id);
      telemetry.event("opportunity_save", { opportunity_id: opp.id });
      Alert.alert("Saved", `${opp.title} added to your saved list.`);
    } catch (err) {
      const message = err instanceof NattaApiError ? err.message : "Could not save.";
      Alert.alert("Could not save", message);
    } finally {
      setSavingId(null);
    }
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
          <Text className="text-3xl font-bold text-foreground mb-2">Opportunities</Text>
          <Text className="text-base text-muted">
            Browse and apply to NATTA opportunities
          </Text>
        </View>

        {/* Search */}
        <View className="px-6 mb-4">
          <Card>
            <View className="flex-row items-center gap-3">
              <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder="Search opportunities..."
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <IconSymbol name="xmark" size={18} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        </View>

        {/* List */}
        <View className="px-6">
          {status === "loading" && opportunities.length === 0 ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-3">Loading opportunities...</Text>
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
          ) : opportunities.length === 0 ? (
            <Card className="p-6 items-center">
              <IconSymbol name="doc" size={40} color={colors.muted} />
              <Text className="text-muted mt-3 text-center">
                No opportunities found.
              </Text>
            </Card>
          ) : (
            opportunities.map((opp) => (
              <Card key={opp.id} className="mb-3">
                <Text className="text-lg font-bold text-foreground mb-1">{opp.title}</Text>
                {opp.organization && (
                  <Text className="text-sm text-muted mb-2">{opp.organization}</Text>
                )}
                {opp.description && (
                  <Text className="text-sm text-foreground mb-3" numberOfLines={3}>
                    {opp.description}
                  </Text>
                )}
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {opp.type && <Tag label={opp.type} />}
                  {opp.field && <Tag label={opp.field} />}
                  {opp.region && <Tag label={opp.region} />}
                  {opp.mode && <Tag label={opp.mode} />}
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-muted">
                    Deadline: {formatDeadline(opp.deadline)}
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => saveOne(opp)}
                      disabled={savingId === opp.id}
                      className="bg-surface border border-border rounded-full px-3 py-2"
                    >
                      <IconSymbol name="bookmark" size={16} color={colors.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => openApply(opp)}
                      className="bg-primary rounded-full px-4 py-2"
                    >
                      <Text className="text-surface font-semibold text-sm">Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Apply Modal */}
      <Modal visible={applyOpen} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-background rounded-3xl w-full max-w-md max-h-[85%]">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">
                Apply to {selected?.title}
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
