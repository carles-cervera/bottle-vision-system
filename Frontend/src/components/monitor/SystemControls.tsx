import { Power, PowerOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SystemControlsProps {
  isSystemOn: boolean;
  isLoading: boolean;
  onToggle: () => void;
}


export function SystemControls({ isSystemOn, isLoading, onToggle }: SystemControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={onToggle}
        disabled={isLoading}
        size="lg"
        className={cn(
          "min-w-[140px] transition-all",
          isSystemOn 
            ? "bg-destructive hover:bg-destructive/90" 
            : "bg-success hover:bg-success/90"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isSystemOn ? (
          <>
            <PowerOff className="w-5 h-5 mr-2" />
            Aturar
          </>
        ) : (
          <>
            <Power className="w-5 h-5 mr-2" />
            Iniciar
          </>
        )}
      </Button>
      
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-3 h-3 rounded-full transition-colors",
          isSystemOn ? "bg-success animate-pulse" : "bg-muted-foreground"
        )} />
        <span className="text-sm text-muted-foreground">
          {isSystemOn ? 'Sistema actiu' : 'Sistema aturat'}
        </span>
      </div>
    </div>
  );
}
