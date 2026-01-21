import type { TaskPanelConfig } from './types';

export const HEADER_HEIGHT = 48;
export const TASK_ROW_HEIGHT = 52;

export const DEFAULT_CONFIG: TaskPanelConfig = {
  boundaryMargin: 8,
  maxVelocity: 40,
  baseFriction: 0.975,
  highSpeedFriction: 0.94,
  bounceDamping: 0.45,
  bounceFrictionBoost: 0.85,
  minVelocity: 0.15,
  momentumThreshold: 1.5,
  velocitySampleCount: 6,
  dragScale: 1.018,
  panelWidth: 280,
  soundEnabled: true,
  soundMinVolume: 0.015,
  soundMaxVolume: 0.15,
  // Shadow settings (idle)
  idleShadowY: 24,
  idleShadowBlur: 24,
  idleShadowSpread: -12,
  idleShadowOpacity: 0.25,
  // Shadow settings (drag)
  dragShadowY: 32,
  dragShadowBlur: 40,
  dragShadowSpread: -8,
  dragShadowOpacity: 0.55,
};

// Default gradients for task thumbnails
export const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)',
  'linear-gradient(135deg, #4a4a4a 0%, #333333 100%)',
  'linear-gradient(135deg, #383838 0%, #282828 100%)',
  'linear-gradient(135deg, #454545 0%, #303030 100%)',
  'linear-gradient(135deg, #404040 0%, #2d2d2d 100%)',
  'linear-gradient(135deg, #3d3d3d 0%, #2b2b2b 100%)',
  'linear-gradient(135deg, #484848 0%, #323232 100%)',
  'linear-gradient(135deg, #3b3b3b 0%, #292929 100%)',
  'linear-gradient(135deg, #434343 0%, #2e2e2e 100%)',
  'linear-gradient(135deg, #3f3f3f 0%, #2c2c2c 100%)',
];
