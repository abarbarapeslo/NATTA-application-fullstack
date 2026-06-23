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
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import {
  signInWithGoogle,
  GoogleSignInCancelledError,
} from "@/lib/google-signin";
import { telemetry } from "@/lib/telemetry";
import { useTranslation } from "@/hooks/use-locale";
import type { TranslationKey } from "@/lib/i18n";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(
  code: string | undefined,
  t: (key: TranslationKey) => string,
): string {
  switch (code) {
    case "auth/invalid-email":
      return t("auth.error.invalidEmail");
    case "auth/user-disabled":
      return t("auth.error.userDisabled");
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return t("auth.error.wrongPassword");
    case "auth/too-many-requests":
      return t("auth.error.tooManyRequests");
    case "auth/email-already-in-use":
      return t("auth.error.emailInUse");
    case "auth/weak-password":
      return t("auth.error.weakPassword");
    case "auth/network-request-failed":
      return t("auth.error.network");
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return t("auth.error.cancelled");
    default:
      return t("auth.error.generic");
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
  const { t } = useTranslation();
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
        t("auth.firebaseNotConfigured"),
        t("auth.firebaseNotConfiguredMessage"),
      );
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      notify(t("common.error"), t("auth.fillAllFields"));
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      notify(t("common.error"), t("auth.invalidEmail"));
      return;
    }
    if (!ensureConfigured()) return;

    setLoading(true);
    try {
      await getFirebaseAuth().signInWithEmailAndPassword(email, password);
      telemetry.event("login_success", { method: "password" });
      router.replace("/(tabs)");
    } catch (error: any) {
      telemetry.event("login_failed", { method: "password", code: error?.code ?? "unknown" });
      notify(t("auth.signInFailed"), friendlyAuthError(error?.code, t));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !name) {
      notify(t("common.error"), t("auth.fillAllFields"));
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      notify(t("common.error"), t("auth.invalidEmail"));
      return;
    }
    if (password !== confirmPassword) {
      notify(t("common.error"), t("auth.passwordMismatch"));
      return;
    }
    if (password.length < 6) {
      notify(t("common.error"), t("auth.passwordMinLength"));
      return;
    }
    if (!/[A-Z]/.test(password)) {
      notify(t("common.error"), t("auth.passwordUppercase"));
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      notify(t("common.error"), t("auth.passwordSpecial"));
      return;
    }
    if (!ensureConfigured()) return;

    setLoading(true);
    try {
      const cred = await getFirebaseAuth().createUserWithEmailAndPassword(
        email,
        password,
      );
      await cred.user.updateProfile({ displayName: name });
      try {
        await cred.user.sendEmailVerification();
      } catch (verifyErr) {
        console.warn("[auth] failed to send verification email", verifyErr);
      }
      telemetry.event("signup_success", { method: "password" });
      notify(
        t("auth.verifyEmailTitle"),
        t("auth.verifyEmailMessage", { email }),
      );
      router.replace("/(tabs)");
    } catch (error: any) {
      notify(t("auth.signUpFailed"), friendlyAuthError(error?.code, t));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      notify(t("common.error"), t("auth.invalidEmail"));
      return;
    }
    if (!ensureConfigured()) return;
    try {
      await getFirebaseAuth().sendPasswordResetEmail(email);
      notify(t("common.success"), t("auth.resetEmailSent"));
    } catch (error: any) {
      notify(t("common.error"), friendlyAuthError(error?.code, t));
    }
  };

  const handleGoogleSignIn = async () => {
    if (!ensureConfigured()) return;
    setLoading(true);
    try {
      await signInWithGoogle();
      telemetry.event("login_success", { method: "google" });
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error instanceof GoogleSignInCancelledError) {
        telemetry.event("login_cancelled", { method: "google" });
        return;
      }
      telemetry.event("login_failed", { method: "google", code: error?.code ?? "unknown" });
      notify(t("auth.googleSignInFailed"), friendlyAuthError(error?.code, t));
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
              {isSignUp ? t("auth.signUpTitle") : t("auth.signInTitle")}
            </Text>
            <Text className="text-base text-muted mt-2 text-center">
              {isSignUp ? t("auth.signUpSubtitle") : t("auth.signInSubtitle")}
            </Text>
          </View>

          <View className="px-6">
            <Card>
              {isSignUp && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    {t("auth.nickname")}
                  </Text>
                  <TextInput
                    className="bg-surface text-foreground px-4 py-3 rounded-lg border border-border"
                    placeholder={t("auth.nicknamePlaceholder")}
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
                  {t("auth.email")}
                </Text>
                <TextInput
                  ref={emailRef}
                  className={`bg-surface text-foreground px-4 py-3 rounded-lg border ${emailBorder}`}
                  placeholder={t("auth.emailPlaceholder")}
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
                    {t("auth.invalidEmail")}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  {t("auth.password")}
                </Text>
                <View className="relative">
                  <TextInput
                    ref={passwordRef}
                    className="bg-surface text-foreground px-4 py-3 pr-12 rounded-lg border border-border"
                    placeholder={t("auth.passwordPlaceholder")}
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
                    {t("auth.passwordHint")}
                  </Text>
                )}
              </View>

              {isSignUp && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    {t("auth.confirmPassword")}
                  </Text>
                  <View className="relative">
                    <TextInput
                      ref={confirmRef}
                      className="bg-surface text-foreground px-4 py-3 pr-12 rounded-lg border border-border"
                      placeholder={t("auth.confirmPasswordPlaceholder")}
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
                    {t("auth.forgotPassword")}
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
                  {loading ? t("auth.loading") : isSignUp ? t("auth.signUp") : t("auth.signIn")}
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
                <Text className="text-muted text-xs mx-3">{t("auth.or")}</Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={loading}
                className="flex-row items-center justify-center py-3 rounded-lg border border-border mb-4"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <FontAwesome name="google" size={18} color={colors.foreground} />
                <Text className="text-foreground font-semibold ml-3">
                  {t("auth.continueGoogle")}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center justify-center">
                <Text className="text-muted text-sm">
                  {isSignUp ? t("auth.hasAccount") + " " : t("auth.noAccount") + " "}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.replace(
                      (isSignUp ? "/auth/login" : "/auth/signup") as any,
                    )
                  }
                >
                  <Text className="text-primary font-semibold text-sm">
                    {isSignUp ? t("auth.signIn") : t("auth.signUp")}
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
