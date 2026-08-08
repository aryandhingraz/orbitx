/**
 * Unit Conversion Utilities (§0, §5)
 */

export function celsiusToFahrenheit(celsius) {
  if (celsius == null || isNaN(celsius)) return null;
  return Math.round((celsius * 9) / 5 + 32);
}

export function fahrenheitToCelsius(fahrenheit) {
  if (fahrenheit == null || isNaN(fahrenheit)) return null;
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

export function kmhToMph(kmh) {
  if (kmh == null || isNaN(kmh)) return null;
  return Math.round(kmh * 0.621371);
}

export function mphToKmh(mph) {
  if (mph == null || isNaN(mph)) return null;
  return Math.round(mph / 0.621371);
}
