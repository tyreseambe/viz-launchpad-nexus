import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
}

const AimTrack = () => {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<string | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sensitivity, setSensitivity] = useState(1);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const scenarios = [
    { id: "grid", name: "Grid Shot", duration: 60, targetCount: 1, targetSize: 80 },
    { id: "tracking", name: "Tracking", duration: 45, targetCount: 1, targetSize: 60 },
    { id: "flick", name: "Flick Shot", duration: 30, targetCount: 1, targetSize: 50 },
    { id: "multi", name: "Multi Target", duration: 60, targetCount: 3, targetSize: 70 },
  ];

  const startScenario = (scenarioId: string) => {
    const selected = scenarios.find((s) => s.id === scenarioId);
    if (!selected) return;

    setScenario(scenarioId);
    setScore(0);
    setTimeLeft(selected.duration);
    setIsActive(true);
    spawnTargets(selected.targetCount, selected.targetSize);
  };

  const spawnTargets = (count: number, size: number) => {
    if (!gameAreaRef.current) return;
    
    const area = gameAreaRef.current.getBoundingClientRect();
    const newTargets: Target[] = [];

    for (let i = 0; i < count; i++) {
      newTargets.push({
        id: Date.now() + i,
        x: Math.random() * (area.width - size),
        y: Math.random() * (area.height - size),
        size,
      });
    }

    setTargets(newTargets);
  };

  const handleTargetClick = (targetId: number) => {
    if (isPaused) return;
    
    const selected = scenarios.find((s) => s.id === scenario);
    if (!selected) return;

    setScore((prev) => prev + 1);
    setTargets((prev) => prev.filter((t) => t.id !== targetId));
    
    setTimeout(() => {
      if (isActive && !isPaused) {
        spawnTargets(selected.targetCount, selected.targetSize);
      }
    }, 100);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const reset = () => {
    setScenario(null);
    setTargets([]);
    setScore(0);
    setTimeLeft(0);
    setIsActive(false);
  };

  useEffect(() => {
    if (!isActive || timeLeft <= 0 || isPaused) {
      if (timeLeft === 0 && isActive) {
        setIsActive(false);
        setTargets([]);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {scenario && (
            <div className="flex items-center gap-4">
              <div className="text-foreground font-audiowide">
                Score: <span className="text-primary text-2xl">{score}</span>
              </div>
              <div className="text-foreground font-audiowide">
                Time: <span className="text-secondary text-2xl">{timeLeft}s</span>
              </div>
              <Button onClick={togglePause} variant="outline" className="border-primary/30">
                {isPaused ? "Resume (P)" : "Pause (P)"}
              </Button>
              <Button onClick={reset} variant="outline" className="border-primary/30">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          )}
        </div>

        {!scenario ? (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-audiowide text-foreground mb-4">VIZ AimTrack</h1>
              <p className="text-muted-foreground">Select a scenario to begin training</p>
            </div>

            <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-audiowide text-foreground mb-4">Sensitivity (Mouse Speed)</h3>
              <div className="flex items-center gap-4">
                <Slider
                  value={[sensitivity]}
                  onValueChange={(val) => setSensitivity(val[0])}
                  min={0.1}
                  max={3}
                  step={0.01}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value) || 0.1)}
                  min={0.1}
                  max={3}
                  step={0.001}
                  className="w-24"
                />
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenarios.map((s) => (
                <Card
                  key={s.id}
                  className="p-6 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/60 transition-all cursor-pointer group"
                  onClick={() => startScenario(s.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-audiowide text-foreground">{s.name}</h3>
                    <Play className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Duration: {s.duration}s</p>
                  <p className="text-sm text-muted-foreground">
                    Targets: {s.targetCount} ({s.targetSize}px)
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div
            ref={gameAreaRef}
            className="relative w-full h-[600px] bg-card/30 backdrop-blur-sm border-2 border-primary/20 rounded-lg overflow-hidden"
            style={{ 
              cursor: "crosshair",
              pointerEvents: isPaused ? "none" : "auto",
              opacity: isPaused ? 0.5 : 1,
            }}
          >
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-4xl font-audiowide text-primary bg-card/90 px-8 py-4 rounded-lg border-2 border-primary">
                  PAUSED - Press P to Resume
                </div>
              </div>
            )}
            {targets.map((target) => (
              <div
                key={target.id}
                onClick={() => handleTargetClick(target.id)}
                className="absolute rounded-full bg-primary hover:bg-primary/80 transition-all cursor-crosshair shadow-glow-cyan"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AimTrack;
