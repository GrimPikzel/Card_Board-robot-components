# Node Editor Expansion Skill

Use this skill when you want to add new features, customize behavior, or extend the Node Editor Canvas component.

## When to Use This Skill

- Adding new node types or panel variants
- Customizing the dot grid appearance or behavior
- Adding new keyboard shortcuts
- Modifying connection line styles
- Adding new UI controls or overlays
- Changing physics behavior (bounce, friction, momentum)
- Adding new sound effects or visual feedback
- Implementing new gestures or interactions

## How to Invoke

Simply describe what you want to add or change. Here are example prompts:

### Adding Visual Features

```
"Add a glow effect around panels when they're selected"

"Make the connection lines animate with a flowing gradient"

"Add a minimap in the corner showing all panels"

"Change the dot grid to use squares instead of circles"
```

### Adding Interactions

```
"Add double-click to edit panel content"

"Let me select multiple panels by dragging a selection box"

"Add right-click context menu with options like duplicate, delete, change color"

"Add pinch-to-zoom on the canvas"
```

### Adding Panel Features

```
"Add different panel types - some with headers, some minimal"

"Let panels have custom colors that I can pick"

"Add collapse/expand animation to panels"

"Add a lock button to prevent panels from being moved"
```

### Adding Keyboard Shortcuts

```
"Add Cmd+D to duplicate the selected panel"

"Add Delete key to remove selected panel"

"Add arrow keys to nudge panels by 10px"

"Add Cmd+A to select all panels"
```

### Modifying Physics

```
"Make panels feel heavier when dragging"

"Add magnetic snapping when panels get close to each other"

"Make panels bounce more when hitting edges"

"Add a 'snap to grid' toggle button"
```

## Architecture Overview

The Node Editor is built with these key parts:

### Main Components

1. **GridPlayground** (line ~3591) - The main page component that orchestrates everything
2. **FloatingPanel** (line ~851) - Individual draggable/resizable panels
3. **DotGridCanvas** (line ~2243) - The animated dot grid background
4. **NoiseOverlay** (line ~2047) - WebGL film grain effect

### State Management

```typescript
// Key state in GridPlayground:
floatingPanels     // Array of all panels with position/size
connections        // Lines connecting panels
connectionDrag     // Active connection being drawn
topPanelId         // Which panel is on top (z-index)
sliceTrail         // Visual trail when slicing connections
```

### Physics System

Panels use a custom physics loop with:
- Velocity tracking from drag gestures
- Friction that slows movement over time
- Bounce damping when hitting screen edges
- Spring animations via Framer Motion

### Connection System

Connections follow an L-shaped grid path:
1. Start from panel center
2. Snap to nearest grid point
3. Travel horizontally then vertically
4. End at target panel center

### Sound System

`src/utils/SoundEffects.ts` provides:
- `playBounceSound(intensity)` - Edge collisions
- `playHoverSound(elementId)` - UI hover feedback
- `playQuickStartClick()` - Button clicks

## Tips for Non-Developers

### Be Specific About Position

Instead of: "Add a button"
Say: "Add a button in the top-right corner of each panel"

### Describe the Interaction

Instead of: "Make panels colorful"
Say: "Add a color picker that appears when I right-click a panel, letting me choose from 6 preset colors"

### Reference Existing Behavior

Instead of: "Add animation"
Say: "Add a wobble animation like the bounce effect when panels hit edges"

### Mention Edge Cases

Instead of: "Add delete"
Say: "Add a delete button that asks for confirmation if there are connections to other panels"

## Testing Your Changes

After Claude makes changes:

1. Check the terminal for errors
2. Refresh the browser (Cmd+R)
3. If layout looks broken, try hard refresh (Cmd+Shift+R)
4. Test on both desktop and mobile if relevant

## Common Issues

**Panels appear off-screen**: Usually means a positioning style is wrong. Ask Claude to check the `position: fixed` and coordinates.

**Grid not showing**: The canvas might have z-index issues. Ask Claude to verify the DotGridCanvas styles.

**Connections not drawing**: Check that the connection state is being updated in `handleConnectionDragEnd`.

**Sounds not playing**: Browser may be blocking autoplay. Sounds need user interaction first.
