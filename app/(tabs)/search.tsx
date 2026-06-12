import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
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
import type { OpportunityFilters } from "@/types/natta-router";

const CATEGORIES = ["All", "Scholarship", "Internship", "Job", "Grant", "Research"];
const REGIONS = ["All", "Global", "USA", "Europe", "Asia", "Brazil", "Remote"];
const DEADLINES = ["All", "This Week", "This Month", "Next 3 Months"];

function deadlineLabelToDate(label: string | null): Date | undefined {
  if (!label || label === "All") return undefined;
  const now = new Date();
  if (label === "This Week") {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return d;
  }
  if (label === "This Month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 1);
    return d;
  }
  if (label === "Next 3 Months") {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 3);
    return d;
  }
  return undefined;
}

export default function SearchScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("All");
  const [selectedRegion, setSelectedRegion] = useState<string | null>("All");
  const [selectedDeadline, setSelectedDeadline] = useState<string | null>("All");

  const filters = useMemo<OpportunityFilters | undefined>(() => {
    const f: OpportunityFilters = {};
    if (searchQuery.trim()) f.search = searchQuery.trim();
    if (selectedCategory && selectedCategory !== "All") f.type = selectedCategory;
    if (selectedRegion && selectedRegion !== "All") f.region = selectedRegion;
    const d = deadlineLabelToDate(selectedDeadline);
    if (d) f.deadlineBefore = d;
    return Object.keys(f).length === 0 ? undefined : f;
  }, [searchQuery, selectedCategory, selectedRegion, selectedDeadline]);

  const { opportunities, status, refreshing, error, reload, refresh } =
    useOpportunities(filters);

  useEffect(() => {
    telemetry.screen("search");
  }, []);

  // Re-fetch when the tab comes back into focus so testers see new
  // opportunities without having to kill the app.
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
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-foreground">
            Discover Opportunities
          </Text>
          <Text className="text-sm text-muted mt-1">
            {status === "ready"
              ? `Browse ${opportunities.length} opportunities tailored for you`
              : "Loading opportunities..."}
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-4">
          <View className="flex-row gap-2">
            <View className="flex-1 flex-row items-center bg-surface rounded-2xl px-4 py-3 border border-border">
              <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
              <TextInput
                className="flex-1 ml-3 text-base text-foreground"
                placeholder="Search opportunities..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <IconSymbol name="xmark" size={18} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              className="bg-surface rounded-2xl w-12 h-12 items-center justify-center border border-border"
              onPress={() => setShowFilters(!showFilters)}
            >
              <IconSymbol
                name="line.3.horizontal.decrease.circle"
                size={24}
                color={showFilters ? colors.primary : colors.foreground}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        {showFilters && (
          <View className="px-6 mb-4">
            <Card>
              <Text className="text-sm font-bold text-foreground mb-3">Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row gap-2">
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full ${
                        selectedCategory === cat ? "bg-primary" : "bg-background"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedCategory === cat
                            ? "text-surface"
                            : "text-foreground"
                        }`}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text className="text-sm font-bold text-foreground mb-3">Location</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row gap-2">
                  {REGIONS.map((loc) => (
                    <TouchableOpacity
                      key={loc}
                      onPress={() => setSelectedRegion(loc)}
                      className={`px-4 py-2 rounded-full ${
                        selectedRegion === loc ? "bg-primary" : "bg-background"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedRegion === loc ? "text-surface" : "text-foreground"
                        }`}
                      >
                        {loc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text className="text-sm font-bold text-foreground mb-3">Deadline</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {DEADLINES.map((deadline) => (
                    <TouchableOpacity
                      key={deadline}
                      onPress={() => setSelectedDeadline(deadline)}
                      className={`px-4 py-2 rounded-full ${
                        selectedDeadline === deadline ? "bg-primary" : "bg-background"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedDeadline === deadline
                            ? "text-surface"
                            : "text-foreground"
                        }`}
                      >
                        {deadline}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Card>
          </View>
        )}

        {/* List */}
        <View className="px-6">
          {status === "loading" && opportunities.length === 0 ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : status === "error" ? (
            <Card className="p-6 items-center">
              <IconSymbol
                name="exclamationmark.triangle"
                size={32}
                color={colors.error}
              />
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
                No opportunities match your filters.
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
