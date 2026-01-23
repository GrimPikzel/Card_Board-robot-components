'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Pane } from 'tweakpane';
import { TaskPanel, TaskItem, TaskPanelConfig, TaskPanelDefaultConfig } from '../../src/taskpanel';
import { soundEffects } from '../../src/utils/SoundEffects';

// Demo tasks with fixed sizes (no Math.random to avoid hydration mismatch)
const DEMO_TASKS: TaskItem[] = [
  { id: 'task-0', name: 'cosmic-nebula', status: 'processing' },
  { id: 'task-1', name: 'azure-crystal', status: 'processing' },
  { id: 'task-2', name: 'midnight-bloom', status: 'completed', size: '12.4 MB' },
  { id: 'task-3', name: 'solar-flare', status: 'completed', size: '8.7 MB' },
  { id: 'task-4', name: 'ocean-depths', status: 'completed', size: '23.1 MB' },
  { id: 'task-5', name: 'aurora-burst', status: 'completed', size: '15.9 MB' },
  { id: 'task-6', name: 'velvet-storm', status: 'completed', size: '31.2 MB' },
  { id: 'task-7', name: 'golden-hour', status: 'completed', size: '19.5 MB' },
];

export default function TaskPanelDemo() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>(DEMO_TASKS);
  const [config, setConfig] = useState<TaskPanelConfig>({ ...TaskPanelDefaultConfig });
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<Pane | null>(null);

  const handleTaskClear = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleClearAll = () => {
    setTasks([]);
  };

  const handleResetTasks = () => {
    setTasks(DEMO_TASKS);
  };

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize Tweakpane
  useEffect(() => {
    if (isMobile || !containerRef.current) return;

    const params = { ...TaskPanelDefaultConfig };

    const pane = new Pane({
      container: containerRef.current,
      title: 'Task Panel Controls',
    });

    // Physics folder
    const physicsFolder = pane.addFolder({ title: 'Physics', expanded: false });
    physicsFolder.addBinding(params, 'maxVelocity', { min: 10, max: 80, step: 1, label: 'Max Velocity' });
    physicsFolder.addBinding(params, 'baseFriction', { min: 0.9, max: 0.999, step: 0.001, label: 'Base Friction' });
    physicsFolder.addBinding(params, 'highSpeedFriction', { min: 0.8, max: 0.99, step: 0.01, label: 'High Speed Friction' });
    physicsFolder.addBinding(params, 'bounceDamping', { min: 0.1, max: 0.9, step: 0.05, label: 'Bounce Damping' });
    physicsFolder.addBinding(params, 'bounceFrictionBoost', { min: 0.5, max: 1, step: 0.05, label: 'Bounce Friction' });
    physicsFolder.addBinding(params, 'minVelocity', { min: 0.05, max: 1, step: 0.05, label: 'Min Velocity' });
    physicsFolder.addBinding(params, 'momentumThreshold', { min: 0.5, max: 5, step: 0.1, label: 'Momentum Threshold' });
    physicsFolder.addBinding(params, 'velocitySampleCount', { min: 2, max: 12, step: 1, label: 'Velocity Samples' });

    // Visual folder
    const visualFolder = pane.addFolder({ title: 'Visual', expanded: false });
    visualFolder.addBinding(params, 'boundaryMargin', { min: 0, max: 50, step: 1, label: 'Boundary Margin' });
    visualFolder.addBinding(params, 'dragScale', { min: 1, max: 1.1, step: 0.002, label: 'Drag Scale' });
    visualFolder.addBinding(params, 'panelWidth', { min: 280, max: 320, step: 10, label: 'Panel Width' });

    // Shadow folder
    const shadowFolder = pane.addFolder({ title: 'Shadows', expanded: false });
    shadowFolder.addBinding(params, 'idleShadowY', { min: 0, max: 60, step: 1, label: 'Idle Y Offset' });
    shadowFolder.addBinding(params, 'idleShadowBlur', { min: 0, max: 80, step: 1, label: 'Idle Blur' });
    shadowFolder.addBinding(params, 'idleShadowSpread', { min: -20, max: 20, step: 1, label: 'Idle Spread' });
    shadowFolder.addBinding(params, 'idleShadowOpacity', { min: 0, max: 1, step: 0.05, label: 'Idle Opacity' });
    shadowFolder.addBinding(params, 'dragShadowY', { min: 0, max: 80, step: 1, label: 'Drag Y Offset' });
    shadowFolder.addBinding(params, 'dragShadowBlur', { min: 0, max: 100, step: 1, label: 'Drag Blur' });
    shadowFolder.addBinding(params, 'dragShadowSpread', { min: -20, max: 20, step: 1, label: 'Drag Spread' });
    shadowFolder.addBinding(params, 'dragShadowOpacity', { min: 0, max: 1, step: 0.05, label: 'Drag Opacity' });

    // Sound folder
    const soundFolder = pane.addFolder({ title: 'Sound', expanded: false });
    soundFolder.addBinding(params, 'soundEnabled', { label: 'Enabled' });
    soundFolder.addBinding(params, 'soundMinVolume', { min: 0, max: 0.1, step: 0.005, label: 'Min Volume' });
    soundFolder.addBinding(params, 'soundMaxVolume', { min: 0.05, max: 0.5, step: 0.01, label: 'Max Volume' });

    // Listen for changes
    pane.on('change', () => {
      setConfig({ ...params });
    });

    // Presets folder
    const presetsFolder = pane.addFolder({ title: 'Presets', expanded: false });

    presetsFolder.addButton({ title: 'Reset to Default' }).on('click', () => {
      Object.assign(params, TaskPanelDefaultConfig);
      pane.refresh();
      setConfig({ ...params });
    });

    presetsFolder.addButton({ title: 'Floaty / Low Gravity' }).on('click', () => {
      Object.assign(params, {
        ...TaskPanelDefaultConfig,
        baseFriction: 0.99,
        highSpeedFriction: 0.97,
        bounceDamping: 0.7,
        bounceFrictionBoost: 0.95,
      });
      pane.refresh();
      setConfig({ ...params });
    });

    presetsFolder.addButton({ title: 'Snappy / High Friction' }).on('click', () => {
      Object.assign(params, {
        ...TaskPanelDefaultConfig,
        baseFriction: 0.92,
        highSpeedFriction: 0.85,
        bounceDamping: 0.3,
        bounceFrictionBoost: 0.6,
      });
      pane.refresh();
      setConfig({ ...params });
    });

    presetsFolder.addButton({ title: 'Bouncy Ball' }).on('click', () => {
      Object.assign(params, {
        ...TaskPanelDefaultConfig,
        baseFriction: 0.985,
        highSpeedFriction: 0.96,
        bounceDamping: 0.75,
        bounceFrictionBoost: 0.95,
        maxVelocity: 50,
      });
      pane.refresh();
      setConfig({ ...params });
    });

    paneRef.current = pane;

    return () => {
      pane.dispose();
      paneRef.current = null;
    };
  }, [isMobile]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#171717', /* neutral-900 */
    }}>
      {/* Tweakpane dark theme styles - using Tailwind neutral palette */}
      <style>{`
        :root {
          --tp-base-background-color: rgba(38, 38, 38, 0.80); /* neutral-800 */
          --tp-base-shadow-color: rgba(10, 10, 10, 0.2); /* neutral-950 */
          --tp-button-background-color: #d4d4d4; /* neutral-300 */
          --tp-button-background-color-active: #a3a3a3; /* neutral-400 */
          --tp-button-background-color-focus: #d4d4d4; /* neutral-300 */
          --tp-button-background-color-hover: #e5e5e5; /* neutral-200 */
          --tp-button-foreground-color: rgba(23, 23, 23, 0.80); /* neutral-900 */
          --tp-container-background-color: rgba(64, 64, 64, 0.30); /* neutral-700 */
          --tp-container-background-color-active: rgba(64, 64, 64, 0.30); /* neutral-700 */
          --tp-container-background-color-focus: rgba(82, 82, 82, 0.30); /* neutral-600 */
          --tp-container-background-color-hover: rgba(82, 82, 82, 0.30); /* neutral-600 */
          --tp-container-foreground-color: #737373; /* neutral-500 */
          --tp-groove-foreground-color: rgba(10, 10, 10, 0.20); /* neutral-950 */
          --tp-input-background-color: rgba(10, 10, 10, 0.30); /* neutral-950 */
          --tp-input-background-color-active: rgba(23, 23, 23, 0.30); /* neutral-900 */
          --tp-input-background-color-focus: rgba(23, 23, 23, 0.30); /* neutral-900 */
          --tp-input-background-color-hover: rgba(23, 23, 23, 0.30); /* neutral-900 */
          --tp-input-foreground-color: #737373; /* neutral-500 */
          --tp-label-foreground-color: #737373; /* neutral-500 */
          --tp-monitor-background-color: rgba(10, 10, 10, 0.30); /* neutral-950 */
          --tp-monitor-foreground-color: #525252; /* neutral-600 */
        }
      `}</style>

      {/* Robot Logo - Top Left */}
      <div style={{ position: 'fixed', top: 32, left: 32, zIndex: 10 }}>
        <button
          onClick={() => {
            soundEffects.playQuickStartClick();
            router.push('/');
          }}
          onMouseEnter={() => soundEffects.playHoverSound('logo')}
          className="btn-skin"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 1px #171717',
          }}
        >
          <span
            style={{
              display: 'block',
              width: 20,
              height: 20,
              backgroundImage: 'url(/images/new-robot-logo.svg)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </button>
      </div>

      {/* Tweakpane container - hidden on mobile */}
      {!isMobile && (
        <div
          ref={containerRef}
          style={{
            position: 'fixed',
            top: 32,
            right: 32,
            width: 300,
            zIndex: 9999,
          }}
        />
      )}

      {/* Title */}
      <div style={{
        position: 'fixed',
        bottom: 32,
        left: 32,
        maxWidth: 320,
        zIndex: 10,
      }}>
        <h1 style={{ fontSize: 19, fontWeight: 600, color: '#e5e5e5' /* neutral-200 */ }}>
          Task Panel
        </h1>
        <p style={{ fontSize: 14, color: '#737373' /* neutral-500 */, marginTop: 6, lineHeight: 1.57 }}>
          A floating task queue for async jobs. Shows progress, completion status, and file sizes. Fully draggable with physics and boundaries.
        </p>
        {tasks.length === 0 && (
          <button
            onClick={handleResetTasks}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              backgroundColor: '#262626', /* neutral-800 */
              border: '1px solid #404040', /* neutral-700 */
              borderRadius: 8,
              color: '#a3a3a3', /* neutral-400 */
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040'; /* neutral-700 */
              e.currentTarget.style.color = '#e5e5e5'; /* neutral-200 */
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#262626'; /* neutral-800 */
              e.currentTarget.style.color = '#a3a3a3'; /* neutral-400 */
            }}
          >
            Reset Tasks
          </button>
        )}
      </div>

      {/* GitHub - bottom right on desktop, top right on mobile */}
      <div style={{
        position: 'fixed',
        ...(isMobile ? { top: 32, right: 32 } : { bottom: 32, right: 32 }),
        zIndex: 10,
      }}>
        <a
          href="https://github.com/dashrobotco/robot-components"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#737373', /* neutral-500 */
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e5e5'; /* neutral-200 */ }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#737373'; /* neutral-500 */ }}
        >
          <span style={{ fontSize: 14 }}>View on GitHub</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </div>

      {/* The Task Panel */}
      <TaskPanel
        tasks={tasks}
        config={config}
        onTaskClear={handleTaskClear}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
