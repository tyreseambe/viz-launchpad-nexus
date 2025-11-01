import { cn } from "@/lib/utils";

interface KeyDisplayProps {
  label: string;
  isPressed: boolean;
  className?: string;
  variant?: "default" | "mouse";
}

export const KeyDisplay = ({ label, isPressed, className, variant = "default" }: KeyDisplayProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center font-audiowide text-lg font-bold border-2 transition-all duration-100",
        "bg-card/80 backdrop-blur-sm",
        isPressed 
          ? "border-primary text-primary shadow-glow-cyan scale-95 animate-key-press" 
          : "border-muted text-muted-foreground",
        variant === "mouse" ? "rounded-full w-16 h-16" : "rounded-lg w-20 h-20",
        className
      )}
    >
      {isPressed && (
        <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
      )}
      <span className="relative z-10">{label}</span>
    </div>
  );
};
