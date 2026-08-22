import '../styles/components/legend.css';

export function Legend({ title, items = [], className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`legend-container ${className}`}>
      {title && <span className="legend-title">{title}</span>}
      <div className="legend-items">
        {items.map((item, idx) => (
          <div key={idx} className="legend-item">
            <span
              className="swatch-dot"
              style={{ backgroundColor: item.color || 'var(--color-accent-teal)' }}
            />
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
