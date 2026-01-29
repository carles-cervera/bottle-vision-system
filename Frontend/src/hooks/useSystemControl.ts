import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface UseSystemControlReturn {
  isSystemOn: boolean;
  isLoading: boolean;
  turnOn: () => Promise<void>;
  turnOff: () => Promise<void>;
  toggle: () => Promise<void>;
}

export function useSystemControl(): UseSystemControlReturn {
  const [isSystemOn, setIsSystemOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const turnOn = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/system/on`, {
        method: 'POST',
      });
      if (response.ok) {
        setIsSystemOn(true);
      }
    } catch (error) {
      console.error('Error turning system on:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const turnOff = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/system/off`, {
        method: 'POST',
      });
      if (response.ok) {
        setIsSystemOn(false);
      }
    } catch (error) {
      console.error('Error turning system off:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isSystemOn) {
      await turnOff();
    } else {
      await turnOn();
    }
  }, [isSystemOn, turnOn, turnOff]);

  return {
    isSystemOn,
    isLoading,
    turnOn,
    turnOff,
    toggle,
  };
}
