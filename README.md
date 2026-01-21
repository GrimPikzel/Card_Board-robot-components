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

## Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `framer-motion` >= 10.0.0
- `lucide-react` >= 0.300.0

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
