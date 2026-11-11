import defaultTheme from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        'background-soft': 'rgb(var(--background-soft) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-soft': 'rgb(var(--surface-soft) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted: 'rgb(var(--foreground-muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
          bright: 'rgb(var(--primary-bright) / <alpha-value>)',
          soft: 'rgb(var(--primary-soft) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
          hover: 'rgb(var(--danger-hover) / <alpha-value>)',
          soft: 'rgb(var(--danger-soft) / <alpha-value>)',
          foreground: 'rgb(var(--danger-foreground) / <alpha-value>)',
        },
        material: {
          papel: {
            DEFAULT: 'rgb(var(--material-papel) / <alpha-value>)',
            strong: 'rgb(var(--material-papel-strong) / <alpha-value>)',
            soft: 'rgb(var(--material-papel-soft) / <alpha-value>)',
          },
          plastico: {
            DEFAULT: 'rgb(var(--material-plastico) / <alpha-value>)',
            strong: 'rgb(var(--material-plastico-strong) / <alpha-value>)',
            soft: 'rgb(var(--material-plastico-soft) / <alpha-value>)',
          },
          vidrio: {
            DEFAULT: 'rgb(var(--material-vidrio) / <alpha-value>)',
            strong: 'rgb(var(--material-vidrio-strong) / <alpha-value>)',
            soft: 'rgb(var(--material-vidrio-soft) / <alpha-value>)',
          },
          metal: {
            DEFAULT: 'rgb(var(--material-metal) / <alpha-value>)',
            strong: 'rgb(var(--material-metal-strong) / <alpha-value>)',
            soft: 'rgb(var(--material-metal-soft) / <alpha-value>)',
          },
          organico: {
            DEFAULT: 'rgb(var(--material-organico) / <alpha-value>)',
            strong: 'rgb(var(--material-organico-strong) / <alpha-value>)',
            soft: 'rgb(var(--material-organico-soft) / <alpha-value>)',
          },
          electronicos: {
            DEFAULT: 'rgb(var(--material-electronicos) / <alpha-value>)',
            strong: 'rgb(var(--material-electronicos-strong) / <alpha-value>)',
            soft: 'rgb(var(--material-electronicos-soft) / <alpha-value>)',
          },
          pilas: {
            DEFAULT: 'rgb(var(--material-pilas) / <alpha-value>)',
            strong: 'rgb(var(--material-pilas-strong) / <alpha-value>)',
            soft: 'rgb(var(--material-pilas-soft) / <alpha-value>)',
          },
          general: {
            DEFAULT: 'rgb(var(--material-general) / <alpha-value>)',
            strong: 'rgb(var(--material-general-strong) / <alpha-value>)',
            soft: 'rgb(var(--material-general-soft) / <alpha-value>)',
          },
        },
        status: {
          available: {
            DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
            strong: 'rgb(var(--primary) / <alpha-value>)',
            soft: 'rgb(var(--primary-soft) / <alpha-value>)',
          },
          'near-full': {
            DEFAULT: 'rgb(var(--status-near-full) / <alpha-value>)',
            strong: 'rgb(var(--status-near-full) / <alpha-value>)',
            soft: 'rgb(var(--status-near-full-soft) / <alpha-value>)',
          },
          full: {
            DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
            strong: 'rgb(var(--danger) / <alpha-value>)',
            soft: 'rgb(var(--danger-soft) / <alpha-value>)',
          },
          damaged: {
            DEFAULT: 'rgb(var(--status-damaged) / <alpha-value>)',
            strong: 'rgb(var(--status-damaged) / <alpha-value>)',
            soft: 'rgb(var(--status-damaged-soft) / <alpha-value>)',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-display)', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        card: '1.25rem',
        bento: '1.5rem',
        hero: '1.75rem',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        lift: 'var(--shadow-lift)',
        glow: 'var(--shadow-glow)',
      },
      keyframes: {
        'aurora-drift': {
          '0%': { transform: 'translate3d(-6%, -4%, 0) scale(1)' },
          '50%': { transform: 'translate3d(5%, 6%, 0) scale(1.08)' },
          '100%': { transform: 'translate3d(-3%, 3%, 0) scale(0.98)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.55' },
          '70%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        'aurora-drift': 'aurora-drift 18s ease-in-out infinite alternate',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
