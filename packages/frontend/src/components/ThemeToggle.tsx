import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  showSystemOption?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function ThemeToggle({ 
  showSystemOption = false, 
  size = 'medium',
  className = ''
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const getTooltipTitle = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'}) - Click to switch`;
    }
    return `${resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode - Click to switch`;
  };

  const handleClick = () => {
    if (showSystemOption) {
      // Cycle through: light -> dark -> system -> light
      if (theme === 'light') {
        setTheme('dark');
      } else if (theme === 'dark') {
        setTheme('system');
      } else {
        setTheme('light');
      }
    } else {
      toggleTheme();
    }
  };

  const iconSx = {
    fontSize: size === 'small' ? 20 : size === 'large' ? 28 : 24,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s',
    '&:hover': {
      transform: 'rotate(15deg)',
    },
  };

  const renderIcon = () => {
    if (showSystemOption && theme === 'system') {
      return (
        <SettingsBrightnessIcon 
          sx={{ 
            ...iconSx,
            color: 'var(--accent-purple)',
          }} 
        />
      );
    }
    
    if (resolvedTheme === 'dark') {
      return (
        <DarkModeIcon 
          sx={{ 
            ...iconSx,
            color: 'var(--accent-cyan)',
          }} 
        />
      );
    }
    
    return (
      <LightModeIcon 
        sx={{ 
          ...iconSx,
          color: 'var(--warning)',
        }} 
      />
    );
  };

  return (
    <Tooltip title={getTooltipTitle()} arrow>
      <IconButton
        onClick={handleClick}
        className={className}
        sx={{
          padding: size === 'small' ? 0.5 : size === 'large' ? 1.5 : 1,
          backgroundColor: resolvedTheme === 'dark' 
            ? 'rgba(0, 212, 255, 0.1)' 
            : 'rgba(13, 161, 199, 0.1)',
          border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(0, 212, 255, 0.3)' : 'rgba(13, 161, 199, 0.3)'}`,
          borderRadius: '8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: resolvedTheme === 'dark' 
              ? 'rgba(0, 212, 255, 0.2)' 
              : 'rgba(13, 161, 199, 0.2)',
            borderColor: 'var(--accent-cyan)',
            boxShadow: resolvedTheme === 'dark' 
              ? 'var(--shadow-glow-cyan)' 
              : 'var(--shadow-sm)',
            transform: 'scale(1.05)',
          },
        }}
        aria-label={getTooltipTitle()}
      >
        {renderIcon()}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
