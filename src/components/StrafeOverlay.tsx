import { useState, useEffect } from "react";
import { KeyDisplay } from "./KeyDisplay";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Eye, EyeOff } from "lucide-react";

export const StrafeOverlay = () => {
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    ctrl: false,
    mouse1: false,
    mouse2: false,
  });
  
  const [transparentMode, setTransparentMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setKeys(prev => {
        const newKeys = { ...prev };
        
        if (key === "w") newKeys.w = true;
        if (key === "s") newKeys.s = true;
        if (key === " ") newKeys.space = true;
        if (key === "control") newKeys.ctrl = true;
        
        // Only one strafe key at a time
        if (key === "a") {
          newKeys.a = true;
          newKeys.d = false;
        }
        if (key === "d") {
          newKeys.d = true;
          newKeys.a = false;
        }
        
        return newKeys;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setKeys(prev => ({
        ...prev,
        w: key === "w" ? false : prev.w,
        a: key === "a" ? false : prev.a,
        s: key === "s" ? false : prev.s,
        d: key === "d" ? false : prev.d,
        space: key === " " ? false : prev.space,
        ctrl: key === "control" ? false : prev.ctrl,
      }));
    };

    const handleMouseDown = (e: MouseEvent) => {
      setKeys(prev => ({
        ...prev,
        mouse1: e.button === 0 ? true : prev.mouse1,
        mouse2: e.button === 2 ? true : prev.mouse2,
      }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      setKeys(prev => ({
        ...prev,
        mouse1: e.button === 0 ? false : prev.mouse1,
        mouse2: e.button === 2 ? false : prev.mouse2,
      }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <Card 
      className={cn(
        "relative p-8 border-2 border-primary/30 shadow-2xl",
        transparentMode 
          ? "bg-background/20 backdrop-blur-md" 
          : "bg-card/90 backdrop-blur-sm"
      )}
    >
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTransparentMode(!transparentMode)}
          className="border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          {transparentMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-audiowide text-primary mb-1">VIZ STRAFE</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Vision Zero Esports</p>
      </div>

      <div className="space-y-6">
        {/* Movement Keys */}
        <div className="flex flex-col items-center gap-2">
          <KeyDisplay label="W" isPressed={keys.w} />
          <div className="flex gap-2">
            <KeyDisplay label="A" isPressed={keys.a} />
            <KeyDisplay label="S" isPressed={keys.s} />
            <KeyDisplay label="D" isPressed={keys.d} />
          </div>
        </div>

        {/* Action Keys */}
        <div className="flex justify-center gap-4">
          <KeyDisplay label="SPACE" isPressed={keys.space} className="w-40" />
          <KeyDisplay label="CTRL" isPressed={keys.ctrl} className="w-28" />
        </div>

        {/* Mouse Buttons */}
        <div className="flex justify-center gap-4">
          <KeyDisplay label="M1" isPressed={keys.mouse1} variant="mouse" />
          <KeyDisplay label="M2" isPressed={keys.mouse2} variant="mouse" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Press keys to visualize • Toggle transparency for OBS
        </p>
      </div>
    </Card>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
