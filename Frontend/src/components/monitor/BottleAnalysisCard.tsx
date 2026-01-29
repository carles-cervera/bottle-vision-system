import { CircleDot, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BottleAnalysis } from '@/types/analysis';

interface BottleAnalysisCardProps {
  analysis: BottleAnalysis;
}

export function BottleAnalysisCard({ analysis }: BottleAnalysisCardProps) {
  const timestamp = new Date(analysis.timestamp).toLocaleTimeString('ca-ES');

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all animate-in slide-in-from-top-2 duration-300 overflow-hidden",
        analysis.hasAlert 
          ? "border-destructive/50 bg-destructive/5" 
          : "border-success/50 bg-success/5"
      )}
    >
      {/* Header */}
      <div className={cn(
        "px-4 py-3 flex items-center justify-between",
        analysis.hasAlert ? "bg-destructive/10" : "bg-success/10"
      )}>
        <div className="flex items-center gap-2">
          {analysis.hasAlert ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : (
            <CheckCircle className="w-5 h-5 text-success" />
          )}
          <span className="font-semibold text-foreground">
            Ampolla {analysis.bottle_id}
          </span>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold",
          analysis.status === 'PASS'
            ? "bg-success text-success-foreground"
            : "bg-destructive text-destructive-foreground"
        )}>
          {analysis.status}
        </span>
      </div>

      {/* Info */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
        <span>{timestamp}</span>
        <span className="ml-4">Processades: {analysis.bottles_processed}</span>
      </div>

      {/* Analysis Sections */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Tap Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CircleDot className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm text-card-foreground">Tap</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Resultat</span>
              <span className={cn(
                "text-sm font-semibold",
                analysis.tap.label.toLowerCase() === 'tap_present'
                  ? "text-success"
                  : "text-destructive"
              )}>
                {analysis.tap.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Confiança</span>
              <span className="text-sm font-medium text-foreground">
                {(analysis.tap.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  analysis.tap.label.toLowerCase() === 'tap_present' ? "bg-success" : "bg-destructive"
                )}
                style={{ width: `${analysis.tap.confidence * 100}%` }}
              />
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              📸 {analysis.tap.image}
            </div>
          </div>
        </div>

        {/* Level Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
            <h3 className="font-semibold text-sm text-card-foreground">Nivell</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Resultat</span>
              <span className={cn(
                "text-sm font-semibold",
                analysis.level.label.toLowerCase() === 'ok'
                  ? "text-success"
                  : "text-destructive"
              )}>
                {analysis.level.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Confiança</span>
              <span className="text-sm font-medium text-foreground">
                {(analysis.level.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  analysis.level.label.toLowerCase() === 'ok' ? "bg-success" : "bg-destructive"
                )}
                style={{ width: `${analysis.level.confidence * 100}%` }}
              />
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              📸 {analysis.level.image}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
