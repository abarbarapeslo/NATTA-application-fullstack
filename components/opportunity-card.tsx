import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  cardTags,
  formatDeadline,
  formatFunding,
  primaryRegion,
} from "@/lib/opportunity-format";
import type { Opportunity } from "@/types/natta-router";

/**
 * Used everywhere we list an opportunity: Search (Discover), Browse, etc.
 * Tap → opens the detail screen via `onPress`. When `applied` is true,
 * shows an inline "Applied" badge so users know they already tracked it.
 */
export function OpportunityCard({
  opportunity,
  onPress,
  applied = false,
}: {
  opportunity: Opportunity;
  onPress: () => void;
  applied?: boolean;
}) {
  const colors = useColors();
  const tags = cardTags(opportunity);
  const region = primaryRegion(opportunity);
  const funding = formatFunding(opportunity);

  return (
    <TouchableOpacity className="mb-4" onPress={onPress}>
      <Card>
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 pr-2">
            <Text className="text-lg font-bold text-foreground mb-1">
              {opportunity.title}
            </Text>
            {opportunity.organizer && (
              <Text className="text-sm text-muted mb-2">{opportunity.organizer}</Text>
            )}
          </View>
          <View className="items-end gap-1">
            {opportunity.opportunityType && (
              <Tag label={opportunity.opportunityType} variant="primary" />
            )}
            {applied && (
              <View className="flex-row items-center gap-1 bg-success/15 px-2 py-1 rounded-full">
                <IconSymbol name="checkmark" size={12} color={colors.success} />
                <Text className="text-[10px] font-bold" style={{ color: colors.success }}>
                  Applied
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center flex-wrap gap-x-4 gap-y-1 mb-3">
          <View className="flex-row items-center gap-1">
            <IconSymbol name="calendar" size={16} color={colors.muted} />
            <Text className="text-xs text-muted">
              {formatDeadline(opportunity.deadline)}
            </Text>
          </View>
          {region && (
            <View className="flex-row items-center gap-1">
              <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
              <Text className="text-xs text-muted">{region}</Text>
            </View>
          )}
          {funding && (
            <Text
              className="text-xs font-bold text-primary"
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >
              {funding}
            </Text>
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
