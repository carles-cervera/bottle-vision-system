import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useSystemControl } from '@/hooks/useSystemControl';
import { BottleAnalysisCard } from '@/components/monitor/BottleAnalysisCard';
import { SystemControls } from '@/components/monitor/SystemControls';
import { BottleCounter } from '@/components/monitor/BottleCounter';
import { ConnectionStatus } from '@/components/monitor/ConnectionStatus';

export default function Monitor() {
  const { isConnected, bottleAnalyses, bottlesProcessed, connect, disconnect, clearResults } = useWebSocket();
  const { isSystemOn, isLoading, toggle } = useSystemControl();

  // Auto-connect WebSocket on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const handleSystemToggle = async () => {
    await toggle();
  };

  const okCount = bottleAnalyses.filter(b => b.status === 'PASS').length;
  const failCount = bottleAnalyses.filter(b => b.status === 'FAIL').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">
                  Monitorització en Temps Real
                </h1>
                <p className="text-sm text-muted-foreground">
                  Anàlisi automàtic d'ampolles via WebSocket
                </p>
              </div>
            </div>
            <ConnectionStatus isConnected={isConnected} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls & Stats */}
          <div className="space-y-6">
            {/* System Controls */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">
                Control del Sistema
              </h2>
              <SystemControls
                isSystemOn={isSystemOn}
                isLoading={isLoading}
                onToggle={handleSystemToggle}
              />
            </div>

            {/* Bottle Counter */}
            <BottleCounter count={bottlesProcessed} />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-success">{okCount}</p>
                <p className="text-sm text-muted-foreground">OK</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-destructive">{failCount}</p>
                <p className="text-sm text-muted-foreground">FAIL</p>
              </div>
            </div>

            {/* Clear Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={clearResults}
              disabled={bottleAnalyses.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Netejar Resultats
            </Button>
          </div>

          {/* Right Column - Live Results */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 h-[calc(100vh-220px)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Anàlisis per Ampolla
                </h2>
                <span className="text-sm text-muted-foreground">
                  {bottleAnalyses.length} ampolles
                </span>
              </div>

              {bottleAnalyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100%-40px)] text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-muted-foreground/30 animate-pulse" />
                  </div>
                  <p className="text-muted-foreground">
                    {isSystemOn 
                      ? 'Esperant resultats...' 
                      : 'Inicia el sistema per veure els resultats'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100%-40px)]">
                  <div className="space-y-4 pr-4">
                    {bottleAnalyses.map((analysis) => (
                      <BottleAnalysisCard
                        key={analysis.id}
                        analysis={analysis}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
