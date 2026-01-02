import { createTheme, ThemeOptions } from "@mui/material";

// Shared typography settings
const typography = {
  fontFamily: "'Montserrat', sans-serif",
  h1: { fontFamily: "'Roboto Slab', serif" },
  h2: { fontFamily: "'Roboto Slab', serif" },
  h3: { fontFamily: "'Roboto Slab', serif" },
  h4: { fontFamily: "'Roboto Slab', serif" },
  h5: { fontFamily: "'Roboto Slab', serif" },
  h6: { fontFamily: "'Roboto Slab', serif" },
};

// Light theme colors
const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#0da1c7',
    light: '#37add5',
    dark: '#0b8aab',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#1c3643',
    light: '#2d4a5a',
    dark: '#0d1a22',
    contrastText: '#ffffff',
  },
  success: {
    main: '#16a34a',
    light: '#22c55e',
    dark: '#15803d',
    contrastText: '#ffffff',
  },
  error: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#b91c1c',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#000000',
  },
  info: {
    main: '#9333ea',
    light: '#a855f7',
    dark: '#7e22ce',
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
  },
  text: {
    primary: '#1f2937',
    secondary: '#5a5a5a',
    disabled: '#9ca3af',
  },
  divider: '#e5e7eb',
  action: {
    hover: 'rgba(13, 161, 199, 0.08)',
    selected: 'rgba(13, 161, 199, 0.12)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
};

// Dark theme colors
const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#00d4ff',
    light: '#33ddff',
    dark: '#0da1c7',
    contrastText: '#0f1419',
  },
  secondary: {
    main: '#94a3b8',
    light: '#cbd5e1',
    dark: '#64748b',
    contrastText: '#0f1419',
  },
  success: {
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
    contrastText: '#0f1419',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#fbbf24',
    light: '#fcd34d',
    dark: '#f59e0b',
    contrastText: '#0f1419',
  },
  info: {
    main: '#a855f7',
    light: '#c084fc',
    dark: '#9333ea',
    contrastText: '#0f1419',
  },
  background: {
    default: '#0f1419',
    paper: '#1a2332',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    disabled: '#64748b',
  },
  divider: '#2d3f52',
  action: {
    hover: 'rgba(0, 212, 255, 0.1)',
    selected: 'rgba(0, 212, 255, 0.15)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
};

