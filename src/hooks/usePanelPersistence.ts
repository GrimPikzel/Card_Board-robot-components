import { useState, useEffect, useCallback } from 'react';

// Define types
export interface PanelData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  isMinimized?: boolean;
  type?: string;
  content?: any;
  isExiting?: boolean;
}

export interface ConnectionData {
  id: string;
  fromPanelId: string;
  toPanelId: string;
}

export interface PersistenceHook {
  panels: PanelData[];
  setPanels: React.Dispatch<React.SetStateAction<PanelData[]>>;
  connections: ConnectionData[];
  setConnections: React.Dispatch<React.SetStateAction<ConnectionData[]>>;
  panelIdCounter: number;
  setPanelIdCounter: React.Dispatch<React.SetStateAction<number>>;
  isLoaded: boolean;
  clearAllData: () => void;
}

// Default initial state
const DEFAULT_PANELS: PanelData[] = [];
const DEFAULT_CONNECTIONS: ConnectionData[] = [];
const DEFAULT_ID_COUNTER = 0;

export const usePanelPersistence = (): PersistenceHook => {
  const [panels, setPanels] = useState<PanelData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [panelIdCounter, setPanelIdCounter] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedPanels = localStorage.getItem('gridPanels');
        const savedConnections = localStorage.getItem('gridConnections');
        const savedIdCounter = localStorage.getItem('panelIdCounter');
        
        if (savedPanels) {
          setPanels(JSON.parse(savedPanels));
        }
        
        if (savedConnections) {
          setConnections(JSON.parse(savedConnections));
        }
        
        if (savedIdCounter) {
          setPanelIdCounter(parseInt(savedIdCounter, 10));
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
        // Initialize with defaults if loading fails
        setPanels(DEFAULT_PANELS);
        setConnections(DEFAULT_CONNECTIONS);
        setPanelIdCounter(DEFAULT_ID_COUNTER);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save panels to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gridPanels', JSON.stringify(panels));
      } catch (error) {
        console.error('Failed to save panels to localStorage:', error);
      }
    }
  }, [panels, isLoaded]);

  // Save connections to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gridConnections', JSON.stringify(connections));
      } catch (error) {
        console.error('Failed to save connections to localStorage:', error);
      }
    }
  }, [connections, isLoaded]);

  // Save panel ID counter to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('panelIdCounter', panelIdCounter.toString());
      } catch (error) {
        console.error('Failed to save panelIdCounter to localStorage:', error);
      }
    }
  }, [panelIdCounter, isLoaded]);

  // Clear all data
  const clearAllData = useCallback(() => {
    setPanels([]);
    setConnections([]);
    setPanelIdCounter(0);
    
    try {
      localStorage.removeItem('gridPanels');
      localStorage.removeItem('gridConnections');
      localStorage.removeItem('panelIdCounter');
    } catch (error) {
      console.error('Failed to clear data from localStorage:', error);
    }
  }, []);

  return {
    panels,
    setPanels,
    connections,
    setConnections,
    panelIdCounter,
    setPanelIdCounter,
    isLoaded,
    clearAllData
  };
};