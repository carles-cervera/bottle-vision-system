import { Check, Gauge, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelInfo } from "@/types/analysis";

interface ModelCardProps {
  model: ModelInfo;
  isSelected: boolean;
  onSelect: () => void;
}

const iconMap = {
  gauge: Gauge,
  'circle-dot': CircleDot,
};

export function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  const Icon = iconMap[model.icon];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
        "hover:border-primary/50 hover:bg-secondary/50",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card"
      )}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground">{model.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{model.description}</p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded bg-secondary text-secondary-foreground">
            AZURE ML
          </span>
        </div>
      </div>
    </button>
  );
}
