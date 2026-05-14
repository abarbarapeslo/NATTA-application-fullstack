import { useRef, useState } from "react";
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
import { FontAwesome } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(code: string | undefined, fallback: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "The email address is not valid.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password is too weak. Try a longer one.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    default:
      return fallback || "Something went wrong. Please try again.";
  }
}

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
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const emailInvalid = emailTouched && email.length > 0 && !EMAIL_REGEX.test(email);

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
    if (!EMAIL_REGEX.test(email)) {
      notify("Error", "Please enter a valid email address");
      return;
    }
    if (!ensureConfigured()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      notify("Sign In Failed", friendlyAuthError(error?.code, error?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !name) {
      notify("Error", "Please fill in all fields");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      notify("Error", "Please enter a valid email address");
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
      try {
        await sendEmailVerification(cred.user);
      } catch (verifyErr) {
        console.warn("[auth] failed to send verification email", verifyErr);
      }
      notify(
        "Verify your email",
        `We sent a verification link to ${email}. Please check your inbox to confirm your account.`,
      );
      router.replace("/(tabs)");
    } catch (error: any) {
      notify("Sign Up Failed", friendlyAuthError(error?.code, error?.message));
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
      notify("Error", friendlyAuthError(error?.code, error?.message));
    }
  };

  const handleSocialSignIn = async (providerKind: "google" | "apple") => {
    if (!ensureConfigured()) return;

    if (Platform.OS !== "web") {
      notify(
        "Coming soon",
        `${providerKind === "google" ? "Google" : "Apple"} sign-in on mobile requires native setup. Use email for now.`,
      );
      return;
    }

    setLoading(true);
    try {
      const provider =
        providerKind === "google"
          ? new GoogleAuthProvider()
          : new OAuthProvider("apple.com");
      await signInWithPopup(getFirebaseAuth(), provider);
      router.replace("/(tabs)");
    } catch (error: any) {
      notify("Sign In Failed", friendlyAuthError(error?.code, error?.message));
    } finally {
      setLoading(false);
    }
  };

  const submit = isSignUp ? handleSignUp : handleSignIn;
  const emailBorder = emailInvalid ? "border-red-500" : "border-border";

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
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
              )}

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Email
                </Text>
                <TextInput
                  ref={emailRef}
                  className={`bg-surface text-foreground px-4 py-3 rounded-lg border ${emailBorder}`}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() => setEmailTouched(true)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {emailInvalid && (
                  <Text className="text-xs text-red-500 mt-2">
                    Please enter a valid email address.
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    ref={passwordRef}
                    className="bg-surface text-foreground px-4 py-3 pr-12 rounded-lg border border-border"
                    placeholder="Enter your password"
                    placeholderTextColor={colors.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType={isSignUp ? "next" : "done"}
                    onSubmitEditing={() => {
                      if (isSignUp) {
                        confirmRef.current?.focus();
                      } else {
                        submit();
                      }
                    }}
                    blurOnSubmit={!isSignUp}
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
                      ref={confirmRef}
                      className="bg-surface text-foreground px-4 py-3 pr-12 rounded-lg border border-border"
                      placeholder="Confirm your password"
                      placeholderTextColor={colors.muted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={submit}
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
                onPress={submit}
                disabled={loading}
                className="bg-primary py-4 rounded-lg items-center mb-3"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <Text className="text-white font-bold text-base">
                  {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                </Text>
              </TouchableOpacity>

              {isSignUp && (
                <Text className="text-xs text-muted text-center mb-3 leading-relaxed">
                  By signing up, you agree to our{" "}
                  <Text
                    className="text-primary font-semibold"
                    onPress={() => router.push("/legal/terms" as any)}
                  >
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    className="text-primary font-semibold"
                    onPress={() => router.push("/legal/privacy" as any)}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              )}

              <View className="flex-row items-center my-2">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-muted text-xs mx-3">OR</Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              <TouchableOpacity
                onPress={() => handleSocialSignIn("google")}
                disabled={loading}
                className="flex-row items-center justify-center py-3 rounded-lg border border-border mb-3"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <FontAwesome name="google" size={18} color={colors.foreground} />
                <Text className="text-foreground font-semibold ml-3">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSocialSignIn("apple")}
                disabled={loading}
                className="flex-row items-center justify-center py-3 rounded-lg bg-black mb-4"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <FontAwesome name="apple" size={20} color="#fff" />
                <Text className="text-white font-semibold ml-3">
                  Continue with Apple
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
