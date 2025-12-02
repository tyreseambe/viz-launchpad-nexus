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
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";

// First-person camera controller
function FirstPersonCamera() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 1.6, 0); // Eye level height
    camera.rotation.set(0, 0, 0);
  }, [camera]);

  return null;
}

// 3D Room environment
function TrainingRoom() {
  return (
    <group>
      {/* Floor - checkered pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      
      {/* Checkered floor grid */}
      {Array.from({ length: 15 }).map((_, i) => 
        Array.from({ length: 15 }).map((_, j) => (
          <mesh 
            key={`${i}-${j}`} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[i * 2 - 14, 0.01, j * 2 - 14]}
          >
            <planeGeometry args={[1.9, 1.9]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? "#5a5a5a" : "#4a4a4a"} />
          </mesh>
        ))
      )}
      
      {/* Back wall - checkered */}
      <mesh position={[0, 5, -15]} receiveShadow>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-15, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[15, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      
      {/* Ceiling - checkered pattern */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Ceiling grid */}
      {Array.from({ length: 10 }).map((_, i) => 
        Array.from({ length: 10 }).map((_, j) => (
          <mesh 
            key={`ceiling-${i}-${j}`} 
            rotation={[Math.PI / 2, 0, 0]} 
            position={[i * 3 - 13.5, 9.99, j * 3 - 13.5]}
          >
            <planeGeometry args={[2.8, 2.8]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? "#3a3a3a" : "#2a2a2a"} />
          </mesh>
        ))
      )}
    </group>
  );
}

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
    const newTargets: Target[] = [];

    for (let i = 0; i < count; i++) {
      newTargets.push({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 20, // X position in 3D space
        y: Math.random() * 5 + 1, // Y position (height)
        size: size / 100, // Convert to 3D scale
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
              className="relative w-full h-[600px] bg-black border-2 border-primary/20 rounded-lg overflow-hidden"
              style={{ 
                cursor: "none",
                pointerEvents: isPaused ? "none" : "auto",
              }}
            >
              {/* Crosshair */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="relative w-8 h-8">
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-cyan-400" style={{ transform: 'translateY(-50%)' }} />
                  <div className="absolute left-1/2 top-0 h-full w-[2px] bg-cyan-400" style={{ transform: 'translateX(-50%)' }} />
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full" style={{ transform: 'translate(-50%, -50%)' }} />
                </div>
              </div>

              {/* Score overlay */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-6 bg-card/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-primary/30">
                <div className="text-foreground font-audiowide">
                  PTS <span className="text-primary text-2xl ml-2">{score}</span>
                </div>
                <div className="text-foreground font-audiowide">
                  <span className="text-secondary text-2xl">{timeLeft}s</span>
                </div>
                {combo > 0 && (
                  <div className="text-foreground font-audiowide animate-pulse">
                    <span className="text-yellow-400 text-2xl">{combo}x</span>
                  </div>
                )}
              </div>

              {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50">
                  <div className="text-4xl font-audiowide text-primary bg-card/90 px-8 py-4 rounded-lg border-2 border-primary">
                    PAUSED - Press P to Resume
                  </div>
                </div>
              )}
              
              <Canvas 
                camera={{ position: [0, 1.6, 0], fov: 90 }}
                onCreated={({ gl }) => {
                  gl.setClearColor('#1a1a1a');
                }}
              >
                <FirstPersonCamera />
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
                <pointLight position={[0, 8, 0]} intensity={0.6} />
                
                <TrainingRoom />
                
                {/* 3D Targets */}
                {targets.map((target) => {
                  const zDistance = -8 - Math.random() * 5; // Spawn in front of camera
                  
                  return (
                    <mesh
                      key={target.id}
                      position={[target.x, target.y, zDistance]}
                      onClick={() => handleTargetClick(target.id)}
                    >
                      <sphereGeometry args={[target.size, 32, 32]} />
                      <meshStandardMaterial 
                        color="#00d4ff" 
                        emissive="#00d4ff"
                        emissiveIntensity={0.6}
                        metalness={0.4}
                        roughness={0.1}
                      />
                      {/* Outer glow ring */}
                      <mesh scale={1.2}>
                        <sphereGeometry args={[target.size, 16, 16]} />
                        <meshBasicMaterial 
                          color="#00d4ff" 
                          transparent 
                          opacity={0.2}
                        />
                      </mesh>
                    </mesh>
                  );
                })}
              </Canvas>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AimTrack;
