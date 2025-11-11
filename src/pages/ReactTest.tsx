import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const React = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);

  const startTest = () => {
    if (!age) return;
    setHasStarted(true);
    setReactionTime(null);
    setShowTarget(false);

    const delay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      setShowTarget(true);
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (!showTarget) return;

    const time = Date.now() - startTime;
    setReactionTime(time);
    setAttempts((prev) => [...prev, time]);
    setShowTarget(false);
    setHasStarted(false);
  };

  const reset = () => {
    setAge("");
    setHasStarted(false);
    setShowTarget(false);
    setReactionTime(null);
    setAttempts([]);
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

          {!hasStarted && reactionTime === null && (
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
                Start Test
              </Button>

              {attempts.length > 0 && (
                <div className="mt-8 pt-8 border-t border-primary/20">
                  <h3 className="text-lg font-audiowide text-foreground mb-4">Your Results</h3>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Average: <span className="text-primary font-semibold">{averageTime}ms</span>
                    </p>
                    <p className="text-muted-foreground">
                      Attempts: <span className="text-foreground">{attempts.length}</span>
                    </p>
                    <Button onClick={reset} variant="outline" className="mt-4">
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {hasStarted && (
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
          )}

          {reactionTime !== null && !hasStarted && (
            <Card className="p-8 border-primary/20 bg-card/50 backdrop-blur-sm text-center space-y-6">
              <h2 className="text-3xl font-audiowide text-primary">{reactionTime}ms</h2>
              <p className="text-muted-foreground">
                {reactionTime < 200 ? "Incredible!" : reactionTime < 300 ? "Great!" : "Good!"}
              </p>
              <Button
                onClick={startTest}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Try Again
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default React;
