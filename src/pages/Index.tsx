import { AppCard } from "@/components/AppCard";
import { Gamepad2, Target, Zap, Map, Eye, Info, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const apps = [
    {
      id: "strafe",
      title: "VIZ Strafe",
      description: "Real-time keypress visualizer for movement training and streaming overlays",
      icon: Gamepad2,
      available: true,
      route: "/strafe",
    },
    {
      id: "strafe-overlay",
      title: "VIZ Strafe Overlay",
      description: "Transparent overlay for OBS/streaming - shows only keypresses",
      icon: Eye,
      available: true,
      route: "/strafe-overlay",
    },
    {
      id: "aimtrack",
      title: "VIZ AimTrack",
      description: "Advanced aim trainer with multiple scenarios and sensitivity control",
      icon: Target,
      available: true,
      route: "/aimtrack",
    },
    {
      id: "react",
      title: "VIZ React",
      description: "Reaction time testing and measurement tool",
      icon: Zap,
      available: true,
      route: "/react",
    },
    {
      id: "map",
      title: "VIZ Map",
      description: "Valorant strategy planner with maps and utility placement",
      icon: Map,
      available: true,
      route: "/map",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]" />
      
      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-primary/20 bg-card/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-cyan">
              <span className="text-xl font-audiowide font-bold text-background">VZ</span>
            </div>
            <div>
              <h1 className="text-xl font-audiowide text-foreground">VIZ Client</h1>
              <p className="text-xs text-muted-foreground">Vision Zero Esports</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="border-primary/30 hover:border-primary hover:bg-primary/10">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="border-primary/30 hover:border-primary hover:bg-primary/10">
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-audiowide text-foreground mb-4 tracking-tight">
            Choose Your <span className="text-primary">Tool</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional esports utilities designed for competitive players and content creators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {apps.map((app, index) => (
            <div 
              key={app.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <AppCard
                title={app.title}
                description={app.description}
                icon={app.icon}
                available={app.available}
                onClick={app.route ? () => navigate(app.route) : undefined}
              />
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-card/30 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
            <span className="text-sm text-muted-foreground">
              More tools coming soon
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
