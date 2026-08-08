import '../styles/components/errorBadge.css';

export function ErrorBadge({ message = 'Signal lost', onRetry }) {
  return (
    <div className="error-badge">
      <span>⚠️ {message}</span>
      {onRetry && (
        <button type="button" className="error-badge__retry-btn" onClick={onRetry}>
          RETRY
        </button>
      )}
    </div>
  );
}
