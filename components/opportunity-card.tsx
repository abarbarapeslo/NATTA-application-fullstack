import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import type { Opportunity } from "@/types/natta-router";

function formatDeadline(d: Date | null): string {
  if (!d) return "No deadline";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

function buildTags(opp: Opportunity): string[] {
  return [opp.field, opp.stage, opp.mode]
    .filter((s): s is string => Boolean(s));
}

/**
 * Visual shape used everywhere we list an opportunity: Search (Discover),
 * Browse Opportunities, Saved. Same component → same look.
 *
 * Tap → opens the detail screen via `onPress`.
 * "View Details" button does the same action so it works as a strong CTA.
 */
export function OpportunityCard({
  opportunity,
  onPress,
}: {
  opportunity: Opportunity;
  onPress: () => void;
}) {
  const colors = useColors();
  const tags = buildTags(opportunity);

  return (
    <TouchableOpacity className="mb-4" onPress={onPress}>
      <Card>
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 pr-2">
            <Text className="text-lg font-bold text-foreground mb-1">
              {opportunity.title}
            </Text>
            {opportunity.organization && (
              <Text className="text-sm text-muted mb-2">{opportunity.organization}</Text>
            )}
          </View>
          {opportunity.type && <Tag label={opportunity.type} variant="primary" />}
        </View>

        <View className="flex-row items-center flex-wrap gap-x-4 gap-y-1 mb-3">
          <View className="flex-row items-center gap-1">
            <IconSymbol name="calendar" size={16} color={colors.muted} />
            <Text className="text-xs text-muted">
              {formatDeadline(opportunity.deadline)}
            </Text>
          </View>
          {opportunity.region && (
            <View className="flex-row items-center gap-1">
              <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
              <Text className="text-xs text-muted">{opportunity.region}</Text>
            </View>
          )}
          {opportunity.funding && (
            <Text className="text-xs font-bold text-primary">{opportunity.funding}</Text>
          )}
        </View>

        {tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-3">
            {tags.slice(0, 3).map((tag, idx) => (
              <Tag key={`${tag}-${idx}`} label={tag} />
            ))}
            {tags.length > 3 && (
              <Tag label={`+${tags.length - 3} more`} variant="default" />
            )}
          </View>
        )}

        <TouchableOpacity
          className="bg-primary rounded-full py-3 items-center"
          onPress={onPress}
        >
          <Text className="text-surface font-semibold">View Details</Text>
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
}
