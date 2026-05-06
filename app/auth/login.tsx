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
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export default function LoginScreen() {
  const colors = useColors();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      Alert.alert("Success", "Password reset email sent! Check your inbox.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
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
          {/* Logo and Header */}
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
                : "Sign in to continue to Natta"}
            </Text>
          </View>

          {/* Form */}
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
                <TextInput
                  className="bg-surface text-foreground px-4 py-3 rounded-lg border border-border"
                  placeholder="Enter your password"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {isSignUp && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Confirm Password
                  </Text>
                  <TextInput
                    className="bg-surface text-foreground px-4 py-3 rounded-lg border border-border"
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.muted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              )}

              {!isSignUp && (
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  className="mb-4"
                >
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
                  {loading
                    ? "Loading..."
                    : isSignUp
                      ? "Sign Up"
                      : "Sign In"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center justify-center">
                <Text className="text-muted text-sm">
                  {isSignUp
                    ? "Already have an account? "
                    : "Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
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
