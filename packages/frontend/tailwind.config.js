export default {
  darkMode: 'class', // Enable class-based dark mode
  corePlugins: {
    preflight: false,
  },
  important: '#harken',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic surface colors (use CSS variables)
        surface: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          elevated: 'var(--bg-elevated)',
          input: 'var(--bg-input)',
          header: 'var(--bg-header)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
        },
        // Semantic border colors
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          accent: 'var(--border-accent)',
        },
        // Semantic text colors
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        // Accent colors - Cyan (Primary Brand)
        cyan: {
          DEFAULT: 'var(--accent-cyan)',
          hover: 'var(--accent-cyan-hover)',
          glow: 'var(--accent-cyan-glow)',
          muted: 'var(--accent-cyan-muted)',
          light: 'var(--accent-cyan-light)',
          bg: 'var(--accent-cyan-bg)',
        },
        // Accent colors - Green (Success, Positive)
        green: {
          DEFAULT: 'var(--accent-green)',
          hover: 'var(--accent-green-hover)',
          glow: 'var(--accent-green-glow)',
          dark: 'var(--accent-green-dark)',
          light: 'var(--accent-green-light)',
          bg: 'var(--accent-green-bg)',
        },
        // Accent colors - Purple (Highlight, Special)
        purple: {
          DEFAULT: 'var(--accent-purple)',
          hover: 'var(--accent-purple-hover)',
          glow: 'var(--accent-purple-glow)',
          dark: 'var(--accent-purple-dark)',
          light: 'var(--accent-purple-light)',
          bg: 'var(--accent-purple-bg)',
        },
        // Negative/Error colors (Red)
        negative: {
          DEFAULT: 'var(--negative)',
          hover: 'var(--negative-hover)',
          glow: 'var(--negative-glow)',
          light: 'var(--negative-light)',
          bg: 'var(--negative-bg)',
        },
        // Status colors
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',

        // Legacy colors (keep for backward compatibility)
        customBlue: '#0da1c7',
        customGray: 'rgba(90, 90, 90, 1)',
        customLightGray: 'rgb(249, 249, 249)',
        loginGray: 'rgba(255, 255, 255, 0.3019607843)',
        customSkyBlue: '#26a69a',
        customDeeperSkyBlue: 'rgba(13, 161, 199, 1)',
        lightRed: '#f2dede',
        darkRed: '#a94442',
        Customwhite: '#fff',
        customBlack: 'rgba(28, 54, 67, 1)',
        silverGray: 'rgba(249, 249, 249, 1)',
        lightBlack: '#B1BAC0',
        black: '#000',
        limeGreen: 'limegreen',
        dodgerblue: 'dodgerblue',
        white: '#ffffff',
        redError: '#a94442',
        greyApproch: '#abadac',
        darkgray: 'darkgray',
      },
      boxShadow: {
        // Glow shadows for dark mode accents
        'glow-cyan': 'var(--shadow-glow-cyan)',
        'glow-green': 'var(--shadow-glow-green)',
        'glow-purple': 'var(--shadow-glow-purple)',
        'glow-negative': 'var(--shadow-glow-negative)',
        // Standard shadows
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      backgroundColor: {
        // Shorthand for surface backgrounds
        page: 'var(--bg-primary)',
        card: 'var(--bg-card)',
        elevated: 'var(--bg-elevated)',
      },
      textColor: {
        // Shorthand for text colors
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
      borderColor: {
        // Shorthand for border colors
        subtle: 'var(--border-subtle)',
        accent: 'var(--border-accent)',
      },
    },
  },
  plugins: [],
};
