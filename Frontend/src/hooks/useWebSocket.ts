import { useState, useEffect, useCallback, useRef } from 'react';
import type { BottleAnalysis, WebSocketMessage } from '@/types/analysis';

// Allow overriding the WebSocket endpoint from .env (VITE_WS_URL).
// Fallback: same hostname, port 8000, /ws path.
const DEFAULT_WS_PORT = 8000;
const WS_URL =
  import.meta.env.VITE_WS_URL ??
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:${DEFAULT_WS_PORT}/ws`;

interface UseWebSocketReturn {
  isConnected: boolean;
  bottleAnalyses: BottleAnalysis[];
  bottlesProcessed: number;
  connect: () => void;
  disconnect: () => void;
  clearResults: () => void;
}

// Helper function to determine if result has alert
function hasAlertFlag(label: string): boolean {
  const alertFlags = ['low', 'full', 'tap_missing'];
  return alertFlags.includes(label.toLowerCase());
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [bottleAnalyses, setBottleAnalyses] = useState<BottleAnalysis[]>([]);
  const [bottlesProcessed, setBottlesProcessed] = useState(0);
  const bottlesOffset = useRef(0); // Track offset when clearing
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      console.log(`Connecting WebSocket to: ${WS_URL}`);
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📦 WebSocket message:', message);

          if (message.type === 'analysis_result') {
            const analysis = message.data;
            // Detect if has alert based on tap or level flags
            const tapHasAlert = hasAlertFlag(analysis.tap.label);
            const levelHasAlert = hasAlertFlag(analysis.level.label);
            const hasAlert = tapHasAlert || levelHasAlert;
            // Add hasAlert flag
            analysis.hasAlert = hasAlert;
            console.log(`🍾 Botella #${analysis.bottle_id}: tap=${analysis.tap.label}, level=${analysis.level.label}, estado=${analysis.status}`);
            console.log(`   Alerta: ${hasAlert}, Total procesadas: ${analysis.bottles_processed}`);
            setBottleAnalyses((prev) => [analysis, ...prev]);
            setBottlesProcessed(Math.max(0, analysis.bottles_processed - bottlesOffset.current));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.warn('WebSocket disconnected', event);
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setBottleAnalyses([]);
    // Store current backend count as offset
    setBottlesProcessed(prev => {
      bottlesOffset.current += prev;
      return 0;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    bottleAnalyses,
    bottlesProcessed,
    connect,
    disconnect,
    clearResults,
  };
}
