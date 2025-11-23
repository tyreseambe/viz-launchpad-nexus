import { useEffect, useState } from "react";
import vizLogo from "@/assets/vizblack.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 500);
          }, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.15),transparent_50%)] animate-pulse" />

      {/* Logo */}
      <div className="relative z-10 mb-12 animate-fade-in">
        <div className="relative">
          <img
            src={vizLogo}
            alt="VIZ Logo"
            className="w-48 h-48 object-contain animate-scale-in"
          />
          <div className="absolute inset-0 bg-primary/20 blur-3xl animate-glow-pulse" />
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 mb-8 text-center animate-fade-in" style={{ animationDelay: "300ms" }}>
        <h1 className="text-4xl font-audiowide text-foreground mb-2">VIZ Client</h1>
        <p className="text-muted-foreground">Vision Zero Esports</p>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 w-64 h-2 bg-muted/30 rounded-full overflow-hidden animate-fade-in" style={{ animationDelay: "600ms" }}>
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out shadow-glow-cyan"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading Text */}
      <p className="relative z-10 mt-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "900ms" }}>
        Loading... {progress}%
      </p>
    </div>
  );
};
