import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import Pdf from "react-native-pdf";

type SavedDoc = {
  uri: string;
  name: string;
  mimeType: string;
  createdAt: number;
};

const DOC_DIR = `${FileSystem.documentDirectory}documents/`;

async function ensureDocDir() {
  const info = await FileSystem.getInfoAsync(DOC_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOC_DIR, { intermediates: true });
  }
}

async function listDocs(): Promise<SavedDoc[]> {
  await ensureDocDir();
  const files = await FileSystem.readDirectoryAsync(DOC_DIR);
  const docs = await Promise.all(
    files.map(async (f) => {
      const uri = `${DOC_DIR}${f}`;
      const info = await FileSystem.getInfoAsync(uri);
      const ext = f.split(".").pop()?.toLowerCase() ?? "";
      return {
        uri,
        name: f,
        mimeType: ext === "pdf" ? "application/pdf" : ext,
        createdAt:
          info.exists && "modificationTime" in info ? info.modificationTime * 1000 : 0,
      } as SavedDoc;
    }),
  );
  return docs.sort((a, b) => b.createdAt - a.createdAt);
}

function isPdf(doc: SavedDoc) {
  return doc.mimeType === "application/pdf" || doc.name.toLowerCase().endsWith(".pdf");
}

export default function DocumentReaderScreen() {
  const colors = useColors();
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [openDoc, setOpenDoc] = useState<SavedDoc | null>(null);

  useEffect(() => {
    listDocs().then(setDocs).catch(() => {});
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      await ensureDocDir();
      const safeName = asset.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const dest = `${DOC_DIR}${Date.now()}_${safeName}`;
      await FileSystem.copyAsync({ from: asset.uri, to: dest });

      const updated = await listDocs();
      setDocs(updated);
    } catch (err) {
      console.warn("[docs] pick failed", err);
      Alert.alert("Could not open document", "Something went wrong picking the file.");
    }
  };

  const removeDoc = (doc: SavedDoc) => {
    Alert.alert("Remove document", `Remove "${doc.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await FileSystem.deleteAsync(doc.uri, { idempotent: true });
            setDocs((prev) => prev.filter((d) => d.uri !== doc.uri));
            if (openDoc?.uri === doc.uri) setOpenDoc(null);
          } catch (err) {
            console.warn("[docs] delete failed", err);
          }
        },
      },
    ]);
  };

  // Viewer mode
  if (openDoc) {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => setOpenDoc(null)} className="flex-row items-center gap-2">
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            <Text className="text-foreground font-semibold">Back</Text>
          </TouchableOpacity>
          <Text className="text-foreground font-semibold flex-1 text-center" numberOfLines={1}>
            {openDoc.name}
          </Text>
          <View className="w-16" />
        </View>

        {isPdf(openDoc) && Platform.OS !== "web" ? (
          <Pdf
            source={{ uri: openDoc.uri }}
            style={{
              flex: 1,
              width: Dimensions.get("window").width,
              backgroundColor: colors.background,
            }}
            onError={(err) => {
              console.warn("[docs] pdf render error", err);
              Alert.alert("Cannot display PDF", "This file could not be rendered.");
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <IconSymbol name="doc" size={64} color={colors.muted} />
            <Text className="text-muted mt-3 text-center">
              {Platform.OS === "web"
                ? "Document preview is only available on the mobile app."
                : "Preview for this file type isn't supported yet. Only PDF preview is available."}
            </Text>
          </View>
        )}
      </ScreenContainer>
    );
  }

  // List mode
  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
          <Text className="text-3xl font-bold text-foreground mb-2">Documents</Text>
          <Text className="text-base text-muted">Open and read your PDFs and documents</Text>
        </View>

        <View className="px-6 mb-6">
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2"
            onPress={pickDocument}
          >
            <IconSymbol name="plus" size={20} color={colors.surface} />
            <Text className="text-surface font-bold text-base">Open a document</Text>
          </TouchableOpacity>
        </View>

        <View className="px-6">
          {docs.length === 0 ? (
            <Card className="p-6 items-center">
              <IconSymbol name="doc" size={48} color={colors.muted} />
              <Text className="text-muted mt-3 text-center">
                No documents yet. Tap &quot;Open a document&quot; to add one.
              </Text>
            </Card>
          ) : (
            docs.map((doc) => (
              <TouchableOpacity key={doc.uri} className="mb-3" onPress={() => setOpenDoc(doc)}>
                <Card>
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 bg-background rounded-xl items-center justify-center">
                      <IconSymbol
                        name={isPdf(doc) ? "doc.fill" : "doc"}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                        {doc.name}
                      </Text>
                      <Text className="text-sm text-muted">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="w-10 h-10 bg-background rounded-full items-center justify-center"
                      onPress={() => removeDoc(doc)}
                    >
                      <IconSymbol name="trash" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
