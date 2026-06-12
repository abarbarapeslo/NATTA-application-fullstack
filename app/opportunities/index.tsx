import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { OpportunityCard } from "@/components/opportunity-card";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { telemetry } from "@/lib/telemetry";

export default function OpportunitiesScreen() {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const filters = useMemo(
    () => (search.trim() ? { search: search.trim() } : undefined),
    [search],
  );
  const { opportunities, status, refreshing, error, reload, refresh } =
    useOpportunities(filters);

  useEffect(() => {
    telemetry.screen("opportunities");
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
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
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onPress={() => router.push(`/opportunities/${opp.id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
