'use client';

import React, { useState } from 'react';
import { X, RotateCcw, Volume2, Activity, Zap, Layers, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Match this to your existing PhysicsConfig interface in page.tsx
// (Or export the interface from page.tsx and import it here if you want to be fancy)
interface PhysicsConfig {
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
  // Shadows (simplified for this UI, but you can add them if you want)
  idleShadowY: number;
  idleShadowBlur: number;
  idleShadowOpacity: number;
  dragShadowY: number;
  dragShadowBlur: number;
  dragShadowOpacity: number;
  // Color settings
  backgroundColor: string;
  gridColor: string;
  dotColor: string;
  slicerColor: string;
  connectionLineColor: string;
  // Theme settings
  theme: string;
  onClearPanels: () => void; // Add this
}
interface SettingsPanelProps {
  config: PhysicsConfig;
  onConfigChange: (newConfig: PhysicsConfig) => void;
  onReset: () => void;
  onClose: () => void;
  onClearPanels: () => void; // Add this
}

const SliderControl = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  format = (v: number) => v.toFixed(2) 
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (val: number) => void; 
  format?: (v: number) => string 
}) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: '#a3a3a3' }}>{label}</span>
      <span style={{ fontSize: 12, color: '#e5e5e5', fontFamily: 'monospace' }}>{format(value)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: '100%',
        accentColor: '#3b82f6',
        height: 4,
        background: '#333',
        borderRadius: 2,
        appearance: 'none',
        cursor: 'pointer'
      }}
    />
  </div>
);

const ColorControl = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
}) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: '#a3a3a3' }}>{label}</span>
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 40,
          height: 30,
          border: '1px solid #333',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          background: '#333',
          border: '1px solid #333',
          borderRadius: 4,
          color: '#fff',
          padding: '4px 8px',
          fontSize: 12,
          fontFamily: 'monospace'
        }}
      />
    </div>
  </div>
);

