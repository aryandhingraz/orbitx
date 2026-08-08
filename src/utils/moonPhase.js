/**
 * Conway Synodic Moon Phase Calculation (§0)
 * Calculates lunar age (0..29.53 days), phase fraction (0..1), and name
 */

export function getMoonPhase(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Conway synodic-month formula
  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;
  r -= year < 2000 ? 4 : 8.3;

  const age = Math.floor((r + 30) % 30);
  const fraction = age / 29.53; // 0..1

  let name = 'New Moon';
  let glyph = '🌑';

  if (age >= 1 && age < 7) {
    name = 'Waxing Crescent';
    glyph = '🌒';
  } else if (age >= 7 && age < 9) {
    name = 'First Quarter';
    glyph = '🌓';
  } else if (age >= 9 && age < 14) {
    name = 'Waxing Gibbous';
    glyph = '🌔';
  } else if (age >= 14 && age < 16) {
    name = 'Full Moon';
    glyph = '🌕';
  } else if (age >= 16 && age < 22) {
    name = 'Waning Gibbous';
    glyph = '🌖';
  } else if (age >= 22 && age < 24) {
    name = 'Last Quarter';
    glyph = '🌗';
  } else if (age >= 24 && age < 29) {
    name = 'Waning Crescent';
    glyph = '🌘';
  }

  return {
    age,
    fraction,
    name,
    glyph,
    illuminationPercent: Math.round((1 - Math.cos((age / 29.53) * 2 * Math.PI)) * 50),
  };
}
