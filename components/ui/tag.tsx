import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface TagProps extends ViewProps {
  label: string;
  variant?: "default" | "primary" | "success" | "warning" | "error";
  className?: string;
}

export function Tag({ label, variant = "default", className, ...props }: TagProps) {
  return (
    <View
      className={cn(
        "px-3 py-1.5 rounded-full",
        variant === "default" && "bg-background",
        variant === "primary" && "bg-primary/10",
        variant === "success" && "bg-success/10",
        variant === "warning" && "bg-warning/10",
        variant === "error" && "bg-error/10",
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          "text-xs font-medium",
          variant === "default" && "text-foreground",
          variant === "primary" && "text-primary",
          variant === "success" && "text-success",
          variant === "warning" && "text-warning",
          variant === "error" && "text-error"
        )}
      >
        {label}
      </Text>
    </View>
  );
}