const Section = ({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8, border: '1px solid #262626', borderRadius: 8, overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          background: '#1e1e1e',
          border: 'none',
          color: '#e5e5e5',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} color="#737373" />
          {title}
        </div>
        {isOpen ? <ChevronUp size={14} color="#525252" /> : <ChevronDown size={14} color="#525252" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', background: '#171717' }}
          >
            <div style={{ padding: 12 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SettingsPanel({ config, onConfigChange, onReset, onClearPanels, onClose }: SettingsPanelProps) {
	const update = (key: keyof PhysicsConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };
  
  // Physics preset buttons
  const applyPhysicsPreset = (preset: 'sticky' | 'default' | 'bouncy') => {
    switch (preset) {
      case 'sticky':
        update('baseFriction', 0.97);
        update('highSpeedFriction', 0.94);
        update('bounceDamping', 0.2);
        update('bounceFrictionBoost', 0.85);
        update('maxVelocity', 40);
        break;
      case 'default':
        update('baseFriction', 0.97);
        update('highSpeedFriction', 0.94);
        update('bounceDamping', 0.45);
        update('bounceFrictionBoost', 0.85);
        update('maxVelocity', 40);
        break;
      case 'bouncy':
        update('baseFriction', 0.97);
        update('highSpeedFriction', 0.94);
        update('bounceDamping', 0.7);
        update('bounceFrictionBoost', 0.85);
        update('maxVelocity', 40);
        break;
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
		onMouseDown={(e) => e.stopPropagation()}
		onMouseUp={(e) => e.stopPropagation()}
		onClick={(e) => e.stopPropagation()}
		onDoubleClick={(e) => e.stopPropagation()} // Stop double clicks too!
      style={{
        position: 'fixed',
        right: 20,
        top: 20,
        width: 300,
        maxHeight: 'calc(100vh - 40px)',
        backgroundColor: 'rgba(23, 23, 23, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 12,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 99999, // On top of everything
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
	  

      <div style={{ 
        padding: '16px 16px 12px', 
        borderBottom: '1px solid #262626', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} color="#3b82f6" />
          Physics & Feel
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={onReset}
            title="Reset Defaults"
            style={{ background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer', padding: 4 }}
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
        
        <Section title="Physics Presets" icon={Activity} defaultOpen={true}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button 
              onClick={() => applyPhysicsPreset('sticky')}
              style={{ 
                flex: 1, 
                padding: 8, 
                background: '#1e1e1e', 
                border: '1px solid #333', 
                borderRadius: 6, 
                color: '#e5e5e5', 
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Sticky
            </button>
            <button 
              onClick={() => applyPhysicsPreset('default')}
              style={{ 
                flex: 1, 
                padding: 8, 
                background: '#1e1e1e', 
                border: '1px solid #333', 
                borderRadius: 6, 
                color: '#e5e5e5', 
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Default
            </button>
            <button 
              onClick={() => applyPhysicsPreset('bouncy')}
              style={{ 
                flex: 1, 
                padding: 8, 
                background: '#1e1e1e', 
                border: '1px solid #333', 
                borderRadius: 6, 
                color: '#e5e5e5', 
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Bouncy
            </button>
          </div>
        </Section>

        <Section title="Movement & Friction" icon={Activity} defaultOpen={true}>
          <SliderControl
            label="Base Friction (Slippery <-> Sticky)"
            value={config.baseFriction}
            min={0.80} max={0.99} step={0.001}
            onChange={(v) => update('baseFriction', v)}
          />
          <SliderControl
            label="High Speed Friction (Air Resistance)"
            value={config.highSpeedFriction}
            min={0.80} max={0.99} step={0.001}
            onChange={(v) => update('highSpeedFriction', v)}
          />
           <SliderControl
            label="Max Velocity"
            value={config.maxVelocity}
            min={10} max={100} step={1}
            onChange={(v) => update('maxVelocity', v)}
          />
        </Section>

        <Section title="Bounce & Impact" icon={Zap} defaultOpen={true}>
          <SliderControl
            label="Bounce Damping (Bounciness)"
            value={config.bounceDamping}
            min={0.1} max={0.9} step={0.05}
            onChange={(v) => update('bounceDamping', v)}
          />
          <SliderControl
            label="Friction Boost on Bounce"
            value={config.bounceFrictionBoost}
            min={0.5} max={1.0} step={0.05}
            onChange={(v) => update('bounceFrictionBoost', v)}
          />
        </Section>

        <Section title="Visuals & Scale" icon={Layers}>
          <SliderControl
            label="Drag Scale Effect"
            value={config.dragScale}
            min={1.0} max={1.2} step={0.01}
            onChange={(v) => update('dragScale', v)}
          />
          <SliderControl
            label="Shadow Opacity (Idle)"
            value={config.idleShadowOpacity}
            min={0} max={1} step={0.05}
            onChange={(v) => update('idleShadowOpacity', v)}
          />
          <SliderControl
            label="Shadow Blur (Idle)"
            value={config.idleShadowBlur}
            min={0} max={100} step={5}
            onChange={(v) => update('idleShadowBlur', v)}
          />
        </Section>

        <Section title="Colors" icon={Palette}>
          <ColorControl
            label="Background"
            value={config.backgroundColor}
            onChange={(v) => update('backgroundColor', v)}
          />
          <ColorControl
            label="Grid/Mesh"
            value={config.gridColor}
            onChange={(v) => update('gridColor', v)}
          />
          <ColorControl
            label="Dot"
            value={config.dotColor}
            onChange={(v) => update('dotColor', v)}
          />
          <ColorControl
            label="Slicer"
            value={config.slicerColor}
            onChange={(v) => update('slicerColor', v)}
          />
          <ColorControl
            label="Connection Line"
            value={config.connectionLineColor}
            onChange={(v) => update('connectionLineColor', v)}
          />
        </Section>

        <Section title="Theme" icon={Palette}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#a3a3a3' }}>Theme</span>
            </div>
            <select
              value={config.theme}
              onChange={(e) => update('theme', e.target.value)}
              style={{
                width: '100%',
                background: '#333',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff',
                padding: '8px',
                fontSize: 12
              }}
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
            </select>
          </div>
        </Section>

        <Section title="Sound Audio" icon={Volume2}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#a3a3a3' }}>Enable Sound</span>
            <input 
              type="checkbox" 
              checked={config.soundEnabled}
              onChange={(e) => update('soundEnabled', e.target.checked)}
              style={{ accentColor: '#3b82f6' }}
            />
          </div>
          <SliderControl
            label="Max Impact Volume"
            value={config.soundMaxVolume}
            min={0} max={1} step={0.01}
            onChange={(v) => update('soundMaxVolume', v)}
          />
        </Section>

        <button 
          onClick={onClearPanels}
          style={{ marginTop: 12, width: '100%', padding: 8, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Clear All Panels
        </button>
      </div>
    </motion.div>
  );
}