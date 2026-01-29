import { Package } from 'lucide-react';

interface BottleCounterProps {
  count: number;
}

export function BottleCounter({ count }: BottleCounterProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Package className="w-8 h-8 text-primary" />
        <span className="text-4xl font-bold text-foreground">{count}</span>
      </div>
      <p className="text-muted-foreground">Ampolles processades</p>
    </div>
  );
}
