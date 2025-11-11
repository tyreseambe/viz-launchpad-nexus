import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const ReactTest = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const maxAttempts = 10;

  const startTest = () => {
    if (!age) return;
    setHasStarted(true);
    setShowTarget(false);
    setCurrentAttempt(0);
    setAttempts([]);
    setIsComplete(false);
    nextRound();
  };

  const nextRound = () => {
    setShowTarget(false);
    const delay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      if (currentAttempt < maxAttempts) {
        setShowTarget(true);
        setStartTime(Date.now());
      }
    }, delay);
  };

  const handleClick = () => {
    if (!showTarget) return;

    const time = Date.now() - startTime;
    const newAttempts = [...attempts, time];
    setAttempts(newAttempts);
    setShowTarget(false);
    setCurrentAttempt((prev) => prev + 1);

    if (currentAttempt + 1 >= maxAttempts) {
      setIsComplete(true);
      setHasStarted(false);
    } else {
      nextRound();
    }
  };

  const reset = () => {
    setAge("");
    setHasStarted(false);
    setShowTarget(false);
    setCurrentAttempt(0);
    setAttempts([]);
    setIsComplete(false);
  };

  const averageTime = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
    : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-8 border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-audiowide text-foreground mb-4">VIZ React</h1>
            <p className="text-muted-foreground">Test your reaction time</p>
          </div>

          {!hasStarted && !isComplete && (
            <Card className="p-8 border-primary/20 bg-card/50 backdrop-blur-sm text-center space-y-6">
              <div>
                <label className="block text-foreground font-audiowide mb-2">Your Age</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="max-w-xs mx-auto"
                />
              </div>

              <Button
                onClick={startTest}
                disabled={!age}
                className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow-cyan"
              >
                Start Test (10 Attempts)
              </Button>
            </Card>
          )}

          {hasStarted && !isComplete && (
            <div className="space-y-4">
              <div className="text-center text-foreground font-audiowide">
                Attempt {currentAttempt + 1} / {maxAttempts}
              </div>
              <div
                onClick={handleClick}
                className={`w-full h-96 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                  showTarget
                    ? "bg-primary border-primary shadow-glow-cyan"
                    : "bg-card/30 border-primary/20"
                }`}
              >
                <p className="text-2xl font-audiowide text-foreground">
                  {showTarget ? "CLICK NOW!" : "Wait..."}
                </p>
              </div>
            </div>
          )}

          {isComplete && (
            <Card className="p-8 border-primary/20 bg-card/50 backdrop-blur-sm text-center space-y-6">
              <h2 className="text-2xl font-audiowide text-foreground mb-4">Test Complete!</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Average Reaction Time: <span className="text-primary text-3xl font-semibold block mt-2">{averageTime}ms</span>
                </p>
                <p className="text-muted-foreground">
                  Best: <span className="text-foreground font-semibold">{Math.min(...attempts)}ms</span>
                </p>
                <p className="text-muted-foreground">
                  Worst: <span className="text-foreground font-semibold">{Math.max(...attempts)}ms</span>
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={startTest}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Repeat Test
                </Button>
                <Button onClick={reset} variant="outline">
                  New User
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactTest;
