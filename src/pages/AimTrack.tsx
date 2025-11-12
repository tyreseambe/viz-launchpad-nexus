import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Play, RotateCcw, Trophy, LogOut, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
}

const AimTrack = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [scenario, setScenario] = useState<string | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sensitivity, setSensitivity] = useState(1);
  const [playerName, setPlayerName] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [selectedScenarioFilter, setSelectedScenarioFilter] = useState<string>("all");
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    setIsPaused(false);
    
    // Delay to ensure gameAreaRef is ready
    setTimeout(() => {
      spawnTargets(selected.targetCount, selected.targetSize);
    }, 100);
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

    // Combo system
    const newCombo = combo + 1;
    setCombo(newCombo);
    if (newCombo > maxCombo) setMaxCombo(newCombo);
    
    // Reset combo timer
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setCombo(0), 2000);

    // Score with combo multiplier
    const comboMultiplier = Math.floor(newCombo / 5) + 1;
    setScore((prev) => prev + (1 * comboMultiplier));
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
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(0);
    setIsActive(false);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
  };

  const submitScore = async () => {
    if (!user) {
      toast.error("Please log in to submit scores");
      navigate("/auth");
      return;
    }
    
    const { error } = await supabase.from("aim_leaderboard").insert({
      user_id: user.id,
      player_name: playerName || user.email?.split("@")[0] || "Anonymous",
      scenario: scenario || "",
      score: score,
      sensitivity: sensitivity,
    });

    if (error) {
      toast.error("Failed to submit score");
      console.error(error);
    } else {
      toast.success(`Score submitted! Max Combo: ${maxCombo}x`);
      fetchLeaderboard();
    }
  };

  const fetchLeaderboard = async () => {
    let query = supabase
      .from("aim_leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);
    
    if (selectedScenarioFilter !== "all") {
      query = query.eq("scenario", selectedScenarioFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setLeaderboardData(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setPlayerName(session.user.email.split("@")[0]);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email && !playerName) {
        setPlayerName(session.user.email.split("@")[0]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedScenarioFilter) {
      fetchLeaderboard();
    }
  }, [selectedScenarioFilter]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0 || isPaused) {
      if (timeLeft === 0 && isActive) {
        setIsActive(false);
        setTargets([]);
        if (score > 0) {
          toast.success(`Game Over! Final Score: ${score}`);
        }
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, isPaused, score]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Ensure targets respawn if they somehow disappear
  useEffect(() => {
    if (isActive && !isPaused && targets.length === 0) {
      const selected = scenarios.find((s) => s.id === scenario);
      if (selected) {
        spawnTargets(selected.targetCount, selected.targetSize);
      }
    }
  }, [isActive, isPaused, targets.length, scenario]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-primary/30"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-primary/30"
              >
                Login to Save Scores
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setShowLeaderboard(!showLeaderboard);
              if (!showLeaderboard) fetchLeaderboard();
            }}
            className="border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            <Trophy className="w-4 h-4 mr-2" />
            {showLeaderboard ? "Hide" : "Show"} Leaderboard
          </Button>

          {scenario && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-foreground font-audiowide">
                Score: <span className="text-primary text-2xl">{score}</span>
              </div>
              {combo > 0 && (
                <div className="text-foreground font-audiowide animate-pulse">
                  <Zap className="w-4 h-4 inline text-yellow-400" />
                  Combo: <span className="text-yellow-400 text-2xl">{combo}x</span>
                </div>
              )}
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

        {showLeaderboard && (
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-audiowide text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Global Leaderboard
              </h2>
              <Select value={selectedScenarioFilter} onValueChange={setSelectedScenarioFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scenarios</SelectItem>
                  {scenarios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {leaderboardData.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No scores yet. Be the first!</p>
              ) : (
                leaderboardData.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-primary/10"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-primary w-8">#{index + 1}</span>
                      <div>
                        <p className="font-audiowide text-foreground">{entry.player_name}</p>
                        <p className="text-sm text-muted-foreground">{entry.scenario}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{entry.score}</p>
                      <p className="text-xs text-muted-foreground">Sens: {entry.sensitivity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {!scenario ? (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-audiowide text-foreground mb-4">VIZ AimTrack</h1>
              <p className="text-muted-foreground">Select a scenario to begin training</p>
            </div>

            <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-audiowide text-foreground mb-4">Player Name</h3>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name for leaderboard"
                className="mb-2"
              />
            </Card>

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
          <div className="space-y-4">
            {timeLeft === 0 && (
              <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur-sm">
                <h3 className="text-2xl font-audiowide text-foreground mb-4">
                  Game Over! Score: {score} | Max Combo: {maxCombo}x
                </h3>
                {user ? (
                  <div className="flex gap-4">
                    <Input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1"
                    />
                    <Button onClick={submitScore} className="bg-primary hover:bg-primary/80">
                      Submit Score
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => navigate("/auth")} className="w-full bg-primary hover:bg-primary/80">
                    Login to Submit Score
                  </Button>
                )}
              </Card>
            )}
            
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
                className="absolute rounded-full transition-all cursor-crosshair border-4 border-cyan-400"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                  background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                  boxShadow: '0 0 20px rgba(132, 250, 176, 0.6), 0 0 40px rgba(132, 250, 176, 0.4)',
                }}
              />
            ))}

            {/* Gun Model */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Gun body */}
                <rect x="30" y="30" width="60" height="15" fill="hsl(var(--primary))" rx="2" />
                <rect x="20" y="35" width="15" height="8" fill="hsl(var(--primary))" rx="1" />
                {/* Barrel */}
                <rect x="85" y="32" width="25" height="11" fill="hsl(var(--foreground))" rx="1" />
                {/* Handle */}
                <rect x="40" y="45" width="12" height="25" fill="hsl(var(--primary))" rx="2" />
                {/* Trigger */}
                <rect x="48" y="50" width="6" height="8" fill="hsl(var(--foreground))" rx="1" />
                {/* Scope */}
                <rect x="55" y="20" width="20" height="8" fill="hsl(var(--secondary))" rx="1" />
                <line x1="60" y1="24" x2="70" y2="24" stroke="hsl(var(--primary))" strokeWidth="2" />
              </svg>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AimTrack;
