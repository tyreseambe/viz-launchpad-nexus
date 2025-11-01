import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface AppCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  onClick?: () => void;
}

export const AppCard = ({ title, description, icon: Icon, available, onClick }: AppCardProps) => {
  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/60 transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6 flex flex-col h-full">
        {!available && (
          <Badge className="absolute top-4 right-4 bg-muted text-muted-foreground border-muted-foreground/30">
            Coming Soon
          </Badge>
        )}
        
        <div className="mb-4">
          <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:shadow-glow-cyan transition-all duration-300">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h3 className="text-xl font-audiowide text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground flex-grow mb-4">{description}</p>
        
        <Button 
          onClick={onClick}
          disabled={!available}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow-cyan disabled:opacity-50 disabled:shadow-none transition-all duration-300"
        >
          {available ? "Launch" : "Soon"}
        </Button>
      </div>
    </Card>
  );
};
