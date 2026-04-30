import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "bg-surface rounded-2xl p-4 shadow-sm border border-border",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
