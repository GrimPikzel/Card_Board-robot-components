'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Loader2, Check, CircleCheck, ChevronUp, GripVertical } from 'lucide-react';
import type { TaskPanelProps, TaskPanelConfig, TaskItem } from './types';
import { DEFAULT_CONFIG, HEADER_HEIGHT, TASK_ROW_HEIGHT, DEFAULT_GRADIENTS } from './constants';
import { PanelSoundEffects } from './sounds';

export function TaskPanel({
  tasks,
  config: configOverrides,
  onPositionChange,
  onSizeChange,
  onBounce,
  onTaskClear,
  onClearAll,
  soundUrl,
}: TaskPanelProps) {
  // Merge config with defaults
  const config: TaskPanelConfig = { ...DEFAULT_CONFIG, ...configOverrides };

  // Create sound effects instance
  const panelSoundsRef = useRef<PanelSoundEffects | null>(null);

  // Use fixed initial position to avoid hydration mismatch, then center on mount
  const [position, setPosition] = useState(() => ({
    x: 400,
    y: 300,
  }));
  const [hasMounted, setHasMounted] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const innerPanelRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const velocitySamplesRef = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const isAnimatingRef = useRef(false);
  const justBouncedRef = useRef({ x: false, y: false });
  const bounceControls = useAnimation();

  // Track panel size changes with ResizeObserver
  useEffect(() => {
    const inner = innerPanelRef.current;
    if (!inner) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        onSizeChange?.(width, height);
      }
    });

    observer.observe(inner);
    return () => observer.disconnect();
  }, [onSizeChange]);

  // Visual feedback constants
  const DRAG_TRANSITION = 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)';

  // Generate shadow strings from config
  const IDLE_SHADOW = `0 ${config.idleShadowY}px ${config.idleShadowBlur}px ${config.idleShadowSpread}px rgba(0, 0, 0, ${config.idleShadowOpacity})`;
  const DRAG_SHADOW = `0 ${config.dragShadowY}px ${config.dragShadowBlur}px ${config.dragShadowSpread}px rgba(0, 0, 0, ${config.dragShadowOpacity})`;

  // Initialize sound on mount
  useEffect(() => {
    panelSoundsRef.current = new PanelSoundEffects(soundUrl);
    panelSoundsRef.current.initialize();
  }, [soundUrl]);

  // Center panel on mount (client-side only)
  useEffect(() => {
    setHasMounted(true);
    setPosition({
      x: window.innerWidth / 2 - config.panelWidth / 2,
      y: window.innerHeight / 2 - HEADER_HEIGHT / 2,
    });
  }, [config.panelWidth]);

  // Get viewport bounds
  const getViewportBounds = useCallback((scale: number, panelWidth: number, panelHeight: number) => {
    const effectiveWidth = window.innerWidth / scale;
    const effectiveHeight = window.innerHeight / scale;
    return {
      minX: config.boundaryMargin,
      maxX: effectiveWidth - panelWidth - config.boundaryMargin,
      minY: config.boundaryMargin,
      maxY: effectiveHeight - panelHeight - config.boundaryMargin,
    };
  }, [config.boundaryMargin]);

  // Clamp velocity
  const clampVelocity = useCallback((vx: number, vy: number) => {
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > config.maxVelocity) {
      const ratio = config.maxVelocity / speed;
      return { vx: vx * ratio, vy: vy * ratio };
    }
    return { vx, vy };
  }, [config.maxVelocity]);

  // Calculate velocity from samples
  const calculateVelocityFromSamples = useCallback((): { x: number; y: number } => {
    const samples = velocitySamplesRef.current;
    if (samples.length < 2) return { x: 0, y: 0 };

    const now = performance.now();
    const maxAge = 80;

    const lastSample = samples[samples.length - 1];
    if (now - lastSample.t > maxAge) {
      return { x: 0, y: 0 };
    }

    let totalWeight = 0;
    let weightedVelX = 0;
    let weightedVelY = 0;

    for (let i = 1; i < samples.length; i++) {
      const prev = samples[i - 1];
      const curr = samples[i];
      const dt = curr.t - prev.t;
      const age = now - curr.t;

      if (age <= maxAge && dt >= 8 && dt < 100) {
        const weight = i / samples.length;
        const velX = ((curr.x - prev.x) / dt) * 16.67;
        const velY = ((curr.y - prev.y) / dt) * 16.67;
        weightedVelX += velX * weight;
        weightedVelY += velY * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) return { x: 0, y: 0 };
    return {
      x: weightedVelX / totalWeight,
      y: weightedVelY / totalWeight,
    };
  }, []);

  // Animate momentum
  const animateMomentum = useCallback((
    startX: number,
    startY: number,
    velX: number,
    velY: number,
    scale: number,
    panelWidth: number,
    panelHeight: number
  ) => {
    const panel = panelRef.current;
    if (!panel) return;

    const clamped = clampVelocity(velX, velY);
    let x = startX;
    let y = startY;
    let vx = clamped.vx;
    let vy = clamped.vy;

    isAnimatingRef.current = true;
    justBouncedRef.current = { x: false, y: false };

    const animate = () => {
      const bounds = getViewportBounds(scale, panelWidth, panelHeight);

      const speed = Math.sqrt(vx * vx + vy * vy);
      const speedRatio = Math.min(speed / config.maxVelocity, 1);
      const friction = config.baseFriction - (speedRatio * (config.baseFriction - config.highSpeedFriction));

      const bounceMultiplierX = justBouncedRef.current.x ? config.bounceFrictionBoost : 1;
      const bounceMultiplierY = justBouncedRef.current.y ? config.bounceFrictionBoost : 1;

      vx *= friction * bounceMultiplierX;
      vy *= friction * bounceMultiplierY;

      justBouncedRef.current = { x: false, y: false };

      x += vx;
      y += vy;

      let didBounce = false;
      const preBounceSpeeed = Math.sqrt(vx * vx + vy * vy);

      // Calculate normalized impact force (0-1) based on pre-bounce speed
      const impactForce = Math.min(preBounceSpeeed / config.maxVelocity, 1);

      if (x < bounds.minX) {
        x = bounds.minX;
        vx = Math.abs(vx) * config.bounceDamping;
        justBouncedRef.current.x = true;
        didBounce = true;
        onBounce?.(x, y + panelHeight / 2, impactForce);
      } else if (x > bounds.maxX) {
        x = bounds.maxX;
        vx = -Math.abs(vx) * config.bounceDamping;
        justBouncedRef.current.x = true;
        didBounce = true;
        onBounce?.(x + panelWidth, y + panelHeight / 2, impactForce);
      }

      if (y < bounds.minY) {
        y = bounds.minY;
        vy = Math.abs(vy) * config.bounceDamping;
        justBouncedRef.current.y = true;
        didBounce = true;
        onBounce?.(x + panelWidth / 2, y, impactForce);
      } else if (y > bounds.maxY) {
        y = bounds.maxY;
        vy = -Math.abs(vy) * config.bounceDamping;
        justBouncedRef.current.y = true;
        didBounce = true;
        onBounce?.(x + panelWidth / 2, y + panelHeight, impactForce);
      }

      // Play bounce sound
      if (didBounce && preBounceSpeeed > 0.5 && config.soundEnabled && panelSoundsRef.current) {
        const normalizedSpeed = Math.min(preBounceSpeeed / config.maxVelocity, 1);
        const impactVolume = config.soundMinVolume + (normalizedSpeed * normalizedSpeed) * (config.soundMaxVolume - config.soundMinVolume);
        panelSoundsRef.current.play(impactVolume);
      }

      panel.style.left = x + 'px';
      panel.style.top = y + 'px';
      onPositionChange?.(x, y);

      const currentSpeed = Math.sqrt(vx * vx + vy * vy);
      if (currentSpeed > config.minVelocity) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
        animationFrameRef.current = null;
        setPosition({ x, y });
        onPositionChange?.(x, y);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [config, clampVelocity, getViewportBounds, onBounce, onPositionChange]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-drag]')) return;

    const panel = panelRef.current;
    if (!panel) return;

    const wasAnimating = animationFrameRef.current !== null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      isAnimatingRef.current = false;
    }

    const innerPanel = panel.querySelector('[data-panel-inner]') as HTMLElement;
    const rect = panel.getBoundingClientRect();
    const scale = rect.width / config.panelWidth;

    let startCssX: number;
    let startCssY: number;
    if (wasAnimating) {
      startCssX = parseFloat(panel.style.left) || position.x;
      startCssY = parseFloat(panel.style.top) || position.y;
      setPosition({ x: startCssX, y: startCssY });
    } else {
      startCssX = position.x;
      startCssY = position.y;
    }

    const grabOffsetX = e.clientX - rect.left;
    const grabOffsetY = e.clientY - rect.top;
    const startRectLeft = rect.left;
    const startRectTop = rect.top;

    let hasMoved = false;
    let finalX = startCssX;
    let finalY = startCssY;

    velocitySamplesRef.current = [{ x: startCssX, y: startCssY, t: performance.now() }];

    const applyDragStyle = () => {
      if (innerPanel) {
        innerPanel.style.transition = DRAG_TRANSITION;
        innerPanel.style.transform = `scale(${config.dragScale})`;
        innerPanel.style.boxShadow = DRAG_SHADOW;
      }
      panel.style.cursor = 'grabbing';
      document.body.style.cursor = 'grabbing';
    };

    const removeDragStyle = () => {
      if (innerPanel) {
        innerPanel.style.transition = DRAG_TRANSITION;
        innerPanel.style.transform = 'scale(1)';
        innerPanel.style.boxShadow = IDLE_SHADOW;
      }
      panel.style.cursor = '';
      document.body.style.cursor = '';
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const targetViewportX = moveEvent.clientX - grabOffsetX;
      const targetViewportY = moveEvent.clientY - grabOffsetY;
      const viewportDeltaX = targetViewportX - startRectLeft;
      const viewportDeltaY = targetViewportY - startRectTop;
      const cssDeltaX = viewportDeltaX / scale;
      const cssDeltaY = viewportDeltaY / scale;

      if (!hasMoved && (Math.abs(cssDeltaX) > 2 || Math.abs(cssDeltaY) > 2)) {
        hasMoved = true;
        applyDragStyle();
      }

      if (hasMoved) {
        const currentRect = panel.getBoundingClientRect();
        const panelHeight = currentRect.height / scale;
        const panelWidth = currentRect.width / scale;
        const bounds = getViewportBounds(scale, panelWidth, panelHeight);

        finalX = Math.max(bounds.minX, Math.min(bounds.maxX, startCssX + cssDeltaX));
        finalY = Math.max(bounds.minY, Math.min(bounds.maxY, startCssY + cssDeltaY));
        panel.style.left = finalX + 'px';
        panel.style.top = finalY + 'px';
        onPositionChange?.(finalX, finalY);

        const now = performance.now();
        velocitySamplesRef.current.push({ x: finalX, y: finalY, t: now });

        if (velocitySamplesRef.current.length > config.velocitySampleCount) {
          velocitySamplesRef.current.shift();
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      removeDragStyle();

      if (hasMoved) {
        setIsDragging(true);
        setTimeout(() => setIsDragging(false), 50);

        const velocity = calculateVelocityFromSamples();
        const clamped = clampVelocity(velocity.x, velocity.y);
        const speed = Math.sqrt(clamped.vx * clamped.vx + clamped.vy * clamped.vy);

        if (speed > config.momentumThreshold) {
          const currentRect = panel.getBoundingClientRect();
          const panelHeight = currentRect.height / scale;
          const panelWidth = currentRect.width / scale;
          animateMomentum(finalX, finalY, clamped.vx, clamped.vy, scale, panelWidth, panelHeight);
        } else {
          setPosition({ x: finalX, y: finalY });
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle touch start (mobile support)
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-drag]')) return;

    const panel = panelRef.current;
    if (!panel) return;

    const touch = e.touches[0];

    const wasAnimating = animationFrameRef.current !== null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      isAnimatingRef.current = false;
    }

    const innerPanel = panel.querySelector('[data-panel-inner]') as HTMLElement;
    const rect = panel.getBoundingClientRect();
    const scale = rect.width / config.panelWidth;

    let startCssX: number;
    let startCssY: number;
    if (wasAnimating) {
      startCssX = parseFloat(panel.style.left) || position.x;
      startCssY = parseFloat(panel.style.top) || position.y;
      setPosition({ x: startCssX, y: startCssY });
    } else {
      startCssX = position.x;
      startCssY = position.y;
    }

    const grabOffsetX = touch.clientX - rect.left;
    const grabOffsetY = touch.clientY - rect.top;
    const startRectLeft = rect.left;
    const startRectTop = rect.top;

    let hasMoved = false;
    let finalX = startCssX;
    let finalY = startCssY;

    velocitySamplesRef.current = [{ x: startCssX, y: startCssY, t: performance.now() }];

    const applyDragStyle = () => {
      if (innerPanel) {
        innerPanel.style.transition = DRAG_TRANSITION;
        innerPanel.style.transform = `scale(${config.dragScale})`;
        innerPanel.style.boxShadow = DRAG_SHADOW;
      }
    };

    const removeDragStyle = () => {
      if (innerPanel) {
        innerPanel.style.transition = DRAG_TRANSITION;
        innerPanel.style.transform = 'scale(1)';
        innerPanel.style.boxShadow = IDLE_SHADOW;
      }
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      const moveTouch = moveEvent.touches[0];

      const targetViewportX = moveTouch.clientX - grabOffsetX;
      const targetViewportY = moveTouch.clientY - grabOffsetY;
      const viewportDeltaX = targetViewportX - startRectLeft;
      const viewportDeltaY = targetViewportY - startRectTop;
      const cssDeltaX = viewportDeltaX / scale;
      const cssDeltaY = viewportDeltaY / scale;

      if (!hasMoved && (Math.abs(cssDeltaX) > 2 || Math.abs(cssDeltaY) > 2)) {
        hasMoved = true;
        applyDragStyle();
      }

      if (hasMoved) {
        const currentRect = panel.getBoundingClientRect();
        const panelHeight = currentRect.height / scale;
        const panelWidth = currentRect.width / scale;
        const bounds = getViewportBounds(scale, panelWidth, panelHeight);

        finalX = Math.max(bounds.minX, Math.min(bounds.maxX, startCssX + cssDeltaX));
        finalY = Math.max(bounds.minY, Math.min(bounds.maxY, startCssY + cssDeltaY));
        panel.style.left = finalX + 'px';
        panel.style.top = finalY + 'px';
        onPositionChange?.(finalX, finalY);

        const now = performance.now();
        velocitySamplesRef.current.push({ x: finalX, y: finalY, t: now });

        if (velocitySamplesRef.current.length > config.velocitySampleCount) {
          velocitySamplesRef.current.shift();
        }
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      removeDragStyle();

      if (hasMoved) {
        setIsDragging(true);
        setTimeout(() => setIsDragging(false), 50);

        const velocity = calculateVelocityFromSamples();
        const clamped = clampVelocity(velocity.x, velocity.y);
        const speed = Math.sqrt(clamped.vx * clamped.vx + clamped.vy * clamped.vy);

        if (speed > config.momentumThreshold) {
          const currentRect = panel.getBoundingClientRect();
          const panelHeight = currentRect.height / scale;
          const panelWidth = currentRect.width / scale;
          animateMomentum(finalX, finalY, clamped.vx, clamped.vy, scale, panelWidth, panelHeight);
        } else {
          setPosition({ x: finalX, y: finalY });
        }
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Handle toggle
  const handleToggle = () => {
    if (isDragging) return;
    setIsExpanded(!isExpanded);
    bounceControls.start({
      scale: [1, 1.015, 1],
      transition: { duration: 0.3, ease: 'easeOut' },
    });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Calculate heights
  const activeCount = tasks.filter(t => t.status === 'processing').length;
  const tasksListHeight = tasks.length > 4 ? (4.5 * TASK_ROW_HEIGHT) + 14 : (tasks.length * TASK_ROW_HEIGHT) + 14;
  const expandedHeight = HEADER_HEIGHT + tasksListHeight;
  const currentHeight = isExpanded ? expandedHeight : HEADER_HEIGHT;

  const getHeaderText = () => {
    if (activeCount > 0) {
      return `${activeCount} task${activeCount !== 1 ? 's' : ''} processing`;
    }
    return `${tasks.length} task${tasks.length !== 1 ? 's' : ''} completed`;
  };

  // Get gradient for task thumbnail
  const getTaskGradient = (task: TaskItem, index: number) => {
    return task.gradient || DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];
  };

  return (
    <>
      <style>{`
        .taskpanel-scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        @keyframes taskpanel-shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        @keyframes taskpanel-ellipsis {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .taskpanel-generating {
          animation: taskpanel-shimmer 2s ease-in-out infinite;
        }
        .taskpanel-ellipsis span {
          display: inline-block;
        }
        .taskpanel-ellipsis span:nth-child(1) {
          animation: taskpanel-ellipsis 1.2s ease-in-out infinite;
          animation-delay: 0s;
        }
        .taskpanel-ellipsis span:nth-child(2) {
          animation: taskpanel-ellipsis 1.2s ease-in-out infinite;
          animation-delay: 0.15s;
        }
        .taskpanel-ellipsis span:nth-child(3) {
          animation: taskpanel-ellipsis 1.2s ease-in-out infinite;
          animation-delay: 0.3s;
        }
      `}</style>
      <motion.div
        ref={panelRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          opacity: { duration: 0.15 },
          scale: { type: 'spring', stiffness: 400, damping: 25 },
          y: { type: 'spring', stiffness: 400, damping: 25 },
        }}
        style={{
          position: 'fixed',
          zIndex: 2147483647,
          userSelect: 'none',
          touchAction: 'none',
          left: position.x,
          top: position.y,
          width: config.panelWidth,
          cursor: 'grab',
        }}
      >
        <motion.div
          animate={bounceControls}
          style={{
            width: '100%',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
        >
          <motion.div
            ref={innerPanelRef}
            data-panel-inner
            initial={false}
            animate={{ height: currentHeight }}
            transition={{
              height: { type: 'spring', stiffness: 400, damping: 28 },
            }}
            style={{
              backgroundColor: '#222222',
              boxShadow: IDLE_SHADOW,
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <button
              onClick={handleToggle}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                height: HEADER_HEIGHT,
                backgroundColor: '#282828',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2e2e2e'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#282828'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {activeCount > 0 ? (
                  <Loader2 size={15} style={{ color: '#2463EB', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <CircleCheck size={15} style={{ color: '#4ade80' }} />
                )}
                <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255, 255, 255, 0.8)' }}>
                  {getHeaderText()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  data-no-drag
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearAll?.();
                  }}
                  style={{
                    fontSize: 11,
                    padding: '4px 8px',
                    borderRadius: 6,
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: isExpanded ? 1 : 0,
                    pointerEvents: isExpanded ? 'auto' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  Clear
                </span>
                <GripVertical size={14} style={{ color: 'rgba(255, 255, 255, 0.25)' }} />
                <ChevronUp
                  size={13}
                  style={{
                    color: 'rgba(255, 255, 255, 0.3)',
                    transition: 'transform 0.3s ease-out',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </div>
            </button>

            {/* Tasks List */}
            <div style={{ position: 'relative' }}>
              <div
                className="taskpanel-scrollbar-none"
                style={{
                  height: tasksListHeight,
                  paddingTop: 6,
                  paddingBottom: 8,
                  overflowY: 'auto',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      borderRadius: 5,
                      cursor: 'pointer',
                      position: 'relative',
                      height: TASK_ROW_HEIGHT,
                      padding: '6px 16px 6px 12px',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        flexShrink: 0,
                        transition: 'all 0.15s',
                        background: task.thumbnail ? `url(${task.thumbnail}) center/cover` : getTaskGradient(task, index),
                      }}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              display: 'block',
                              fontSize: 13,
                              fontWeight: 500,
                              color: '#fff',
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {task.name}
                          </span>
                        </div>
                        <span
                          data-no-drag
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClear?.(task.id);
                          }}
                          style={{
                            opacity: 0,
                            transition: 'opacity 0.15s',
                            fontSize: 11,
                            color: 'rgba(255, 255, 255, 0.4)',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0';
                          }}
                        >
                          Clear
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {task.status === 'processing' ? (
                          <span style={{ fontSize: 11, color: '#888' }}>
                            <span className="taskpanel-generating">Generating</span>
                            <span className="taskpanel-ellipsis"><span>.</span><span>.</span><span>.</span></span>
                          </span>
                        ) : (
                          <>
                            <Check size={11} style={{ flexShrink: 0, color: '#888' }} />
                            <span style={{ fontSize: 11, color: '#888' }}>
                              Generated{task.size ? ` • ${task.size}` : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Bottom gradient mask */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  background: 'linear-gradient(to top, #222222 0%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
