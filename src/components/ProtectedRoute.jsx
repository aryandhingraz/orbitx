import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/uiSlice.js';
import { ValidatedField } from './ValidatedField.jsx';

export const PRIVACY_LOCK_KEY = 'orbitx-privacy-lock-passcode';
export const SESSION_UNLOCK_KEY = 'orbitx-journal-unlocked';

export function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const storedPasscode = localStorage.getItem(PRIVACY_LOCK_KEY);
  const isLockEnabled = Boolean(storedPasscode && storedPasscode.length >= 4);

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(SESSION_UNLOCK_KEY) === 'true';
  });

  const [enteredCode, setEnteredCode] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If no passcode has been set in Settings, allow direct access
  if (!isLockEnabled || isUnlocked) {
    return children;
  }

  function validatePasscode(val) {
    if (!val || val.length === 0) return 'Passcode is required.';
    if (!/^\d+$/.test(val)) return 'Passcode must be numeric digits only.';
    if (val.length < 4) return 'Passcode must be at least 4 digits.';
    return null;
  }

  function handleUnlock(e) {
    e.preventDefault();
    const valError = validatePasscode(enteredCode);
    if (valError) {
      setHasError(true);
      setErrorMessage(valError);
      return;
    }

    if (enteredCode !== storedPasscode) {
      setHasError(true);
      setErrorMessage('Incorrect passcode. Please check Settings or try again.');
      dispatch(showToast({ message: 'Incorrect passcode entered.', type: 'sale' }));
      return;
    }

    sessionStorage.setItem(SESSION_UNLOCK_KEY, 'true');
    setIsUnlocked(true);
    dispatch(showToast({ message: 'Journal unlocked for current session.', type: 'success' }));
  }

  return (
    <div className="page-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="data-widget-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: 'var(--space-section) var(--space-xl)',
          textAlign: 'center',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--color-soft-cloud)',
            border: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            margin: '0 auto',
          }}
        >
          🔒
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', textTransform: 'uppercase', color: 'var(--color-ink)' }}>
            Local Privacy Lock
          </h2>
          <span className="badge-promo" style={{ marginTop: 'var(--space-xs)', color: 'var(--color-accent-teal)' }}>
            PROTECTED ROUTE GATEWAY
          </span>
        </div>

        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-mute)', lineHeight: 1.5 }}>
          Your personal telemetry journal is locked. Enter your 4-digit passcode configured in Settings to proceed.
        </p>

        <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%', marginTop: 'var(--space-xs)' }}>
          <ValidatedField
            label="Security Passcode"
            type="password"
            placeholder="••••"
            value={enteredCode}
            onChange={(e) => {
              setEnteredCode(e.target.value);
              if (hasError) setHasError(false);
            }}
            validate={() => (hasError ? errorMessage : null)}
            forceShowError={hasError}
            autoComplete="current-password"
            style={{ textAlign: 'left' }}
          />

          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              Unlock Journal
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
          <p style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', fontStyle: 'italic', lineHeight: 1.4 }}>
            ℹ️ <strong>Client-Side Notice:</strong> This privacy lock is a local convenience gate for your browser session. It does not provide cryptographic backend security.
          </p>
        </div>
      </div>
    </div>
  );
}
