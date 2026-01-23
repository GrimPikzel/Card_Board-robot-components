---
description: Add features to the Node Editor Canvas - visual effects, interactions, physics, keyboard shortcuts
argument-hint: <describe what you want to add>
---

# Node Editor Expansion

You are helping expand the Node Editor Canvas component. The user wants to add or modify features.

## User Request

$ARGUMENTS

## Key Files

- **Main component**: `app/nodegrid/page.tsx` (~4500 lines)
- **Global styles**: `app/globals.css`
- **Sound effects**: `src/utils/SoundEffects.ts`

## Architecture

1. **GridPlayground** (line ~3600) - Main orchestrator
   - State: `floatingPanels`, `connections`, `connectionDrag`, `topPanelId`, `sliceTrail`

2. **FloatingPanel** (line ~850) - Draggable/resizable panels
   - Physics: velocity tracking, friction, bounce damping
   - Features: resize from edges/corners, connection handles

3. **DotGridCanvas** (line ~2250) - Animated dot grid background
   - Responds to panel positions and mouse movement
   - Draws connection lines between panels

4. **NoiseOverlay** (line ~2050) - WebGL film grain effect

## Design System (Tailwind neutral palette)

Use these colors with comments:
- `#fafafa` /* neutral-50 */ - Primary text
- `#e5e5e5` /* neutral-200 */ - Headings
- `#a3a3a3` /* neutral-400 */ - Secondary text
- `#737373` /* neutral-500 */ - Muted text
- `#525252` /* neutral-600 */ - Subtle icons
- `#404040` /* neutral-700 */ - Borders
- `#262626` /* neutral-800 */ - Card backgrounds
- `#171717` /* neutral-900 */ - Page background
- `#2563eb` /* blue-600 */ - Active/processing
- `#4ade80` /* green-400 */ - Success/completed

## Guidelines

1. **Use inline styles for layout in nodegrid** - The nodegrid page has issues with some Tailwind layout classes (`fixed`, `min-h-screen`). Use inline `style={{}}` for position, display, and dimensions.
2. **Use Tailwind color values** - Always use colors from the palette above with comments
3. **Test positioning** - Verify new elements appear on screen
4. **Maintain physics** - Preserve the velocity/friction/bounce system
5. **Sound feedback** - Add sounds using `soundEffects.playHoverSound()` or `playBounceSound()`

## Instructions

1. Read the relevant sections of `app/nodegrid/page.tsx`
2. Implement the requested feature
3. Follow existing patterns in the codebase
4. Test that changes don't break existing functionality
5. Suggest gradual implementation and fine tuning vs. multiple new features at once

Now implement the user's request.
