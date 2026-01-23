# Robot Components

React components from the Robot Design System.

## Installation

```bash
npm install robot-components
```

## Components

### Task Panel

A draggable task panel with physics-based interactions.

```tsx
import { TaskPanel } from 'robot-components';

function App() {
  const tasks = [
    { id: '1', name: 'cosmic-nebula', status: 'processing' },
    { id: '2', name: 'azure-crystal', status: 'completed', size: '12.5 MB' },
  ];

  return (
    <TaskPanel
      tasks={tasks}
      onTaskClear={(id) => console.log('Clear task:', id)}
      onClearAll={() => console.log('Clear all')}
    />
  );
}
```

#### Features

- **Drag & throw** with real momentum
- **Bounces** off screen edges with damping
- **Impact sounds** that scale with velocity
- **Lifts up** with deeper shadow while dragging
- **Spring-animated** expand/collapse
- **Touch support** for mobile

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `tasks` | `TaskItem[]` | Array of tasks to display |
| `config` | `Partial<TaskPanelConfig>` | Optional configuration overrides |
| `onPositionChange` | `(x, y) => void` | Callback when panel moves |
| `onSizeChange` | `(w, h) => void` | Callback when panel resizes |
| `onBounce` | `(x, y, intensity) => void` | Callback on edge bounce |
| `onTaskClear` | `(taskId) => void` | Callback when task is cleared |
| `onClearAll` | `() => void` | Callback when all tasks cleared |
| `soundUrl` | `string` | Custom sound file URL |

#### TaskItem

```ts
interface TaskItem {
  id: string;
  name: string;
  status: 'completed' | 'processing';
  size?: string;
  thumbnail?: string;
  gradient?: string;
}
```

### Node Editor Canvas

An interactive node editor with draggable panels, connections, and physics.

#### Features

- **Click to spawn** nodes anywhere on the canvas
- **Drag & throw** panels with momentum and edge bouncing
- **Connect panels** by dragging from corner handles
- **Slice connections** by dragging through lines
- **Resize panels** from edges and corners
- **Keyboard shortcuts**: Shift for grid snap, Cmd+drag for scale from center
- **Dynamic dot grid** that responds to panel movement
- **WebGL noise overlay** for visual texture

### Demo

Run the demo to see both components in action:

```bash
npm run dev
```

Then visit:
- http://localhost:3002 - Component overview
- http://localhost:3002/taskpanel - Task Panel demo
- http://localhost:3002/nodegrid - Node Editor demo

## Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `framer-motion` >= 10.0.0
- `lucide-react` >= 0.300.0
- `tailwindcss` >= 4.0.0

## Development

```bash
# Install dependencies
npm install

# Run demo site
npm run dev

# Build library
npm run build
```

## License

MIT
