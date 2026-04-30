import { ScrollView, Text, View, TextInput, TouchableOpacity, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Tag } from "@/components/ui/tag";
import { useState } from "react";

export default function SearchScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);


  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<string | null>(null);

  const categories = ["All", "Scholarships", "Internships", "Jobs", "Grants", "Research"];
  const locations = ["All", "Global", "USA", "Europe", "Asia", "Remote"];
  const deadlines = ["All", "This Week", "This Month", "Next 3 Months", "No Deadline"];

  // Mock data - will be replaced with real API data
  const opportunities = [
    {
      id: 1,
      title: "Future Engineer Scholarship",
      organization: "Tech Innovators Foundation",
      deadline: "Oct 31, 2024",
      location: "Global",
      category: "Scholarship",
      amount: "$10,000",
      tags: ["Engineering", "Undergraduate", "Merit-based"],
    },
    {
      id: 2,
      title: "Women in STEM Grant",
      organization: "National Science Society",
      deadline: "Nov 15, 2024",
      location: "USA",
      category: "Grant",
      amount: "$5,000",
      tags: ["STEM", "Women", "Financial Need", "Graduate"],
    },
    {
      id: 3,
      title: "Renewable Energy Research Fund",
      organization: "Green Future Alliance",
      deadline: "Dec 1, 2024",
      location: "Europe",
      category: "Research",
      amount: "$15,000",
      tags: ["Research", "Renewable Energy", "PhD", "International"],
    },
    {
      id: 4,
      title: "Software Engineering Internship",
      organization: "TechCorp Inc.",
      deadline: "Oct 25, 2024",
      location: "Remote",
      category: "Internship",
      amount: "$3,000/month",
      tags: ["Software", "Remote", "Paid", "3 months"],
    },
    {
      id: 5,
      title: "Business Leadership Program",
      organization: "Global Business Institute",
      deadline: "Nov 30, 2024",
      location: "USA",
      category: "Scholarship",
      amount: "$20,000",
      tags: ["Business", "Leadership", "MBA", "Full-time"],
    },
  ];



  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-foreground">Discover Opportunities</Text>
          <Text className="text-sm text-muted mt-1">
            Browse {opportunities.length} opportunities tailored for you
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
              />
            </View>
            <TouchableOpacity
              className="bg-surface rounded-2xl w-12 h-12 items-center justify-center border border-border"
              onPress={() => setShowFilters(!showFilters)}
            >
              <IconSymbol name="line.3.horizontal.decrease.circle" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        {showFilters && (
          <View className="px-6 mb-4">
            <Card>
              <Text className="text-sm font-bold text-foreground mb-3">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row gap-2">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full ${
                        selectedCategory === cat ? "bg-primary" : "bg-background"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedCategory === cat ? "text-surface" : "text-foreground"
                        }`}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text className="text-sm font-bold text-foreground mb-3">Location</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row gap-2">
                  {locations.map((loc) => (
                    <TouchableOpacity
                      key={loc}
                      onPress={() => setSelectedLocation(loc)}
                      className={`px-4 py-2 rounded-full ${
                        selectedLocation === loc ? "bg-primary" : "bg-background"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedLocation === loc ? "text-surface" : "text-foreground"
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
                  {deadlines.map((deadline) => (
                    <TouchableOpacity
                      key={deadline}
                      onPress={() => setSelectedDeadline(deadline)}
                      className={`px-4 py-2 rounded-full ${
                        selectedDeadline === deadline ? "bg-primary" : "bg-background"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedDeadline === deadline ? "text-surface" : "text-foreground"
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

        {/* Opportunities Catalog */}
        <View className="px-6">
          {opportunities.map((opp) => (
            <TouchableOpacity key={opp.id} className="mb-4">
              <Card>
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground mb-1">{opp.title}</Text>
                    <Text className="text-sm text-muted mb-2">{opp.organization}</Text>
                  </View>
                  <Tag label={opp.category} variant="primary" />
                </View>

                <View className="flex-row items-center gap-4 mb-3">
                  <View className="flex-row items-center gap-1">
                    <IconSymbol name="calendar" size={16} color={colors.muted} />
                    <Text className="text-xs text-muted">{opp.deadline}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
                    <Text className="text-xs text-muted">{opp.location}</Text>
                  </View>
                  <Text className="text-xs font-bold text-primary">{opp.amount}</Text>
                </View>

                {/* Tags */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {opp.tags.slice(0, 3).map((tag, index) => (
                    <Tag key={index} label={tag} />
                  ))}
                  {opp.tags.length > 3 && (
                    <Tag label={`+${opp.tags.length - 3} more`} variant="default" />
                  )}
                </View>

                <TouchableOpacity className="bg-primary rounded-full py-3 items-center">
                  <Text className="text-surface font-semibold">View Details</Text>
                </TouchableOpacity>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>


    </ScreenContainer>
  );
}
