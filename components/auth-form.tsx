import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

function notify(title: string, message: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const colors = useColors();
  const isSignUp = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ensureConfigured = () => {
    if (!isFirebaseConfigured()) {
      notify(
        "Firebase not configured",
        "Set EXPO_PUBLIC_FIREBASE_* in your .env file and restart the dev server.",
      );
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      notify("Error", "Please fill in all fields");
      return;
    }
    if (!ensureConfigured()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      notify("Sign In Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !name) {
      notify("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      notify("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      notify("Error", "Password must be at least 6 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      notify("Error", "Password must contain at least one uppercase letter");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      notify("Error", "Password must contain at least one special character");
      return;
    }
    if (!ensureConfigured()) return;

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      await updateProfile(cred.user, { displayName: name });
      router.replace("/(tabs)");
    } catch (error: any) {
      notify("Sign Up Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      notify("Error", "Please enter your email address");
      return;
    }
    if (!ensureConfigured()) return;
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      notify("Success", "Password reset email sent! Check your inbox.");
    } catch (error: any) {
      notify("Error", error.message);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center pt-12 pb-8 px-6">
            <Image
              source={require("@/assets/images/natta_icon.png")}
              style={{ width: 150, height: 42 }}
              resizeMode="contain"
            />
            <Text className="text-3xl font-bold text-foreground mt-8">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text className="text-base text-muted mt-2 text-center">
              {isSignUp
                ? "Sign up to start your application journey"
                : "Sign in to continue to NATTA"}
            </Text>
          </View>

          <View className="px-6">
            <Card>
              {isSignUp && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Full Name
                  </Text>
                  <TextInput
                    className="bg-surface text-foreground px-4 py-3 rounded-lg border border-border"
                    placeholder="Enter your name"
                    placeholderTextColor={colors.muted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Email
                </Text>
                <TextInput
                  className="bg-surface text-foreground px-4 py-3 rounded-lg border border-border"
                  placeholder="Enter your email"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="bg-surface text-foreground px-4 py-3 pr-12 rounded-lg border border-border"
                    placeholder="Enter your password"
                    placeholderTextColor={colors.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 0,
                      bottom: 0,
                      justifyContent: "center",
                    }}
                    hitSlop={8}
                  >
                    <IconSymbol
                      name={showPassword ? "eye.slash" : "eye"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>
                {isSignUp && (
                  <Text className="text-xs text-muted mt-2">
                    At least 6 characters, one uppercase letter and one special character.
                  </Text>
                )}
              </View>

              {isSignUp && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Confirm Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="bg-surface text-foreground px-4 py-3 pr-12 rounded-lg border border-border"
                      placeholder="Confirm your password"
                      placeholderTextColor={colors.muted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 0,
                        bottom: 0,
                        justifyContent: "center",
                      }}
                      hitSlop={8}
                    >
                      <IconSymbol
                        name={showConfirmPassword ? "eye.slash" : "eye"}
                        size={20}
                        color={colors.muted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {!isSignUp && (
                <TouchableOpacity onPress={handleForgotPassword} className="mb-4">
                  <Text className="text-primary text-sm text-right">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={isSignUp ? handleSignUp : handleSignIn}
                disabled={loading}
                className="bg-primary py-4 rounded-lg items-center mb-4"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <Text className="text-white font-bold text-base">
                  {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center justify-center">
                <Text className="text-muted text-sm">
                  {isSignUp
                    ? "Already have an account? "
                    : "Don't have an account? "}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.replace(
                      (isSignUp ? "/auth/login" : "/auth/signup") as any,
                    )
                  }
                >
                  <Text className="text-primary font-semibold text-sm">
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
