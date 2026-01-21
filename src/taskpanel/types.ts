export interface TaskPanelConfig {
  boundaryMargin: number;
  maxVelocity: number;
  baseFriction: number;
  highSpeedFriction: number;
  bounceDamping: number;
  bounceFrictionBoost: number;
  minVelocity: number;
  momentumThreshold: number;
  velocitySampleCount: number;
  dragScale: number;
  panelWidth: number;
  soundEnabled: boolean;
  soundMinVolume: number;
  soundMaxVolume: number;
  // Shadow settings
  idleShadowY: number;
  idleShadowBlur: number;
  idleShadowSpread: number;
  idleShadowOpacity: number;
  dragShadowY: number;
  dragShadowBlur: number;
  dragShadowSpread: number;
  dragShadowOpacity: number;
}

export interface TaskItem {
  id: string;
  name: string;
  status: 'completed' | 'processing';
  size?: string;
  thumbnail?: string;
  gradient?: string;
}

export interface TaskPanelProps {
  /** Array of tasks to display */
  tasks: TaskItem[];
  /** Optional configuration overrides */
  config?: Partial<TaskPanelConfig>;
  /** Callback when panel position changes */
  onPositionChange?: (x: number, y: number) => void;
  /** Callback when panel size changes */
  onSizeChange?: (width: number, height: number) => void;
  /** Callback when panel bounces off an edge */
  onBounce?: (x: number, y: number, intensity: number) => void;
  /** Callback when a task is cleared */
  onTaskClear?: (taskId: string) => void;
  /** Callback when all tasks are cleared */
  onClearAll?: () => void;
  /** Custom sound file URL (defaults to /hoverfx2.mp3) */
  soundUrl?: string;
}
