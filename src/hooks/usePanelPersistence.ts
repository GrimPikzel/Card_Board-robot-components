import { useState, useEffect, useCallback } from 'react';

// Panel data structure (matches your FloatingPanelData)
export interface PanelData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isExiting?: boolean;
  title?: string;
  isMinimized?: boolean;
  type?: string;
  content?: string;
}

// Connection structure (matches your PanelConnection)
export interface ConnectionData {
  id: string;
  fromPanelId: string;
  toPanelId: string;
}

// Combined save data
interface SaveData {
  panels: PanelData[];
  connections: ConnectionData[];
  panelIdCounter: number; // Save the counter so IDs don't conflict on reload
}

export function usePanelPersistence(storageKey: string = 'robot-node-canvas') {
  const [panels, setPanels] = useState<PanelData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [panelIdCounter, setPanelIdCounter] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed: SaveData = JSON.parse(savedData);
        setPanels(parsed.panels || []);
        setConnections(parsed.connections || []);
        setPanelIdCounter(parsed.panelIdCounter || 0);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load saved data:', error);
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Save to localStorage whenever panels or connections change
  useEffect(() => {
    if (isLoaded) {
      try {
        const saveData: SaveData = {
          panels,
          connections,
          panelIdCounter,
        };
        localStorage.setItem(storageKey, JSON.stringify(saveData));
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    }
  }, [panels, connections, panelIdCounter, storageKey, isLoaded]);

  // Clear all data
  const clearAllData = useCallback(() => {
    setPanels([]);
    setConnections([]);
    setPanelIdCounter(0);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    panels,
    setPanels,
    connections,
    setConnections,
    panelIdCounter,
    setPanelIdCounter,
    isLoaded,
    clearAllData,
  };
}