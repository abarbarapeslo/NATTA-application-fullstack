import { ScrollView, Text, View, TouchableOpacity, Linking, Alert } from "react-native";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { detailTags, formatDeadline, formatFunding } from "@/lib/opportunity-format";
import type { Opportunity } from "@/types/natta-router";

/**
 * Read-only rich view of an Opportunity (description, requirements,
 * benefits, dates, tags, "Visit site" button).
 *
 * Reused by:
 * - `app/opportunities/[id].tsx` — the standalone detail screen
 * - Home modal when the user taps an application in "Your Applications"
 *
 * Callers wrap this in their own header/actions. We only render the body.
 */
export function OpportunityDetailView({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const colors = useColors();
  const tags = detailTags(opportunity);
  const funding = formatFunding(opportunity);

  const visitSite = async () => {
    if (!opportunity.applicationLink) {
      Alert.alert(
        "No site link",
        "This opportunity doesn't have an external link to visit.",
      );
      return;
    }
    try {
      await Linking.openURL(opportunity.applicationLink);
    } catch {
      Alert.alert("Could not open link", "The URL may be invalid.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Title block */}
      <View className="px-6 pt-2 mb-4">
        {opportunity.opportunityType && (
          <View className="self-start mb-3">
            <Tag label={opportunity.opportunityType} variant="primary" />
          </View>
        )}
        <Text className="text-2xl font-bold text-foreground mb-2">
          {opportunity.title}
        </Text>
        {opportunity.organizer && (
          <Text className="text-base text-muted">{opportunity.organizer}</Text>
        )}
      </View>

      {/* Meta */}
      <View className="px-6 mb-4">
        <Card>
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <IconSymbol name="calendar" size={18} color={colors.muted} />
              <Text className="text-sm text-foreground">
                Deadline: {formatDeadline(opportunity.deadline)}
              </Text>
            </View>
            {opportunity.mode && (
              <View className="flex-row items-center gap-2">
                <IconSymbol name="paperplane.fill" size={18} color={colors.muted} />
                <Text className="text-sm text-foreground">{opportunity.mode}</Text>
              </View>
            )}
            {funding && (
              <View className="flex-row items-center gap-2">
                <IconSymbol name="sparkles" size={18} color={colors.primary} />
                <Text className="text-sm font-semibold text-primary">{funding}</Text>
              </View>
            )}
            {(opportunity.programStartDate || opportunity.programEndDate) && (
              <View className="flex-row items-center gap-2">
                <IconSymbol name="calendar" size={18} color={colors.muted} />
                <Text className="text-sm text-foreground">
                  Program: {formatDeadline(opportunity.programStartDate)}
                  {opportunity.programEndDate
                    ? ` → ${formatDeadline(opportunity.programEndDate)}`
                    : ""}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </View>

      {opportunity.description && (
        <View className="px-6 mb-4">
          <Text className="text-base font-bold text-foreground mb-2">About</Text>
          <Card>
            <Text className="text-sm text-foreground leading-6">
              {opportunity.description}
            </Text>
          </Card>
        </View>
      )}

      {opportunity.requirements && (
        <View className="px-6 mb-4">
          <Text className="text-base font-bold text-foreground mb-2">
            Requirements
          </Text>
          <Card>
            <Text className="text-sm text-foreground leading-6">
              {opportunity.requirements}
            </Text>
          </Card>
        </View>
      )}

      {opportunity.benefits && (
        <View className="px-6 mb-4">
          <Text className="text-base font-bold text-foreground mb-2">Benefits</Text>
          <Card>
            <Text className="text-sm text-foreground leading-6">
              {opportunity.benefits}
            </Text>
          </Card>
        </View>
      )}

      {tags.length > 0 && (
        <View className="px-6 mb-6">
          <Text className="text-base font-bold text-foreground mb-2">Details</Text>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <Tag key={`${tag}-${idx}`} label={tag} />
            ))}
          </View>
        </View>
      )}

      {opportunity.applicationLink && (
        <View className="px-6">
          <TouchableOpacity
            className="bg-primary rounded-full py-4 items-center flex-row justify-center gap-2"
            onPress={visitSite}
          >
            <IconSymbol name="paperplane.fill" size={18} color={colors.surface} />
            <Text className="text-surface font-bold text-base">Visit site</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
