import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Linking, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

export default function HelpSupportScreen() {
  const colors = useColors();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleContactSupport = () => {
    Alert.alert(
      "Contact Support",
      "Choose how you want to contact us:",
      [
        {
          text: "Email",
          onPress: () => Linking.openURL("mailto:support@aipply.tech"),
        },
        {
          text: "Website",
          onPress: () => Linking.openURL("https://www.aipply.tech"),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const faqItems = [
    {
      id: 1,
      question: "How do I create a new application?",
      answer: "Go to the Home tab and tap the '+ New' button. Fill in the application details including name, deadline, status, and type. Your application will be saved automatically.",
    },
    {
      id: 2,
      question: "How does the conflict detection work?",
      answer: "When you add start and end dates to your applications, AIpply automatically detects if two accepted opportunities overlap in time. Check the Calendar to see any conflicts and their severity.",
    },
    {
      id: 3,
      question: "Can I edit my profile information?",
      answer: "Yes! Go to the Profile tab and tap the edit icon next to any section (Education, Experience, Projects, Skills). You can add, edit, or remove entries at any time.",
    },
    {
      id: 4,
      question: "How do I use the AI tools?",
      answer: "Access all AI-powered tools from the Tools tab. You'll find Writing Hub for essays, Resume Assistant for CVs, Interview Simulator for practice, and more.",
    },
    {
      id: 5,
      question: "What are the different application statuses?",
      answer: "Draft (planning), In Progress (working on it), Submitted (sent), Accepted (got in!), Rejected (didn't make it), and Waitlisted (waiting for response).",
    },
    {
      id: 6,
      question: "How do I search for opportunities?",
      answer: "Use the Search tab to browse opportunities. You can filter by type (scholarship, internship, job, exchange, fellowship) and other criteria using the filter button.",
    },
  ];

  const quickLinks = [
    {
      id: 1,
      title: "Contact Support",
      description: "Get help from our team",
      icon: "ellipsis.circle",
      onPress: handleContactSupport,
    },
    {
      id: 2,
      title: "Visit AIpply Website",
      description: "Learn more about AIpply",
      icon: "ellipsis.circle",
      onPress: () => Linking.openURL("https://www.aipply.tech"),
    },
    {
      id: 3,
      title: "Report a Bug",
      description: "Help us improve the app",
      icon: "ellipsis.circle",
      onPress: () => Linking.openURL("mailto:support@aipply.tech?subject=Bug Report"),
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Help & Support</Text>
          </View>
        </View>

        {/* Quick Links */}
        <View className="px-6 mb-6">
          <Text className="text-sm font-semibold text-muted mb-3">QUICK ACTIONS</Text>
          {quickLinks.map((link) => (
            <TouchableOpacity key={link.id} onPress={link.onPress} className="mb-3">
              <Card>
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                    <IconSymbol name={link.icon as any} size={20} color={colors.primary} />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {link.title}
                    </Text>
                    <Text className="text-sm text-muted">{link.description}</Text>
                  </View>

                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View className="px-6">
          <Text className="text-sm font-semibold text-muted mb-3">FREQUENTLY ASKED QUESTIONS</Text>
          {faqItems.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              className="mb-3"
            >
              <Card>
                <View>
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 text-base font-semibold text-foreground pr-2">
                      {faq.question}
                    </Text>
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color={colors.muted}
                      style={{
                        transform: [{ rotate: expandedFaq === faq.id ? "90deg" : "0deg" }],
                      }}
                    />
                  </View>

                  {expandedFaq === faq.id && (
                    <View className="mt-3 pt-3 border-t" style={{ borderTopColor: colors.border }}>
                      <Text className="text-sm text-muted leading-relaxed">{faq.answer}</Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View className="px-6 mt-6">
          <Text className="text-center text-sm text-muted">AIpply Mobile v1.9.1</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
