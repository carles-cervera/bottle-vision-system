import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult } from "@/types/analysis";

interface ResultsCardProps {
  result: AnalysisResult;
  imagePreview: string;
}

export function ResultsCard({ result, imagePreview }: ResultsCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const confidencePercent = result.confidence * 100;
  const isOk = result.label.toLowerCase() === 'ok' || 
             result.label.toLowerCase() === 'correcte' || 
             result.label.toLowerCase() === 'tap_present';
             
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-success';
    if (confidence >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  const modelName = result.model === 'nivell' ? 'Nivell' : 'Tap';

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">
            Resultat del Model de {modelName}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Anàlisi completada
          </p>
        </div>
        
        <span className={cn(
          "px-3 py-1 rounded-full text-sm font-semibold",
          isOk 
            ? "bg-success/10 text-success" 
            : "bg-destructive/10 text-destructive"
        )}>
          {isOk ? 'OK' : 'ALERTA'}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">Etiqueta predita</span>
            <span className="font-semibold text-card-foreground">{result.label}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Confiança</span>
            <span className="font-semibold text-card-foreground">{confidencePercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-500", getConfidenceColor(confidencePercent))}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Detalls tècnics
        </button>

        {showDetails && (
          <div className="bg-secondary/50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Endpoint</span>
              <span className="text-card-foreground font-mono text-xs">model de {result.model}</span>
            </div>
            {result.responseTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temps de resposta</span>
                <span className="text-card-foreground">{result.responseTime} ms</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
