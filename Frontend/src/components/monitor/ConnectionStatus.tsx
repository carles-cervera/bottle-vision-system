import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
      isConnected 
        ? "bg-success/20 text-success" 
        : "bg-destructive/20 text-destructive"
    )}>
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Connectat</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Desconnectat</span>
        </>
      )}
    </div>
  );
}
