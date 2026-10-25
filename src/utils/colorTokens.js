/**
 * OrbitX Shared Color Tokens (§2.3)
 * Single source of truth for all colors in both CSS format and Three.js integer hex format
 */

export const COLOR_TOKENS = {
  accentTeal: {
    css: 'var(--color-accent-teal)',
    hexStr: '#2DD4BF',
    threeHex: 0x2dd4bf,
  },
  info: {
    css: 'var(--color-info)',
    hexStr: '#60A5FA',
    threeHex: 0x60a5fa,
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
    hexStr: '#FFFFFF',
    threeHex: 0xffffff,
  },
  mute: {
    css: 'var(--color-mute)',
    hexStr: '#94A3B8',
    threeHex: 0x94a3b8,
  },
  softCloud: {
    css: 'var(--color-soft-cloud)',
    hexStr: '#141A2B',
    threeHex: 0x141a2b,
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
