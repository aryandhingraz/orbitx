/**
 * Null-safe Formatting Utilities (§5, §7)
 * Never leaks undefined/NaN/Invalid Date to UI!
 */

export function formatNumber(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toFixed(decimals);
}

export function formatTemperature(temp, units = 'metric') {
  if (temp == null || isNaN(temp)) return '—';
  const rounded = Math.round(temp);
  return `${rounded}°${units === 'imperial' ? 'F' : 'C'}`;
}

export function formatWindSpeed(speed, units = 'metric') {
  if (speed == null || isNaN(speed)) return '—';
  const rounded = Math.round(speed);
  return `${rounded} ${units === 'imperial' ? 'mph' : 'km/h'}`;
}

export function formatCoordinate(lat, lon) {
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) return '—';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

export function formatTimestamp(timestamp) {
  if (!timestamp) return '—';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '—';
  }
}

export function formatTime(date = new Date()) {
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '—';
  }
}

export function formatCurrency(value, currencyCode = 'USD') {
  if (value == null || isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(value);
  } catch {
    return `${Number(value).toFixed(2)} ${currencyCode}`;
  }
}
