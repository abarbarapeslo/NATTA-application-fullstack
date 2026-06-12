import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useDrafts } from "@/hooks/use-drafts";
import { telemetry } from "@/lib/telemetry";
import type { Draft } from "@/lib/firestore";

function formatRelative(ts: any): string {
  if (!ts) return "";
  try {
    const date = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

export default function ResumeAssistantScreen() {
  const colors = useColors();
  const { drafts, loading, createDraft, updateDraft, removeDraft } = useDrafts();

  useEffect(() => {
    telemetry.screen("resume_assistant");
  }, []);

  const [editing, setEditing] = useState<Draft | null>(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const openEditor = (draft: Draft) => {
    setEditing(draft);
    setEditorTitle(draft.title);
    setEditorContent(draft.content);
  };

  const closeEditor = () => {
    setEditing(null);
    setEditorTitle("");
    setEditorContent("");
  };

  const saveCurrent = async () => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      await updateDraft(editing.id, {
        title: editorTitle.trim() || "Untitled",
        content: editorContent,
      });
      closeEditor();
    } catch (err: any) {
      Alert.alert("Could not save", err?.message ?? "Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Title required", "Give your draft a title to get started.");
      return;
    }
    try {
      const created = await createDraft(newTitle);
      telemetry.event("draft_created");
      setShowNewModal(false);
      setNewTitle("");
      openEditor(created);
    } catch (err: any) {
      Alert.alert("Could not create", err?.message ?? "Try again.");
    }
  };

  const confirmDelete = (draft: Draft) => {
    if (!draft.id) return;
    Alert.alert("Delete draft", `Delete "${draft.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await removeDraft(draft.id!);
          } catch (err: any) {
            Alert.alert("Could not delete", err?.message ?? "Try again.");
          }
        },
      },
    ]);
  };

  // Editor mode
  if (editing) {
    const wordCount = editorContent.trim()
      ? editorContent.trim().split(/\s+/).length
      : 0;

    return (
      <ScreenContainer className="bg-background">
        {/* Editor header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
          <TouchableOpacity
            onPress={closeEditor}
            className="flex-row items-center gap-2"
            disabled={saving}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            <Text className="text-foreground font-semibold">Back</Text>
          </TouchableOpacity>
          <Text className="text-sm text-muted">{wordCount} words</Text>
          <TouchableOpacity onPress={saveCurrent} disabled={saving}>
            <Text className="text-primary font-semibold">
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI coming soon banner */}
        <View className="mx-6 mt-3 mb-2 bg-primary/10 rounded-2xl px-4 py-3 flex-row items-center gap-3">
          <IconSymbol name="sparkles" size={18} color={colors.primary} />
          <Text className="flex-1 text-xs text-foreground">
            AI assistance is coming soon. For now, write and save your drafts.
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="px-6 pt-3">
            <Card>
              <TextInput
                className="text-lg font-bold text-foreground"
                value={editorTitle}
                onChangeText={setEditorTitle}
                placeholder="Draft title"
                placeholderTextColor={colors.muted}
              />
            </Card>
          </View>

          <View className="px-6 mt-3">
            <Card className="min-h-[400px]">
              <TextInput
                className="text-base text-foreground leading-6"
                value={editorContent}
                onChangeText={setEditorContent}
                placeholder="Start writing your essay, cover letter, or notes..."
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
                style={{ minHeight: 380 }}
              />
            </Card>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // List mode
  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
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
        </View>

        <View className="px-6 mb-4">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Resume Assistant
          </Text>
          <Text className="text-base text-muted">
            Drafts for essays, cover letters and CV text
          </Text>
        </View>

        {/* AI coming soon banner */}
        <View className="mx-6 mb-4 bg-primary/10 rounded-2xl px-4 py-3 flex-row items-center gap-3">
          <IconSymbol name="sparkles" size={20} color={colors.primary} />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              AI assistance coming soon
            </Text>
            <Text className="text-xs text-muted mt-0.5">
              Write your drafts now — AI suggestions will plug in here later.
            </Text>
          </View>
        </View>

        {/* New draft button */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2"
            onPress={() => {
              setNewTitle("");
              setShowNewModal(true);
            }}
          >
            <IconSymbol name="plus" size={20} color={colors.surface} />
            <Text className="text-surface font-bold text-base">New draft</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <View className="px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Your drafts</Text>

          {loading && drafts.length === 0 ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : drafts.length === 0 ? (
            <Card className="p-6 items-center">
              <IconSymbol name="doc.text" size={48} color={colors.muted} />
              <Text className="text-muted mt-3 text-center">
                No drafts yet. Tap &quot;New draft&quot; to start writing.
              </Text>
            </Card>
          ) : (
            drafts.map((draft) => {
              const preview = draft.content.trim().slice(0, 120);
              return (
                <TouchableOpacity
                  key={draft.id}
                  className="mb-3"
                  onPress={() => openEditor(draft)}
                >
                  <Card>
                    <View className="flex-row items-start gap-3">
                      <View className="w-12 h-12 bg-background rounded-xl items-center justify-center">
                        <IconSymbol
                          name="doc.text"
                          size={24}
                          color={colors.foreground}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-base font-bold text-foreground mb-1"
                          numberOfLines={1}
                        >
                          {draft.title}
                        </Text>
                        <Text className="text-sm text-muted" numberOfLines={2}>
                          {preview || "Empty draft"}
                        </Text>
                        {draft.updatedAt && (
                          <Text className="text-xs text-muted mt-1">
                            Updated {formatRelative(draft.updatedAt)}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => confirmDelete(draft)}
                        className="w-10 h-10 bg-background rounded-full items-center justify-center"
                      >
                        <IconSymbol name="trash" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* New Draft Modal */}
      <Modal visible={showNewModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-background rounded-3xl w-full max-w-sm">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">New draft</Text>
            </View>
            <View className="px-6 py-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Title</Text>
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground mb-2"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. Harvard SOP, MIT cover letter"
                placeholderTextColor={colors.muted}
                autoFocus
              />
            </View>
            <View className="flex-row gap-3 px-6 py-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl py-3 items-center"
                onPress={() => setShowNewModal(false)}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={handleCreate}
              >
                <Text className="text-surface font-semibold">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
