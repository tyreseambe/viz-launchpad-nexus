import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const Map = () => {
  const navigate = useNavigate();
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  const maps = ["Ascent", "Bind", "Haven", "Split", "Fracture", "Breeze", "Icebox", "Pearl", "Lotus"];
  const agents = [
    "Jett", "Phoenix", "Sage", "Sova", "Viper", "Cypher", "Reyna", "Killjoy",
    "Breach", "Omen", "Raze", "Skye", "Yoru", "Astra", "KAY/O", "Chamber"
  ];
  const utilities = ["Smoke", "Flash", "Molly", "Dart", "Trap", "Wall"];

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

        <div className="text-center mb-8">
          <h1 className="text-4xl font-audiowide text-foreground mb-4">VIZ Map Planner</h1>
          <p className="text-muted-foreground">Create and plan your Valorant strategies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Maps Sidebar */}
          <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm lg:col-span-1">
            <h3 className="text-lg font-audiowide text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Maps
            </h3>
            <div className="space-y-2">
              {maps.map((map) => (
                <Button
                  key={map}
                  variant={selectedMap === map ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedMap(map)}
                >
                  {map}
                </Button>
              ))}
            </div>
          </Card>

          {/* Main Canvas Area */}
          <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm lg:col-span-2">
            <div className="aspect-video bg-background/50 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
              {selectedMap ? (
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-xl font-audiowide text-foreground">{selectedMap}</p>
                  <p className="text-sm text-muted-foreground mt-2">Map canvas - Coming soon</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Select a map to start planning</p>
              )}
            </div>
          </Card>

          {/* Tools Sidebar */}
          <div className="space-y-4 lg:col-span-1">
            {/* Agents */}
            <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-audiowide text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Agents
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {agents.map((agent) => (
                  <div
                    key={agent}
                    className="aspect-square bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all"
                  >
                    <span className="text-xs font-audiowide text-center">{agent}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Utilities */}
            <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-audiowide text-foreground mb-4">Utilities</h3>
              <div className="grid grid-cols-2 gap-2">
                {utilities.map((util) => (
                  <div
                    key={util}
                    className="aspect-square bg-secondary/10 rounded-lg border border-secondary/20 flex items-center justify-center cursor-pointer hover:bg-secondary/20 transition-all"
                  >
                    <span className="text-xs font-audiowide text-center">{util}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
