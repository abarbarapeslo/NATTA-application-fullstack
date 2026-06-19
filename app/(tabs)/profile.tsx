import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Tag } from "@/components/ui/tag";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { telemetry } from "@/lib/telemetry";

export default function ProfileScreen() {
  const colors = useColors();
  const {
    profile,
    education,
    experience,
    projects,
    saveProfile,
    addEducation,
    addExperience,
    addProject,
  } = useUserProfile();

  // Modal states
  const [showEditBasic, setShowEditBasic] = useState(false);
  const [showEditEducation, setShowEditEducation] = useState(false);
  const [showEditExperience, setShowEditExperience] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showEditInterests, setShowEditInterests] = useState(false);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editBio, setEditBio] = useState("");

  const [editEduInstitution, setEditEduInstitution] = useState("");
  const [editEduDegree, setEditEduDegree] = useState("");
  const [editEduPeriod, setEditEduPeriod] = useState("");

  const [editExpTitle, setEditExpTitle] = useState("");
  const [editExpCompany, setEditExpCompany] = useState("");
  const [editExpPeriod, setEditExpPeriod] = useState("");
  const [editExpDescription, setEditExpDescription] = useState("");

  const [editProjTitle, setEditProjTitle] = useState("");
  const [editProjDescription, setEditProjDescription] = useState("");
  const [editProjTags, setEditProjTags] = useState("");

  const [editInterestsText, setEditInterestsText] = useState("");

  useEffect(() => {
    telemetry.screen("profile");
  }, []);

  const handleEditBasicInfo = () => {
    setEditTitle(profile.title);
    setEditBio(profile.bio);
    setShowEditBasic(true);
  };

  const handleSaveBasicInfo = async () => {
    try {
      await saveProfile({ title: editTitle, bio: editBio });
      setShowEditBasic(false);
    } catch {
      // Bio save (NATTA backend) failed — leave the modal open so the
      // user can retry. Title (Firestore) save already succeeded.
    }
  };

  const handleAddEducation = () => {
    setEditEduInstitution("");
    setEditEduDegree("");
    setEditEduPeriod("");
    setShowEditEducation(true);
  };

  const handleSaveEducation = async () => {
    await addEducation({
      institution: editEduInstitution,
      degree: editEduDegree,
      period: editEduPeriod,
    });
    setShowEditEducation(false);
  };

  const handleAddExperience = () => {
    setEditExpTitle("");
    setEditExpCompany("");
    setEditExpPeriod("");
    setEditExpDescription("");
    setShowEditExperience(true);
  };

  const handleSaveExperience = async () => {
    await addExperience({
      title: editExpTitle,
      company: editExpCompany,
      period: editExpPeriod,
      description: editExpDescription,
    });
    setShowEditExperience(false);
  };

  const handleAddProject = () => {
    setEditProjTitle("");
    setEditProjDescription("");
    setEditProjTags("");
    setShowEditProject(true);
  };

  const handleSaveProject = async () => {
    await addProject({
      title: editProjTitle,
      description: editProjDescription,
      tags: editProjTags.split(",").map((t) => t.trim()).filter((t) => t),
    });
    setShowEditProject(false);
  };

  const handleEditInterests = () => {
    setEditInterestsText(profile.interests.join(", "));
    setShowEditInterests(true);
  };

  const handleSaveInterests = async () => {
    const newInterests = editInterestsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    try {
      await saveProfile({ interests: newInterests });
      setShowEditInterests(false);
    } catch {
      // Leave the modal open on backend error so the user can retry.
    }
  };

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
          <TouchableOpacity className="bg-primary rounded-full px-4 py-2" onPress={handleEditBasicInfo}>
            <Text className="text-surface font-semibold text-sm">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo & Info */}
        <View className="items-center px-6 mb-6">
          <View className="w-24 h-24 rounded-full bg-muted/20 items-center justify-center mb-3">
            <IconSymbol name="person.fill" size={40} color={colors.muted} />
          </View>
          <Text className="text-2xl font-bold text-foreground">{profile.name}</Text>
          <Text className="text-sm text-muted mt-1">{profile.title}</Text>
          <Text className="text-sm text-foreground mt-2 text-center px-8">{profile.bio}</Text>
        </View>

        <View className="px-6 gap-4">
          {/* Education Section */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Education</Text>
              <TouchableOpacity onPress={handleAddEducation}>
                <IconSymbol name="plus" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {education.map((edu) => (
              <Card key={edu.id} className="mb-3 p-4">
                <Text className="text-base font-semibold text-foreground">{edu.institution}</Text>
                <Text className="text-sm text-muted mt-1">{edu.degree}</Text>
                <Text className="text-xs text-muted mt-1">{edu.period}</Text>
              </Card>
            ))}
          </View>

          {/* Experience Section */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Experience</Text>
              <TouchableOpacity onPress={handleAddExperience}>
                <IconSymbol name="plus" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {experience.map((exp) => (
              <Card key={exp.id} className="mb-3 p-4">
                <Text className="text-base font-semibold text-foreground">{exp.title}</Text>
                <Text className="text-sm text-muted mt-1">{exp.company}</Text>
                <Text className="text-xs text-muted mt-1">{exp.period}</Text>
                <Text className="text-sm text-foreground mt-2">{exp.description}</Text>
              </Card>
            ))}
          </View>

          {/* Projects Section */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Projects</Text>
              <TouchableOpacity onPress={handleAddProject}>
                <IconSymbol name="plus" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {projects.map((proj) => (
              <Card key={proj.id} className="mb-3 p-4">
                <Text className="text-base font-semibold text-foreground">{proj.title}</Text>
                <Text className="text-sm text-foreground mt-2">{proj.description}</Text>
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {proj.tags.map((tag, idx) => (
                    <Tag key={idx} label={tag} />
                  ))}
                </View>
              </Card>
            ))}
          </View>

          {/* Skills & Interests Section (NATTA backend, used for matching) */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">
                Skills &amp; Interests
              </Text>
              <TouchableOpacity onPress={handleEditInterests}>
                <IconSymbol name="pencil" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {profile.interests.length === 0 ? (
                <Text className="text-sm text-muted">
                  Add skills and interests to help match you with opportunities.
                </Text>
              ) : (
                profile.interests.map((interest, idx) => (
                  <Tag key={`interest-${idx}`} label={interest} />
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Basic Info Modal */}
      <Modal visible={showEditBasic} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-background rounded-3xl w-11/12 max-h-[80%]">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">Edit Profile</Text>
            </View>
            <ScrollView className="px-6 py-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Title</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Your title"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-sm font-semibold text-foreground mb-2">Bio</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Short bio"
                placeholderTextColor={colors.muted}
                multiline
              />
            </ScrollView>
            <View className="flex-row gap-3 px-6 py-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl py-3 items-center"
                onPress={() => setShowEditBasic(false)}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={handleSaveBasicInfo}
              >
                <Text className="text-surface font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Education Modal */}
      <Modal visible={showEditEducation} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-background rounded-3xl w-11/12 max-h-[80%]">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">Add Education</Text>
            </View>
            <ScrollView className="px-6 py-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Institution</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editEduInstitution}
                onChangeText={setEditEduInstitution}
                placeholder="University name"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-sm font-semibold text-foreground mb-2">Degree</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editEduDegree}
                onChangeText={setEditEduDegree}
                placeholder="Bachelor of..."
                placeholderTextColor={colors.muted}
              />
              <Text className="text-sm font-semibold text-foreground mb-2">Period</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editEduPeriod}
                onChangeText={setEditEduPeriod}
                placeholder="Jan 2020 - Present"
                placeholderTextColor={colors.muted}
              />
            </ScrollView>
            <View className="flex-row gap-3 px-6 py-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl py-3 items-center"
                onPress={() => setShowEditEducation(false)}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={handleSaveEducation}
              >
                <Text className="text-surface font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Experience Modal */}
      <Modal visible={showEditExperience} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-background rounded-3xl w-11/12 max-h-[80%]">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">Add Experience</Text>
            </View>
            <ScrollView className="px-6 py-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Title</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editExpTitle}
                onChangeText={setEditExpTitle}
                placeholder="Job title"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-sm font-semibold text-foreground mb-2">Company</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editExpCompany}
                onChangeText={setEditExpCompany}
                placeholder="Company name"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-sm font-semibold text-foreground mb-2">Period</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editExpPeriod}
                onChangeText={setEditExpPeriod}
                placeholder="Jun 2022 - Dec 2022"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-sm font-semibold text-foreground mb-2">Description</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editExpDescription}
                onChangeText={setEditExpDescription}
                placeholder="Describe your role..."
                placeholderTextColor={colors.muted}
                multiline
              />
            </ScrollView>
            <View className="flex-row gap-3 px-6 py-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl py-3 items-center"
                onPress={() => setShowEditExperience(false)}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={handleSaveExperience}
              >
                <Text className="text-surface font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Project Modal */}
      <Modal visible={showEditProject} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-background rounded-3xl w-11/12 max-h-[80%]">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">Add Project</Text>
            </View>
            <ScrollView className="px-6 py-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Title</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editProjTitle}
                onChangeText={setEditProjTitle}
                placeholder="Project name"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-sm font-semibold text-foreground mb-2">Description</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editProjDescription}
                onChangeText={setEditProjDescription}
                placeholder="Describe the project..."
                placeholderTextColor={colors.muted}
                multiline
              />
              <Text className="text-sm font-semibold text-foreground mb-2">Tags (comma separated)</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editProjTags}
                onChangeText={setEditProjTags}
                placeholder="React, TypeScript, Design"
                placeholderTextColor={colors.muted}
              />
            </ScrollView>
            <View className="flex-row gap-3 px-6 py-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl py-3 items-center"
                onPress={() => setShowEditProject(false)}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={handleSaveProject}
              >
                <Text className="text-surface font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Skills & Interests Modal (saved to NATTA backend) */}
      <Modal visible={showEditInterests} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-background rounded-3xl w-11/12 max-h-[80%]">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">
                Edit Skills &amp; Interests
              </Text>
            </View>
            <ScrollView className="px-6 py-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Skills &amp; interests (comma separated)
              </Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-2"
                value={editInterestsText}
                onChangeText={setEditInterestsText}
                placeholder="Marketing, Research, SQL, Scholarships"
                placeholderTextColor={colors.muted}
                multiline
              />
              <Text className="text-xs text-muted">
                Used to match you with opportunities on NATTA.
              </Text>
            </ScrollView>
            <View className="flex-row gap-3 px-6 py-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl py-3 items-center"
                onPress={() => setShowEditInterests(false)}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={handleSaveInterests}
              >
                <Text className="text-surface font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
