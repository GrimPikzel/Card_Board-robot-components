import Link from 'next/link';

export default function Home() {
  const components = [
    { name: 'Task Panel', path: '/taskpanel', description: 'Draggable task panel with physics' },
    { name: 'Node Editor Canvas', path: '/nodegrid', description: 'Interactive node editor with connections and physics' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 32,
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Robot Logo */}
        <div
          className="btn-skin"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
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
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 4, color: '#fff' }}>Robot Components</h1>
        <p style={{ color: '#737373', fontSize: 14 }}>Component library from the Robot Design System</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 384 }}>
        {components.map((component) => (
          <Link
            key={component.path}
            href={component.path}
            style={{
              display: 'block',
              padding: '16px 20px',
              backgroundColor: '#262626', /* neutral-800 */
              borderRadius: 12,
              border: '1px solid #333',
              textDecoration: 'none',
              color: '#fff',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 15 }}>{component.name}</div>
            <div style={{ fontSize: 14, color: '#777', marginTop: 4 }}>{component.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
