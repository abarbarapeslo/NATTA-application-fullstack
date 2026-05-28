import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  type CameraType,
} from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import { useFirebaseUser, firstNameFromUser } from "@/hooks/use-firebase-user";

type RecordedVideo = {
  uri: string;
  name: string;
  createdAt: number;
};

const VIDEO_DIR = `${FileSystem.documentDirectory}videos/`;

async function ensureVideoDir() {
  const info = await FileSystem.getInfoAsync(VIDEO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(VIDEO_DIR, { intermediates: true });
  }
}

async function listRecordedVideos(): Promise<RecordedVideo[]> {
  await ensureVideoDir();
  const files = await FileSystem.readDirectoryAsync(VIDEO_DIR);
  const videos = await Promise.all(
    files
      .filter((f) => f.endsWith(".mp4") || f.endsWith(".mov"))
      .map(async (f) => {
        const uri = `${VIDEO_DIR}${f}`;
        const info = await FileSystem.getInfoAsync(uri);
        return {
          uri,
          name: f,
          createdAt: info.exists && "modificationTime" in info ? info.modificationTime * 1000 : 0,
        } as RecordedVideo;
      }),
  );
  return videos.sort((a, b) => b.createdAt - a.createdAt);
}

export default function VideoSpaceScreen() {
  const colors = useColors();
  const firebaseUser = useFirebaseUser();
  const firstName = firstNameFromUser(firebaseUser) || "there";

  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [videos, setVideos] = useState<RecordedVideo[]>([]);

  const [scriptModal, setScriptModal] = useState(false);
  const [script, setScript] = useState(
    `Hello, my name is ${firstName} and I'm excited to introduce myself.`,
  );

  useEffect(() => {
    listRecordedVideos().then(setVideos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const ensurePermissions = async () => {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert("Camera permission needed", "Enable camera access to record videos.");
        return false;
      }
    }
    if (!micPermission?.granted) {
      const res = await requestMicPermission();
      if (!res.granted) {
        Alert.alert("Microphone permission needed", "Enable microphone access to record videos.");
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    const ok = await ensurePermissions();
    if (!ok) return;

    setIsRecording(true);
    setElapsed(0);
    try {
      const video = await cameraRef.current.recordAsync();
      if (video?.uri) {
        await ensureVideoDir();
        const dest = `${VIDEO_DIR}natta_${Date.now()}.mp4`;
        await FileSystem.moveAsync({ from: video.uri, to: dest });
        const updated = await listRecordedVideos();
        setVideos(updated);
      }
    } catch (err) {
      console.warn("[video] recording failed", err);
      Alert.alert("Recording failed", "Something went wrong while recording.");
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  const deleteVideo = (video: RecordedVideo) => {
    Alert.alert("Delete video", "Remove this recording?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await FileSystem.deleteAsync(video.uri, { idempotent: true });
            setVideos((prev) => prev.filter((v) => v.uri !== video.uri));
          } catch (err) {
            console.warn("[video] delete failed", err);
          }
        },
      },
    ]);
  };

  const cameraUnavailable = Platform.OS === "web";

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
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
          <TouchableOpacity onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Camera Preview */}
        <View className="px-6 mb-4">
          <Card className="aspect-video bg-background items-center justify-center overflow-hidden p-0">
            {cameraUnavailable ? (
              <View className="flex-1 items-center justify-center">
                <IconSymbol name="video.fill" size={64} color={colors.muted} />
                <Text className="text-sm text-muted mt-2">
                  Camera is only available on the mobile app
                </Text>
              </View>
            ) : !cameraPermission?.granted ? (
              <View className="flex-1 items-center justify-center px-6">
                <IconSymbol name="video.fill" size={64} color={colors.muted} />
                <Text className="text-sm text-muted mt-2 text-center mb-4">
                  Camera access is needed to record videos
                </Text>
                <TouchableOpacity
                  className="bg-primary rounded-full px-5 py-2"
                  onPress={ensurePermissions}
                >
                  <Text className="text-surface font-semibold">Enable Camera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <CameraView
                ref={cameraRef}
                style={{ width: "100%", aspectRatio: 16 / 9 }}
                facing={facing}
                mode="video"
              />
            )}
          </Card>
        </View>

        {/* Teleprompter */}
        <View className="px-6 mb-4">
          <Card>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-bold text-foreground">Teleprompter</Text>
              <TouchableOpacity onPress={() => setScriptModal(true)}>
                <IconSymbol name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-muted leading-5">
              {script || "Tap the pencil to write your teleprompter script..."}
            </Text>
          </Card>
        </View>

        {/* Recording Controls */}
        {!cameraUnavailable && (
          <View className="px-6 mb-6">
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="w-12" />
                <TouchableOpacity
                  className={`w-20 h-20 rounded-full items-center justify-center ${
                    isRecording ? "bg-error" : "bg-primary"
                  }`}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <View
                    className={
                      isRecording ? "w-7 h-7 bg-surface rounded" : "w-8 h-8 bg-surface rounded-full"
                    }
                  />
                </TouchableOpacity>
                <View className="items-center w-12">
                  <Text className="text-lg font-bold text-foreground">{formatTimer(elapsed)}</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Your Videos */}
        <View className="px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Your Videos</Text>

          {videos.length === 0 ? (
            <Card className="p-6 items-center">
              <IconSymbol name="video.fill" size={40} color={colors.muted} />
              <Text className="text-muted mt-3 text-center">
                No videos yet. Record your first introduction above.
              </Text>
            </Card>
          ) : (
            videos.map((video) => (
              <Card key={video.uri} className="mb-3">
                <View className="flex-row items-center gap-4">
                  <View className="w-20 h-20 bg-background rounded-xl items-center justify-center">
                    <IconSymbol name="video.fill" size={32} color={colors.foreground} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground mb-1" numberOfLines={1}>
                      {video.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="w-10 h-10 bg-background rounded-full items-center justify-center"
                    onPress={() => deleteVideo(video)}
                  >
                    <IconSymbol name="trash" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Teleprompter Script Modal */}
      <Modal visible={scriptModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-background rounded-3xl w-11/12 max-h-[80%]">
            <View className="px-6 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">Teleprompter Script</Text>
            </View>
            <ScrollView className="px-6 py-4">
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-foreground min-h-[120px]"
                value={script}
                onChangeText={setScript}
                placeholder="Write what you want to say on camera..."
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>
            <View className="flex-row gap-3 px-6 py-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={() => setScriptModal(false)}
              >
                <Text className="text-surface font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
