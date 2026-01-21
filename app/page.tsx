'use client';

import Link from 'next/link';

export default function Home() {
  const components = [
    { name: 'Task Panel', path: '/taskpanel', description: 'Draggable task panel with physics' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 32
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>Robot Components</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Component library from the Robot Design System</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        {components.map((component) => (
          <Link
            key={component.path}
            href={component.path}
            style={{
              display: 'block',
              padding: '16px 20px',
              backgroundColor: '#282828',
              borderRadius: 12,
              textDecoration: 'none',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#303030';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#282828';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{component.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{component.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
