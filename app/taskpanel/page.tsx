'use client';

import { useState } from 'react';
import { TaskPanel, TaskItem } from '../../src/taskpanel';

// Generate demo tasks
const generateDemoTasks = (): TaskItem[] => {
  const names = [
    'cosmic-nebula',
    'azure-crystal',
    'midnight-bloom',
    'solar-flare',
    'ocean-depths',
    'aurora-burst',
    'velvet-storm',
    'golden-hour',
  ];

  return names.map((name, i) => ({
    id: `task-${i}`,
    name,
    status: i < 2 ? 'processing' : 'completed',
    size: `${(Math.random() * 50 + 1).toFixed(1)} MB`,
  }));
};

export default function TaskPanelDemo() {
  const [tasks, setTasks] = useState<TaskItem[]>(generateDemoTasks);

  const handleTaskClear = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleClearAll = () => {
    setTasks([]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1C1C1C',
    }}>
      {/* Title */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        maxWidth: 320,
        zIndex: 10,
      }}>
        <h1 style={{ fontSize: 19, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
          Task Panel
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2, lineHeight: 1.5 }}>
          Drag and throw the panel. Part of the<br />Robot Design System.
        </p>
      </div>

      {/* GitHub */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10 }}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e5e5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
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
        onTaskClear={handleTaskClear}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
