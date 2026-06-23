import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  detectConflicts,
  formatDate,
  getConflictSeverity,
  type Application,
  type Conflict,
} from "@/lib/conflict-detector";

export default function CalendarViewScreen() {
  const colors = useColors();
  const [applications, setApplications] = useState<Application[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  // Load applications and detect conflicts
  const loadData = async () => {
    try {
      // Always add example conflict for visualization
      const exampleApps: Application[] = [
        {
          id: "example1",
          name: "Harvard Summer Research Program",
          deadline: "Mar 15, 2026",
          status: "Accepted",
          type: "Research",
          startDate: "Jun 1, 2026",
          endDate: "Aug 31, 2026",
        },
        {
          id: "example2",
          name: "MIT Innovation Fellowship",
          deadline: "Mar 20, 2026",
          status: "Accepted",
          type: "Fellowship",
          startDate: "Jul 1, 2026",
          endDate: "Sep 30, 2026",
        },
      ];

      const stored = await AsyncStorage.getItem("applications");
      if (stored) {
        const userApps: Application[] = JSON.parse(stored);
        // Combine user apps with example apps
        const allApps = [...exampleApps, ...userApps];
        setApplications(allApps);
        const detectedConflicts = detectConflicts(allApps);
        setConflicts(detectedConflicts);
      } else {
        setApplications(exampleApps);
        const detectedConflicts = detectConflicts(exampleApps);
        setConflicts(detectedConflicts);
      }
    } catch (error) {
      console.error("Error loading applications:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Get deadlines from applications
  const deadlines = applications
    .filter((app) => app.deadline)
    .map((app) => ({
      id: app.id,
      title: app.name,
      date: app.deadline,
      status: app.status,
      type: app.type,
    }));

  // Simple calendar grid (mock)
  const currentMonth = "February 2026";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 28 }, (_, i) => i + 1);
  const today = 18;

  const getConflictColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return colors.warning;
      case "medium":
        return "#FF9500";
      case "high":
        return colors.error;
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Image
              source={require("@/assets/images/natta_icon.png")}
              style={{ width: 100, height: 28 }}
              resizeMode="contain"
            />
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity className="bg-primary rounded-full px-4 py-2">
              <Text className="text-surface font-semibold text-sm">Month</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-background border border-border rounded-full px-4 py-2">
              <Text className="text-foreground font-semibold text-sm">List</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <View className="px-6 mb-4">
            <Card className="bg-error/10 border-error/30">
              <View className="flex-row items-start gap-3">
                <View
                  className="rounded-full p-2"
                  style={{ backgroundColor: `${colors.error}20` }}
                >
                  <IconSymbol name="xmark" size={20} color={colors.error} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground mb-1">
                    {conflicts.length} Time Conflict{conflicts.length > 1 ? "s" : ""} Detected
                  </Text>
                  <Text className="text-sm text-muted">
                    Some accepted opportunities have overlapping time periods
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Month Selector */}
        <View className="flex-row items-center justify-center px-6 mb-4">
          <Text className="text-xl font-bold text-foreground">{currentMonth}</Text>
        </View>

        {/* Calendar Grid */}
        <View className="px-6 mb-6">
          <Card>
            {/* Days of week */}
            <View className="flex-row mb-2">
              {days.map((day) => (
                <View key={day} className="flex-1 items-center py-2">
                  <Text className="text-xs font-semibold text-muted">{day}</Text>
                </View>
              ))}
            </View>

            {/* Dates grid */}
            <View className="flex-row flex-wrap">
              {/* Empty cells for alignment (Feb 2026 starts on Sunday) */}
              {dates.map((date) => (
                <View
                  key={date}
                  className="items-center justify-center"
                  style={{ width: `${100 / 7}%`, aspectRatio: 1 }}
                >
                  <View
                    className={`w-10 h-10 items-center justify-center rounded-full ${
                      date === today ? "bg-primary" : ""
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        date === today
                          ? "text-surface font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {date}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Conflicts Section */}
        {conflicts.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">
              Time Conflicts
            </Text>
            {conflicts.map((conflict, index) => {
              const severity = getConflictSeverity(conflict.overlapDays);
              const conflictColor = getConflictColor(severity);

              return (
                <Card key={index} className="mb-3">
                  <View className="flex-row items-start gap-3">
                    <View
                      className="rounded-full p-2 mt-1"
                      style={{ backgroundColor: `${conflictColor}20` }}
                    >
                      <IconSymbol name="xmark" size={18} color={conflictColor} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View
                          className="rounded-full px-2 py-1"
                          style={{ backgroundColor: `${conflictColor}20` }}
                        >
                          <Text
                            className="text-xs font-semibold uppercase"
                            style={{ color: conflictColor }}
                          >
                            {severity} risk
                          </Text>
                        </View>
                        <Text className="text-xs text-muted">
                          {conflict.overlapDays} days overlap
                        </Text>
                      </View>

                      <Text className="text-sm font-semibold text-foreground mb-1">
                        {conflict.app1.name}
                      </Text>
                      <Text className="text-xs text-muted mb-2">
                        {conflict.app1.startDate} - {conflict.app1.endDate}
                      </Text>

                      <Text className="text-sm font-semibold text-foreground mb-1">
                        {conflict.app2.name}
                      </Text>
                      <Text className="text-xs text-muted mb-2">
                        {conflict.app2.startDate} - {conflict.app2.endDate}
                      </Text>

                      <View
                        className="rounded-lg p-2 mt-1"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <Text className="text-xs text-muted">
                          Overlap: {formatDate(conflict.overlapStart)} -{" "}
                          {formatDate(conflict.overlapEnd)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Upcoming Deadlines */}
        <View className="px-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            Upcoming Deadlines
          </Text>
          {deadlines.length === 0 ? (
            <Card>
              <Text className="text-center text-muted">
                No deadlines yet. Add applications to see deadlines here.
              </Text>
            </Card>
          ) : (
            deadlines.map((deadline) => (
              <Card key={deadline.id} className="mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {deadline.title}
                    </Text>
                    <Text className="text-sm text-muted">{deadline.type}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-foreground">
                      {deadline.date}
                    </Text>
                    <View
                      className="rounded-full px-2 py-1 mt-1"
                      style={{
                        backgroundColor:
                          deadline.status === "Accepted"
                            ? `${colors.success}20`
                            : deadline.status === "In Progress"
                            ? `${colors.primary}20`
                            : `${colors.muted}20`,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          color:
                            deadline.status === "Accepted"
                              ? colors.success
                              : deadline.status === "In Progress"
                              ? colors.primary
                              : colors.muted,
                        }}
                      >
                        {deadline.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
