import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import ascentMap from "@/assets/maps/ascent.jpg";
import bindMap from "@/assets/maps/bind.jpg";
import havenMap from "@/assets/maps/haven.jpg";
import splitMap from "@/assets/maps/split.jpg";
import jettIcon from "@/assets/agents/jett.jpg";
import smokeIcon from "@/assets/utilities/smoke.jpg";
import flashIcon from "@/assets/utilities/flash.jpg";

const Map = () => {
  const navigate = useNavigate();
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  const maps = [
    { name: "Ascent", image: ascentMap },
    { name: "Bind", image: bindMap },
    { name: "Haven", image: havenMap },
    { name: "Split", image: splitMap },
  ];
  const agents = [
    { name: "Jett", icon: jettIcon },
    { name: "Phoenix", icon: null },
    { name: "Sage", icon: null },
    { name: "Sova", icon: null },
    { name: "Viper", icon: null },
    { name: "Cypher", icon: null },
    { name: "Reyna", icon: null },
    { name: "Killjoy", icon: null },
  ];
  const utilities = [
    { name: "Smoke", icon: smokeIcon },
    { name: "Flash", icon: flashIcon },
    { name: "Molly", icon: null },
    { name: "Dart", icon: null },
    { name: "Trap", icon: null },
    { name: "Wall", icon: null },
  ];

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
                  key={map.name}
                  variant={selectedMap === map.name ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedMap(map.name)}
                >
                  {map.name}
                </Button>
              ))}
            </div>
          </Card>

          {/* Main Canvas Area */}
          <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm lg:col-span-2">
            <div className="aspect-video bg-background/50 rounded-lg border-2 border-dashed border-primary/20 overflow-hidden relative">
              {selectedMap ? (
                <>
                  <img 
                    src={maps.find(m => m.name === selectedMap)?.image} 
                    alt={selectedMap}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/30">
                    <p className="text-xl font-audiowide text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {selectedMap}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Select a map to start planning</p>
                </div>
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
                    key={agent.name}
                    className="aspect-square bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all overflow-hidden relative group"
                  >
                    {agent.icon ? (
                      <>
                        <img src={agent.icon} alt={agent.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end justify-center pb-2">
                          <span className="text-xs font-audiowide text-foreground">{agent.name}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs font-audiowide text-center">{agent.name}</span>
                    )}
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
                    key={util.name}
                    className="aspect-square bg-secondary/10 rounded-lg border border-secondary/20 flex items-center justify-center cursor-pointer hover:bg-secondary/20 transition-all overflow-hidden relative"
                  >
                    {util.icon ? (
                      <>
                        <img src={util.icon} alt={util.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end justify-center pb-2">
                          <span className="text-xs font-audiowide text-foreground">{util.name}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs font-audiowide text-center">{util.name}</span>
                    )}
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
