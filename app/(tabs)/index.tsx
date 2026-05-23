import { ScrollView, Text, View, TouchableOpacity, Image, Modal, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useFirebaseUser, firstNameFromUser } from "@/hooks/use-firebase-user";
import { useApplications } from "@/hooks/use-applications";
import type { Application, ApplicationStatus } from "@/lib/firestore";

export default function HomeScreen() {
  const colors = useColors();
  const firebaseUser = useFirebaseUser();
  const firstName = firstNameFromUser(firebaseUser);
  const { applications, addApplication, updateApplication } = useApplications();

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Draft");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const saveApplication = async () => {
    if (!name || !deadline || !type) return;
    await addApplication({
      name,
      deadline,
      status,
      type,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setName("");
    setDeadline("");
    setStatus("Draft");
    setType("");
    setStartDate("");
    setEndDate("");
    setModalVisible(false);
  };

  const openEditModal = (app: Application) => {
    setSelectedApp(app);
    setEditModalVisible(true);
  };

  const updateApplicationStatus = async (newStatus: ApplicationStatus) => {
    if (!selectedApp?.id) return;
    await updateApplication(selectedApp.id, { status: newStatus });
    setEditModalVisible(false);
    setSelectedApp(null);
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "Draft":
        return colors.muted;
      case "In Progress":
        return colors.primary;
      case "Submitted":
        return colors.warning;
      case "Accepted":
        return colors.success;
      case "Rejected":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const inProgressCount = applications.filter(app => app.status === "In Progress").length;
  const submittedCount = applications.filter(app => app.status === "Submitted").length;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Image
            source={require("@/assets/images/natta_icon.png")}
            style={{ width: 120, height: 32 }}
            resizeMode="contain"
          />
          <TouchableOpacity>
            <IconSymbol name="bell" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Welcome */}
        <View className="px-6 mb-6">
          <Text className="text-3xl font-bold text-foreground">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </Text>
        </View>

        {/* Metrics */}
        <View className="flex-row px-6 mb-6 gap-3">
          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">Applications in Progress</Text>
            <Text className="text-3xl font-bold text-foreground">{inProgressCount}</Text>
          </Card>

          <Card className="flex-1 p-4">
            <Text className="text-sm text-muted mb-1">Upcoming Deadlines</Text>
            <Text className="text-3xl font-bold text-foreground">3</Text>
          </Card>
        </View>

        <View className="px-6 mb-6">
          <Card className="p-4">
            <Text className="text-sm text-muted mb-1">Submitted</Text>
            <Text className="text-3xl font-bold text-foreground">{submittedCount}</Text>
          </Card>
        </View>

        {/* Applications List */}
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Your Applications</Text>
            <TouchableOpacity 
              className="bg-primary rounded-full px-4 py-2"
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-surface font-semibold text-sm">+ New</Text>
            </TouchableOpacity>
          </View>

          {applications.length === 0 ? (
            <Card className="p-6 items-center">
              <IconSymbol name="doc" size={48} color={colors.muted} />
              <Text className="text-muted mt-3 text-center">
                No applications yet. Tap &quot;+ New&quot; to create your first application.
              </Text>
            </Card>
          ) : (
            applications.map((app) => (
              <TouchableOpacity key={app.id} className="mb-3" onPress={() => openEditModal(app)}>
                <Card className="p-4">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground mb-1">
                        {app.name}
                      </Text>
                      <Text className="text-sm text-muted mb-2">
                        {app.type}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted">
                      Deadline: {app.deadline}
                    </Text>
                    <View 
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: `${getStatusColor(app.status)}20` }}
                    >
                      <Text 
                        className="text-xs font-semibold"
                        style={{ color: getStatusColor(app.status) }}
                      >
                        {app.status}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Application Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-background rounded-2xl w-full max-w-md" style={{ maxHeight: "85%" }}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 pb-4 border-b border-border">
              <Text className="text-xl font-bold text-foreground">New Application</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-2xl text-muted">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Application Name *
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholder="e.g., Harvard University - Computer Science"
                  placeholderTextColor={colors.muted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Type/Area */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Type/Area *
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholder="e.g., Scholarship, Internship, Job, Research"
                  placeholderTextColor={colors.muted}
                  value={type}
                  onChangeText={setType}
                />
              </View>

              {/* Deadline */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Deadline *
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholder="e.g., Oct 25, 2024"
                  placeholderTextColor={colors.muted}
                  value={deadline}
                  onChangeText={setDeadline}
                />
              </View>

              {/* Start Date */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Start Date (optional)
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholder="e.g., Jan 15, 2025"
                  placeholderTextColor={colors.muted}
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>

              {/* End Date */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  End Date (optional)
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholder="e.g., Jun 15, 2025"
                  placeholderTextColor={colors.muted}
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>

              {/* Status */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Status
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["Draft", "In Progress", "Submitted", "Accepted", "Rejected"] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      className={`rounded-full px-4 py-2 ${
                        status === s ? "bg-primary" : "bg-surface border border-border"
                      }`}
                      onPress={() => setStatus(s)}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          status === s ? "text-white" : "text-foreground"
                        }`}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </ScrollView>

            {/* Footer Buttons */}
            <View className="p-6 pt-4 border-t border-border gap-3">
              <TouchableOpacity
                className="bg-primary rounded-full py-3 items-center"
                onPress={saveApplication}
              >
                <Text className="text-surface font-bold text-base">Save Application</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-surface border border-border rounded-full py-3 items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-foreground font-semibold text-base">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-background rounded-2xl w-full max-w-md p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Update Status</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text className="text-2xl text-muted">×</Text>
              </TouchableOpacity>
            </View>

            {/* Application Info */}
            {selectedApp && (
              <View className="mb-6">
                <Text className="text-base font-bold text-foreground mb-1">
                  {selectedApp.name}
                </Text>
                <Text className="text-sm text-muted">
                  {selectedApp.type} • Deadline: {selectedApp.deadline}
                </Text>
              </View>
            )}

            {/* Status Options */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-3">
                Select New Status
              </Text>
              <View className="gap-2">
                {(["Draft", "In Progress", "Submitted", "Accepted", "Rejected"] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    className={`rounded-lg px-4 py-3 border ${
                      selectedApp?.status === s ? "bg-primary border-primary" : "bg-surface border-border"
                    }`}
                    onPress={() => updateApplicationStatus(s)}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        selectedApp?.status === s ? "text-surface" : "text-foreground"
                      }`}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              className="bg-surface border border-border rounded-full py-3 items-center"
              onPress={() => setEditModalVisible(false)}
            >
              <Text className="text-foreground font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
