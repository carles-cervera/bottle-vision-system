import type { LiveAnalysisResult } from '@/types/analysis';
import { Gauge, CircleDot, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveAnalysisCardProps {
  result: LiveAnalysisResult;
  index: number;
}

export function LiveAnalysisCard({ result, index }: LiveAnalysisCardProps) {
  const isOk = result.label.toLowerCase() === 'ok';
  const isLevel = result.model === 'level';

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all animate-in slide-in-from-top-2 duration-300",
        isOk 
          ? "bg-success/10 border-success/30" 
          : "bg-destructive/10 border-destructive/30"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full",
            isLevel ? "bg-primary/20" : "bg-accent/20"
          )}>
            {isLevel ? (
              <Gauge className="w-5 h-5 text-primary" />
            ) : (
              <CircleDot className="w-5 h-5 text-accent" />
            )}
          </div>
          
          <div>
            <p className="font-medium text-foreground">
              {isLevel ? 'Nivell' : 'Tap'}
            </p>
            <p className="text-sm text-muted-foreground">
              {result.image}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
            isOk 
              ? "bg-success text-success-foreground" 
              : "bg-destructive text-destructive-foreground"
          )}>
            {result.label.toUpperCase()}
          </span>
          <p className="text-sm text-muted-foreground mt-1">
            {(result.confidence * 100).toFixed(1)}% confiança
          </p>
        </div>
      </div>
    </div>
  );
}
