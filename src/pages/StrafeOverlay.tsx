import { useState, useEffect } from "react";
import { KeyDisplay } from "@/components/KeyDisplay";

const StrafeOverlay = () => {
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    ctrl: false,
    leftMouse: false,
    rightMouse: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "a" || key === "s" || key === "d") {
        setKeys((prev) => ({ ...prev, [key]: true }));
      }
      if (key === " ") setKeys((prev) => ({ ...prev, space: true }));
      if (key === "control") setKeys((prev) => ({ ...prev, ctrl: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "a" || key === "s" || key === "d") {
        setKeys((prev) => ({ ...prev, [key]: false }));
      }
      if (key === " ") setKeys((prev) => ({ ...prev, space: false }));
      if (key === "control") setKeys((prev) => ({ ...prev, ctrl: false }));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) setKeys((prev) => ({ ...prev, leftMouse: true }));
      if (e.button === 2) setKeys((prev) => ({ ...prev, rightMouse: true }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) setKeys((prev) => ({ ...prev, leftMouse: false }));
      if (e.button === 2) setKeys((prev) => ({ ...prev, rightMouse: false }));
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
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Movement Keys */}
      <div className="flex flex-col items-center gap-2">
        {/* W Key */}
        <KeyDisplay label="W" isPressed={keys.w} />
        
        {/* A S D Keys */}
        <div className="flex gap-2">
          <KeyDisplay label="A" isPressed={keys.a} />
          <KeyDisplay label="S" isPressed={keys.s} />
          <KeyDisplay label="D" isPressed={keys.d} />
        </div>

        {/* Space and Ctrl */}
        <div className="flex gap-2 mt-2">
          <KeyDisplay label="SPACE" isPressed={keys.space} className="w-32" />
          <KeyDisplay label="CTRL" isPressed={keys.ctrl} className="w-24" />
        </div>

        {/* Mouse Buttons */}
        <div className="flex gap-4 mt-4">
          <KeyDisplay label="L" isPressed={keys.leftMouse} variant="mouse" />
          <KeyDisplay label="R" isPressed={keys.rightMouse} variant="mouse" />
        </div>
      </div>
    </div>
  );
};

export default StrafeOverlay;
