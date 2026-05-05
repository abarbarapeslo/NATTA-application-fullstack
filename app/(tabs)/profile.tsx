import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Tag } from "@/components/ui/tag";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_STORAGE_KEY = "@natta_profile";
const LEGACY_PROFILE_STORAGE_KEY = "@aipply_profile";

type Education = {
  id: number;
  institution: string;
  degree: string;
  period: string;
};

type Experience = {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
};

type Project = {
  id: number;
  title: string;
  description: string;
  tags: string[];
};

export default function ProfileScreen() {
  const colors = useColors();
  
  // Profile data state
  const [profile, setProfile] = useState({
    name: "Giulia Alvares",
    title: "Business Student at PUCPR",
    bio: "Passionate about business strategy and innovation",
    education: [
      {
        id: 1,
        institution: "PUCPR - Pontifícia Universidade Católica do Paraná",
        degree: "Bachelor of Business Administration",
        period: "Jan 2020 - Present",
      },
    ] as Education[],
    experience: [
      {
        id: 1,
        title: "Business Strategy Intern",
        company: "TechSolutions Inc.",
        period: "Jun 2022 - Dec 2022",
        description:
          "Business strategy intern at TechSolutions Inc. with core responsibilities and financial communications.",
      },
    ] as Experience[],
    projects: [
      {
        id: 1,
        title: "Market Analysis Report",
        description: "Market analysis report share data analysis or conceptng to analysis and market research.",
        tags: ["Data Analysis", "Market Research", "Excel"],
      },
      {
        id: 2,
        title: "Startup Pitch Deck",
        description: "Startup pitch deck share presentation and analyst financial analysis and strategic modeling.",
        tags: ["Presentation", "Financial Modeling", "Strategy"],
      },
    ] as Project[],
    skills: [
      "Project Management",
      "Digital Marketing",
      "Team Leadership",
      "Financial Analysis",
      "Communication",
      "Strategic Planning",
      "SQL",
    ],
  });

  // Modal states
  const [showEditBasic, setShowEditBasic] = useState(false);
  const [showEditEducation, setShowEditEducation] = useState(false);
  const [showEditExperience, setShowEditExperience] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showEditSkills, setShowEditSkills] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState("");
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
  
  const [editSkillsText, setEditSkillsText] = useState("");

  // Load profile from AsyncStorage
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile =
        (await AsyncStorage.getItem(PROFILE_STORAGE_KEY)) ??
        (await AsyncStorage.getItem(LEGACY_PROFILE_STORAGE_KEY));
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const saveProfile = async (updatedProfile: typeof profile) => {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      await AsyncStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY);
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleEditBasicInfo = () => {
    setEditName(profile.name);
    setEditTitle(profile.title);
    setEditBio(profile.bio);
    setShowEditBasic(true);
  };

  const handleSaveBasicInfo = () => {
    const updated = { ...profile, name: editName, title: editTitle, bio: editBio };
    saveProfile(updated);
    setShowEditBasic(false);
  };

  const handleAddEducation = () => {
    setEditEduInstitution("");
    setEditEduDegree("");
    setEditEduPeriod("");
    setShowEditEducation(true);
  };

  const handleSaveEducation = () => {
    const newEducation: Education = {
      id: Date.now(),
      institution: editEduInstitution,
      degree: editEduDegree,
      period: editEduPeriod,
    };
    const updated = { ...profile, education: [...profile.education, newEducation] };
    saveProfile(updated);
    setShowEditEducation(false);
  };

  const handleAddExperience = () => {
    setEditExpTitle("");
    setEditExpCompany("");
    setEditExpPeriod("");
    setEditExpDescription("");
    setShowEditExperience(true);
  };

  const handleSaveExperience = () => {
    const newExperience: Experience = {
      id: Date.now(),
      title: editExpTitle,
      company: editExpCompany,
      period: editExpPeriod,
      description: editExpDescription,
    };
    const updated = { ...profile, experience: [...profile.experience, newExperience] };
    saveProfile(updated);
    setShowEditExperience(false);
  };

  const handleAddProject = () => {
    setEditProjTitle("");
    setEditProjDescription("");
    setEditProjTags("");
    setShowEditProject(true);
  };

  const handleSaveProject = () => {
    const newProject: Project = {
      id: Date.now(),
      title: editProjTitle,
      description: editProjDescription,
      tags: editProjTags.split(",").map((t) => t.trim()),
    };
    const updated = { ...profile, projects: [...profile.projects, newProject] };
    saveProfile(updated);
    setShowEditProject(false);
  };

  const handleEditSkills = () => {
    setEditSkillsText(profile.skills.join(", "));
    setShowEditSkills(true);
  };

  const handleSaveSkills = () => {
    const newSkills = editSkillsText.split(",").map((s) => s.trim()).filter((s) => s);
    const updated = { ...profile, skills: newSkills };
    saveProfile(updated);
    setShowEditSkills(false);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Image
            source={require("@/assets/images/logo.png")}
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
            {profile.education.map((edu) => (
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
            {profile.experience.map((exp) => (
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
            {profile.projects.map((proj) => (
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

          {/* Skills Section */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Skills</Text>
              <TouchableOpacity onPress={handleEditSkills}>
                <IconSymbol name="pencil" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <Tag key={idx} label={skill} />
              ))}
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
              <Text className="text-sm font-semibold text-foreground mb-2">Name</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
              />
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

      {/* Edit Skills Modal */}
      <Modal visible={showEditSkills} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-background rounded-3xl w-11/12 max-h-[80%]">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">Edit Skills</Text>
            </View>
            <ScrollView className="px-6 py-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Skills (comma separated)</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-4"
                value={editSkillsText}
                onChangeText={setEditSkillsText}
                placeholder="Project Management, Marketing, SQL"
                placeholderTextColor={colors.muted}
                multiline
              />
            </ScrollView>
            <View className="flex-row gap-3 px-6 py-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl py-3 items-center"
                onPress={() => setShowEditSkills(false)}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={handleSaveSkills}
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
