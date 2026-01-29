import { useState, useEffect } from 'react';
import type { AnalysisResult } from '@/types/analysis';

const STORAGE_KEY = 'tfg-analysis-history';
const MAX_HISTORY_ITEMS = 20;

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, []);

  const saveToStorage = (items: AnalysisResult[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const addToHistory = (result: AnalysisResult) => {
    setHistory(prev => {
      const updated = [result, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveToStorage(updated);
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addToHistory, clearHistory };
}
