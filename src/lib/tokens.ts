/**
 * Design Tokens - Single source of truth for all design values
 * Edit this file to rebrand the entire application
 */

export const tokens = {
  // Color Tokens - Semantic naming for light/dark theme support
  colors: {
    light: {
      background: { primary: '#0a0a0f', secondary: '#13131a', tertiary: '#1a1a24' },
      surface: { 
        glass: 'rgba(255, 255, 255, 0.05)',
        glassHover: 'rgba(255, 255, 255, 0.08)',
        glassActive: 'rgba(255, 255, 255, 0.12)',
        card: 'rgba(255, 255, 255, 0.03)',
        elevated: 'rgba(255, 255, 255, 0.07)',
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        tertiary: 'rgba(255, 255, 255, 0.5)',
        disabled: 'rgba(255, 255, 255, 0.3)',
      },
      border: {
        default: 'rgba(255, 255, 255, 0.1)',
        hover: 'rgba(255, 255, 255, 0.2)',
        focus: 'rgba(255, 255, 255, 0.3)',
        glass: 'rgba(255, 255, 255, 0.15)',
      },
      ring: {
        primary: 'rgba(139, 92, 246, 0.5)',
        focus: 'rgba(139, 92, 246, 0.6)',
      },
      primary: {
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6',
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
        DEFAULT: '#8b5cf6',
      },
      accent: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef',
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        DEFAULT: '#d946ef',
      },
      success: {
        DEFAULT: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
      },
      warning: {
        DEFAULT: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
      },
      error: {
        DEFAULT: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
      },
    },
    dark: {
      // Alternative light theme (can be customized)
      background: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6' },
      surface: {
        glass: 'rgba(0, 0, 0, 0.02)',
        glassHover: 'rgba(0, 0, 0, 0.04)',
        glassActive: 'rgba(0, 0, 0, 0.06)',
        card: 'rgba(0, 0, 0, 0.01)',
        elevated: 'rgba(0, 0, 0, 0.03)',
      },
      text: {
        primary: '#111827',
        secondary: 'rgba(17, 24, 39, 0.7)',
        tertiary: 'rgba(17, 24, 39, 0.5)',
        disabled: 'rgba(17, 24, 39, 0.3)',
      },
      border: {
        default: 'rgba(0, 0, 0, 0.1)',
        hover: 'rgba(0, 0, 0, 0.2)',
        focus: 'rgba(0, 0, 0, 0.3)',
        glass: 'rgba(0, 0, 0, 0.15)',
      },
      ring: {
        primary: 'rgba(139, 92, 246, 0.5)',
        focus: 'rgba(139, 92, 246, 0.6)',
      },
      primary: {
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6',
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
        DEFAULT: '#8b5cf6',
      },
      accent: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef',
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        DEFAULT: '#d946ef',
      },
      success: {
        DEFAULT: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
      },
      warning: {
        DEFAULT: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
      },
      error: {
        DEFAULT: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
      },
    },
  },

  // Typography Tokens
  typography: {
    families: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    sizes: {
      xs: 'clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem)',
      sm: 'clamp(0.875rem, 0.85rem + 0.15vw, 1rem)',
      base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
      lg: 'clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)',
      xl: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',
      '2xl': 'clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)',
      '3xl': 'clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)',
      '4xl': 'clamp(2.25rem, 1.95rem + 1.5vw, 3rem)',
      '5xl': 'clamp(3rem, 2.5rem + 2.5vw, 3.75rem)',
      '6xl': 'clamp(3.75rem, 3rem + 3.75vw, 4.5rem)',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Spacing Scale
  spacing: {
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
  },

  // Border Radius
  radius: {
    none: '0',
    sm: '0.25rem',
    DEFAULT: '0.5rem',
    md: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Glassmorphism Effects
  glass: {
    blur: {
      sm: '4px',
      DEFAULT: '12px',
      md: '16px',
      lg: '24px',
      xl: '40px',
    },
    saturation: {
      low: '180%',
      DEFAULT: '180%',
      high: '200%',
    },
    alpha: {
      subtle: '0.03',
      light: '0.05',
      DEFAULT: '0.07',
      medium: '0.1',
      strong: '0.15',
    },
  },

  // Shadows & Elevation
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },

  // Animation & Motion
  motion: {
    durations: {
      instant: '75ms',
      fast: '150ms',
      DEFAULT: '200ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easings: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  // Layout Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Container Widths
  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  },

  // Z-Index Scale
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1100',
    fixed: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    toast: '1600',
  },
} as const;

export type Tokens = typeof tokens;
export type ColorTheme = keyof typeof tokens.colors;
