/**
 * OrbitX Shared Color Tokens (§2.3)
 * Single source of truth for all colors in both CSS format and Three.js integer hex format
 */

export const COLOR_TOKENS = {
  accentTeal: {
    css: 'var(--color-accent-teal)',
    hexStr: '#0A7281',
    threeHex: 0x0a7281,
  },
  info: {
    css: 'var(--color-info)',
    hexStr: '#1151FF',
    threeHex: 0x1151ff,
  },
  success: {
    css: 'var(--color-success-bright)',
    hexStr: '#1EAA52',
    threeHex: 0x1eaa52,
  },
  sale: {
    css: 'var(--color-sale)',
    hexStr: '#D30005',
    threeHex: 0xd30005,
  },
  ink: {
    css: 'var(--color-ink)',
    hexStr: '#111111',
    threeHex: 0x111111,
  },
  mute: {
    css: 'var(--color-mute)',
    hexStr: '#94A3B8',
    threeHex: 0x94a3b8,
  },
  softCloud: {
    css: 'var(--color-soft-cloud)',
    hexStr: '#F5F5F5',
    threeHex: 0xf5f5f5,
  },
  hairline: {
    css: 'var(--color-hairline)',
    hexStr: '#CACACB',
    threeHex: 0xcacacb,
  },
};

export const RADAR_CITY_COLORS = [
  COLOR_TOKENS.accentTeal,
  COLOR_TOKENS.info,
  COLOR_TOKENS.success,
  COLOR_TOKENS.sale,
];
