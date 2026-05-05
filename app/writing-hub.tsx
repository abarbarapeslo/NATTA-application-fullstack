import { ScrollView, Text, View, TextInput, TouchableOpacity, Image, Modal, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useCallback } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type Document = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function WritingHubScreen() {
  const colors = useColors();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load documents from storage
  const loadDocuments = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("writingDocuments");
      if (stored) {
        const docs = JSON.parse(stored);
        setDocuments(docs);
        setSelectedDoc((prev) => {
          if (docs.length > 0 && !prev) return docs[0];
          return prev;
        });
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDocuments();
    }, [loadDocuments])
  );

  const createNewDocument = async () => {
    if (!newDocTitle.trim()) {
      Alert.alert("Error", "Please enter a document title");
      return;
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      title: newDocTitle,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    setSelectedDoc(newDoc);
    setIsEditing(true);

    try {
      await AsyncStorage.setItem("writingDocuments", JSON.stringify(updatedDocs));
    } catch (error) {
      console.error("Error saving document:", error);
    }

    setNewDocTitle("");
    setShowNewDocModal(false);
  };

  const updateDocument = async (content: string) => {
    if (!selectedDoc) return;

    const updatedDoc = {
      ...selectedDoc,
      content,
      updatedAt: new Date().toISOString(),
    };

    const updatedDocs = documents.map((doc) =>
      doc.id === selectedDoc.id ? updatedDoc : doc
    );

    setDocuments(updatedDocs);
    setSelectedDoc(updatedDoc);

    try {
      await AsyncStorage.setItem("writingDocuments", JSON.stringify(updatedDocs));
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const updateTitle = async (title: string) => {
    if (!selectedDoc) return;

    const updatedDoc = {
      ...selectedDoc,
      title,
      updatedAt: new Date().toISOString(),
    };

    const updatedDocs = documents.map((doc) =>
      doc.id === selectedDoc.id ? updatedDoc : doc
    );

    setDocuments(updatedDocs);
    setSelectedDoc(updatedDoc);

    try {
      await AsyncStorage.setItem("writingDocuments", JSON.stringify(updatedDocs));
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  const wordCount = selectedDoc?.content.trim()
    ? selectedDoc.content.trim().split(/\s+/).length
    : 0;

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query)
    );
  });

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 100, height: 28 }}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text className="text-primary font-semibold">
              {isEditing ? "Done" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Documents List or Editor */}
        {!isEditing && documents.length > 0 ? (
          <View className="px-6">
            <Text className="text-xl font-bold text-foreground mb-4">My Documents</Text>
            
            {/* Search Bar */}
            <View className="mb-4">
              <Card>
                <View className="flex-row items-center gap-3">
                  <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
                  <TextInput
                    className="flex-1 text-base text-foreground"
                    placeholder="Search documents..."
                    placeholderTextColor={colors.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <IconSymbol name="xmark" size={18} color={colors.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            </View>

            {filteredDocuments.length === 0 ? (
              <Card>
                <Text className="text-center text-muted">
                  No documents found matching &quot;{searchQuery}&quot;
                </Text>
              </Card>
            ) : (
              filteredDocuments.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  onPress={() => {
                    setSelectedDoc(doc);
                    setIsEditing(true);
                  }}
                  className="mb-3"
                >
                  <Card>
                    <Text className="text-base font-bold text-foreground mb-1">
                      {doc.title}
                    </Text>
                    <Text className="text-sm text-muted mb-2" numberOfLines={2}>
                      {doc.content || "Empty document"}
                    </Text>
                    <Text className="text-xs text-muted">
                      Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : isEditing && selectedDoc ? (
          <>
            {/* Title Card */}
            <View className="px-6 mb-4">
              <Card>
                <TextInput
                  className="text-lg font-bold text-foreground"
                  value={selectedDoc.title}
                  onChangeText={updateTitle}
                  placeholder="Document Title"
                  placeholderTextColor={colors.muted}
                />
              </Card>
            </View>

            {/* Editor */}
            <View className="px-6 mb-4">
              <Card className="min-h-[400px]">
                <TextInput
                  className="text-base text-foreground leading-6"
                  value={selectedDoc.content}
                  onChangeText={updateDocument}
                  placeholder="Start writing your essay..."
                  placeholderTextColor={colors.muted}
                  multiline
                  textAlignVertical="top"
                />
              </Card>
            </View>

            {/* AI Suggestions Button */}
            <View className="px-6 mb-4">
              <TouchableOpacity className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2">
                <IconSymbol name="sparkles" size={20} color={colors.surface} />
                <Text className="text-surface font-bold text-base">Get AI Suggestions</Text>
              </TouchableOpacity>
            </View>

            {/* Toolbar */}
            <View className="px-6">
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row gap-4">
                    <TouchableOpacity>
                      <Text className="text-foreground font-bold text-lg">B</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text className="text-foreground italic text-lg">I</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text className="text-foreground underline text-lg">U</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="text-sm text-muted">{wordCount} words</Text>
                </View>
              </Card>
            </View>
          </>
        ) : (
          <View className="px-6 items-center justify-center" style={{ minHeight: 400 }}>
            <IconSymbol name="doc" size={64} color={colors.muted} />
            <Text className="text-lg font-semibold text-foreground mt-4 mb-2">
              No Documents Yet
            </Text>
            <Text className="text-sm text-muted text-center mb-6">
              Create your first writing document to get started
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-full px-6 py-3"
              onPress={() => setShowNewDocModal(true)}
            >
              <Text className="text-surface font-semibold">Create Document</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* FAB - Create New Document */}
      {documents.length > 0 && (
        <TouchableOpacity
          className="absolute bottom-8 right-8 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => setShowNewDocModal(true)}
        >
          <IconSymbol name="plus" size={24} color={colors.surface} />
        </TouchableOpacity>
      )}

      {/* New Document Modal */}
      <Modal visible={showNewDocModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View
            className="bg-surface rounded-2xl p-6 w-full max-w-sm"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xl font-bold text-foreground mb-4">New Document</Text>

            <TextInput
              className="bg-background rounded-lg px-4 py-3 text-foreground mb-4"
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              placeholder="Document title"
              placeholderTextColor={colors.muted}
              value={newDocTitle}
              onChangeText={setNewDocTitle}
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowNewDocModal(false);
                  setNewDocTitle("");
                }}
                className="flex-1 bg-background rounded-lg py-3 items-center"
                style={{ backgroundColor: colors.background }}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={createNewDocument}
                className="flex-1 rounded-lg py-3 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
