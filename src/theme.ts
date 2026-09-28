/**
 * HammingSpace Theme Tokens — Single Source of Truth
 * Mirrored as CSS variables in index.css for DOM components.
 */

export const theme = {
  colors: {
    // Base
    bg: '#0b0f19',
    surface: '#111827',
    surfaceElevated: '#1e2536',
    border: '#334155',
    borderStrong: '#475569',

    // Text
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',

    // Semantic Bit Colors (matching hammingLesson.css)
    data: '#0ea5e9',      // teal - message/data bits
    dataBg: '#0f3d42',
    parity: '#f59e0b',    // amber - parity bits
    parityBg: '#4a3212',
    error: '#f43f5e',     // red - flipped/corrupted
    errorBg: '#5f1c2b',
    corrected: '#10b981', // green - corrected
    correctedBg: '#14532d',

    // Status Accents
    statusIdle: '#64748b',
    statusEncoding: '#3b82f6',
    statusTransit: '#3b82f6',
    statusDecoding: '#818cf8',
    statusError: '#f43f5e',
    statusCorrected: '#10b981',

    // Materials
    matAluminum: '#334155',
    matAluminumDark: '#1e293b',
    matKeycap: '#1e293b',
    matTrackpad: '#1e293b',
    matScreenBg: '#0b101d',
    matScreenText: '#f8fafc',
    matFloor: '#161b26',
    matRug: '#1e2536',
    matWallSlat: '#1e293b',
    matWallCove: '#fef3c7',
    matWallCoveEmissive: '#fbbf24',
    matTray: '#1e293b',
  },

  // Bit role colors for quick access
  bitRole: {
    data: { fill: '#0f3d42', emissive: '#0ea5e9', ring: '#334155', label: 'dat', labelColor: '#60a5fa' },
    parity: { fill: '#4a3212', emissive: '#f59e0b', ring: '#334155', label: 'par', labelColor: '#fbbf24' },
    error: { fill: '#5f1c2b', emissive: '#f43f5e', ring: '#f43f5e', label: 'err', labelColor: '#fb7185' },
    corrected: { fill: '#14532d', emissive: '#10b981', ring: '#10b981', label: 'fix', labelColor: '#34d399' },
    empty: { fill: '#0f172a', emissive: '#000000', ring: '#334155', label: '', labelColor: '#475569' },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.4)',
    lg: '0 20px 80px rgba(0,0,0,0.6)',
  },

  transitions: {
    fast: '150ms',
    base: '300ms',
    slow: '600ms',
    camera: '1600ms',
    flip: '450ms',
  },

  easing: {
    standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    camera: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  typography: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    serif: 'Georgia, "Times New Roman", serif',
    sizes: {
      xs: '0.625rem',   // 10px
      sm: '0.75rem',    // 12px
      base: '0.875rem', // 14px
      lg: '1rem',       // 16px
      xl: '1.125rem',   // 18px
      '2xl': '1.25rem', // 20px
    },
  },

  zIndex: {
    canvas: 0,
    hud: 10,
    overlay: 3000,
    modal: 50,
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type Theme = typeof theme;

// CSS Variable prefix
export const CSS_VAR_PREFIX = '--hamm';

// Helper to generate CSS variables
export function generateCSSVariables(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};

  function flatten(obj: any, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const cssKey = `${prefix}${key}`.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flatten(value, `${cssKey}-`);
      } else {
        vars[`${CSS_VAR_PREFIX}-${cssKey}`] = String(value);
      }
    }
  }

  flatten(theme);
  return vars;
}

// Camera shot definitions
export const cameraShots = {
  overview: { position: [0, 3.8, 16.0], lookAt: [0, 0.4, 0], fov: 46, duration: 1600 },
  txScreen: { position: [-6.2, 2.4, 8.8], lookAt: [-6.2, 0.6, -0.2], fov: 38, duration: 1600 },
  tray: { position: [-6.2, 1.2, 4.5], lookAt: [-6.2, 0.1, 0.4], fov: 32, duration: 1400 },
  channel: { position: [0, 1.8, 7.5], lookAt: [0, 0.25, 0.45], fov: 40, duration: 1600 },
  noise: { position: [0, 1.4, 5.6], lookAt: [0, 0.35, 0.45], fov: 35, duration: 1200 },
  rxScreen: { position: [6.2, 2.4, 8.8], lookAt: [6.2, 0.6, -0.2], fov: 38, duration: 1600 },
  rxResult: { position: [5.2, 1.6, 6.5], lookAt: [5.4, 0.6, 0.3], fov: 32, duration: 1400 },
  firstPerson: { position: [0, 0.25, 5.2], lookAt: [0, 0.25, -2.5], fov: 60, duration: 0 },
} as const;

export type CameraShotName = keyof typeof cameraShots;