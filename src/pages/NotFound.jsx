import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="page-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section
        className="data-widget-card"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: 'var(--space-section) var(--space-xl)',
          textAlign: 'center',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(3rem, 10vw, 5rem)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--color-sale)',
            lineHeight: 1,
            textShadow: '0 0 24px rgba(211, 0, 5, 0.45)',
          }}
        >
          404
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="swatch-dot swatch-dot--alert"></span>
          <span className="badge-promo" style={{ color: 'var(--color-sale)' }}>
            ORBITAL COORDINATE UNRESOLVED
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-heading-xl)',
            textTransform: 'uppercase',
            color: 'var(--color-ink)',
            margin: 'var(--space-xs) 0',
          }}
        >
          Lost In Space
        </h1>

        <p style={{ color: 'var(--color-mute)', fontSize: 'var(--text-body-md)', maxWidth: '420px', lineHeight: 1.6 }}>
          This coordinate does not exist in our planetary orbit. The telemetry path you followed may have decayed or been moved to a new trajectory.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--space-md)' }}>
          <Link to="/" className="btn-primary">
            Return to Mission Control
          </Link>
          <Link to="/explore" className="btn-secondary">
            Explore Analytics
          </Link>
        </div>
      </section>
    </div>
  );
}
