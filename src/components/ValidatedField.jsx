import { useState, useEffect } from 'react';
import '../styles/components/validatedField.css';

/**
 * Reusable Validated Form Input Component (Lectures 55-60)
 *
 * @param {Object} props
 * @param {string} [props.label] - Field label text
 * @param {string} props.value - Controlled input value
 * @param {Function} props.onChange - Change handler (e) => void
 * @param {Function} [props.validate] - Function returning error string or null: (value) => string | null
 * @param {string} [props.type='text'] - Input type (text, password, number, etc.)
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {boolean} [props.isTextArea=false] - If true, renders textarea instead of input
 * @param {boolean} [props.forceShowError=false] - For parent submit attempts
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.id] - Element id
 * @param {Object} [props.style] - Additional inline styles
 */
export function ValidatedField({
  label,
  value = '',
  onChange,
  validate,
  type = 'text',
  placeholder = '',
  isTextArea = false,
  forceShowError = false,
  disabled = false,
  id,
  style,
  autoComplete,
  ...rest
}) {
  const [touched, setTouched] = useState(false);

  // Compute error message
  const errorMessage = validate ? validate(value) : null;
  const hasError = Boolean(errorMessage);
  const shouldDisplayError = (touched || forceShowError) && hasError;

  const inputId = id || (label ? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined);
  const inputClassName = `validated-field__input ${isTextArea ? 'validated-field__textarea' : ''} ${
    shouldDisplayError ? 'validated-field__input--error' : ''
  }`;

  return (
    <div className="validated-field" style={style}>
      {label && (
        <label htmlFor={inputId} className="validated-field__label">
          {label}
        </label>
      )}

      {isTextArea ? (
        <textarea
          id={inputId}
          className={inputClassName}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onBlur={() => setTouched(true)}
          aria-invalid={shouldDisplayError}
          aria-describedby={shouldDisplayError ? `${inputId}-error` : undefined}
          {...rest}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          className={inputClassName}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onBlur={() => setTouched(true)}
          autoComplete={autoComplete}
          aria-invalid={shouldDisplayError}
          aria-describedby={shouldDisplayError ? `${inputId}-error` : undefined}
          {...rest}
        />
      )}

      {shouldDisplayError && (
        <span id={`${inputId}-error`} className="validated-field__error" role="alert">
          ⚠️ {errorMessage}
        </span>
      )}
    </div>
  );
}
