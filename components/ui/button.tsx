import { Pressable, Text, View, type PressableProps, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  onPress,
  disabled,
  ...props
}: ButtonProps) {
  const colors = useColors();

  const handlePress = (event: any) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-3",
    lg: "px-8 py-4",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          transform: pressed && !disabled ? [{ scale: 0.97 }] : [{ scale: 1 }],
          opacity: pressed && !disabled ? 0.9 : disabled ? 0.5 : 1,
        },
      ]}
      {...props}
    >
      <View
        className={cn(
          "rounded-full items-center justify-center flex-row",
          sizeClasses[size],
          variant === "primary" && "bg-primary",
          variant === "secondary" && "bg-transparent border-2 border-primary",
          variant === "ghost" && "bg-transparent",
          className
        )}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "primary" ? colors.surface : colors.primary}
            size="small"
          />
        ) : (
          <Text
            className={cn(
              "font-semibold",
              textSizeClasses[size],
              variant === "primary" && "text-surface",
              variant === "secondary" && "text-primary",
              variant === "ghost" && "text-foreground"
            )}
          >
            {children}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