// Shared component overrides generator
const getComponentOverrides = (isDark: boolean): ThemeOptions['components'] => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: isDark ? '#0f1419' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#1f2937',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: isDark ? '#1a2332' : '#ffffff',
        borderColor: isDark ? '#2d3f52' : '#e5e7eb',
      },
      elevation1: {
        boxShadow: isDark 
          ? '0 1px 3px 0 rgba(0, 0, 0, 0.4)' 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#1a2332' : '#ffffff',
        borderColor: isDark ? '#2d3f52' : '#e5e7eb',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        borderRadius: 6,
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: isDark 
            ? '0 0 20px rgba(0, 212, 255, 0.2)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      },
      containedPrimary: {
        backgroundColor: isDark ? '#00d4ff' : '#0da1c7',
        color: isDark ? '#0f1419' : '#ffffff',
        '&:hover': {
          backgroundColor: isDark ? '#33ddff' : '#0bb8e3',
        },
      },
      outlined: {
        borderColor: isDark ? '#2d3f52' : '#d1d5db',
        '&:hover': {
          borderColor: isDark ? '#00d4ff' : '#0da1c7',
          backgroundColor: isDark ? 'rgba(0, 212, 255, 0.1)' : 'rgba(13, 161, 199, 0.08)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiInputBase-root': {
          backgroundColor: isDark ? '#1e2a3a' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#1f2937',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: isDark ? '#2d3f52' : 'rgba(0, 0, 0, 0.23)',
        },
        '& .MuiInputLabel-root': {
          color: isDark ? '#94a3b8' : '#5a5a5a',
        },
        '& .MuiInputBase-input::placeholder': {
          color: isDark ? '#64748b' : '#9ca3af',
          opacity: 1,
        },
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        color: isDark ? '#f1f5f9' : '#1f2937',
        '&.Mui-focused': {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? '#00d4ff' : '#0da1c7',
          },
        },
      },
      input: {
        '&::placeholder': {
          color: isDark ? '#64748b' : '#9ca3af',
          opacity: 1,
        },
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#1e2a3a' : '#ffffff',
      },
      icon: {
        color: isDark ? '#94a3b8' : '#5a5a5a',
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        backgroundColor: isDark ? '#1a2332' : '#ffffff',
        border: isDark ? '1px solid #2d3f52' : '1px solid #e5e7eb',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        color: isDark ? '#f1f5f9' : '#1f2937',
        '&:hover': {
          backgroundColor: isDark ? '#243447' : '#f5f5f5',
        },
        '&.Mui-selected': {
          backgroundColor: isDark ? 'rgba(0, 212, 255, 0.15)' : 'rgba(13, 161, 199, 0.12)',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(0, 212, 255, 0.2)' : 'rgba(13, 161, 199, 0.16)',
          },
        },
      },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#1a2332' : '#ffffff',
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#243447' : '#f9f9f9',
        '& .MuiTableCell-root': {
          color: isDark ? '#00d4ff' : '#0da1c7',
          fontWeight: 600,
          borderColor: isDark ? '#2d3f52' : '#ebebeb',
        },
      },
    },
  },
  MuiTableBody: {
    styleOverrides: {
      root: {
        '& .MuiTableRow-root': {
          '&:hover': {
            backgroundColor: isDark ? '#243447' : '#f5f5f5',
          },
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: isDark ? '#2d3f52' : '#ebebeb',
        color: isDark ? '#f1f5f9' : '#1f2937',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundColor: isDark ? '#1a2332' : '#ffffff',
        backgroundImage: 'none',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#243447' : '#cfecf4',
        color: isDark ? '#00d4ff' : '#0da1c7',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: isDark ? '#1a2332' : '#ffffff',
        borderColor: isDark ? '#2d3f52' : '#eee',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#0d1117' : '#1c3643',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        backgroundColor: isDark ? '#00d4ff' : '#0da1c7',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        color: isDark ? '#94a3b8' : '#84929a',
        '&.Mui-selected': {
          color: isDark ? '#00d4ff' : '#0da1c7',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#243447' : '#f3f4f6',
        color: isDark ? '#f1f5f9' : '#1f2937',
      },
      colorPrimary: {
        backgroundColor: isDark ? 'rgba(0, 212, 255, 0.15)' : 'rgba(13, 161, 199, 0.12)',
        color: isDark ? '#00d4ff' : '#0da1c7',
      },
      colorSuccess: {
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(22, 163, 74, 0.12)',
        color: isDark ? '#22c55e' : '#16a34a',
      },
      colorError: {
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.12)',
        color: isDark ? '#ef4444' : '#dc2626',
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: isDark ? '#243447' : '#1f2937',
        color: isDark ? '#f1f5f9' : '#ffffff',
        border: isDark ? '1px solid #2d3f52' : 'none',
      },
    },
  },
  MuiPagination: {
    styleOverrides: {
      root: {
        '& .MuiPaginationItem-root': {
          color: isDark ? '#94a3b8' : '#5a5a5a',
          '&.Mui-selected': {
            backgroundColor: isDark ? '#00d4ff' : 'rgba(13, 161, 199, 1)',
            color: isDark ? '#0f1419' : '#ffffff',
          },
        },
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        '& .MuiSwitch-switchBase.Mui-checked': {
          color: isDark ? '#00d4ff' : '#0da1c7',
          '& + .MuiSwitch-track': {
            backgroundColor: isDark ? '#00d4ff' : '#0da1c7',
          },
        },
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: isDark ? '#64748b' : 'rgba(0, 0, 0, 0.54)',
        '&.Mui-checked': {
          color: isDark ? '#00d4ff' : '#0da1c7',
        },
      },
    },
  },
  MuiRadio: {
    styleOverrides: {
      root: {
        color: isDark ? '#64748b' : 'rgba(0, 0, 0, 0.54)',
        '&.Mui-checked': {
          color: isDark ? '#00d4ff' : '#0da1c7',
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      standardSuccess: {
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
        color: isDark ? '#4ade80' : '#15803d',
      },
      standardError: {
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
        color: isDark ? '#f87171' : '#b91c1c',
      },
      standardWarning: {
        backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7',
        color: isDark ? '#fbbf24' : '#92400e',
      },
      standardInfo: {
        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff',
        color: isDark ? '#c084fc' : '#7e22ce',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        color: isDark ? '#94a3b8' : '#5a5a5a',
        '&:hover': {
          backgroundColor: isDark ? 'rgba(0, 212, 255, 0.1)' : 'rgba(13, 161, 199, 0.08)',
        },
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#2d3f52' : '#e5e7eb',
      },
      bar: {
        backgroundColor: isDark ? '#00d4ff' : '#0da1c7',
      },
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      root: {
        color: isDark ? '#00d4ff' : '#0da1c7',
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#243447' : '#e5e7eb',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: isDark ? '#2d3f52' : '#e5e7eb',
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      colorPrimary: {
        backgroundColor: isDark ? '#00d4ff' : '#0da1c7',
        color: isDark ? '#0f1419' : '#ffffff',
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      paper: {
        backgroundColor: isDark ? '#1a2332' : '#ffffff',
        border: isDark ? '1px solid #2d3f52' : '1px solid #e5e7eb',
      },
      option: {
        '&:hover': {
          backgroundColor: isDark ? '#243447' : '#f5f5f5',
        },
        '&[aria-selected="true"]': {
          backgroundColor: isDark ? 'rgba(0, 212, 255, 0.15)' : 'rgba(13, 161, 199, 0.12)',
        },
      },
    },
  },
});

// Create light theme
export const lightTheme = createTheme({
  palette: lightPalette,
  typography,
  components: getComponentOverrides(false),
  shape: {
    borderRadius: 6,
  },
});

// Create dark theme
export const darkTheme = createTheme({
  palette: darkPalette,
  typography,
  components: getComponentOverrides(true),
  shape: {
    borderRadius: 6,
  },
});

// Legacy export for backward compatibility
export const primaryTheme = lightTheme;
