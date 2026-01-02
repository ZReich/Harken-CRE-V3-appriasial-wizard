import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  showSystemOption?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ThemeToggle({ 
  showSystemOption = true, 
  size = 'md',
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

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const buttonSize = size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-3' : 'p-2';

  const renderIcon = () => {
    if (showSystemOption && theme === 'system') {
      return (
        <Monitor 
          size={iconSize}
          className="text-purple-500 dark:text-purple-400 transition-transform hover:rotate-12"
        />
      );
    }
    
    if (resolvedTheme === 'dark') {
      return (
        <Moon 
          size={iconSize}
          className="text-cyan-400 transition-transform hover:rotate-12"
        />
      );
    }
    
    return (
      <Sun 
        size={iconSize}
        className="text-amber-500 transition-transform hover:rotate-12"
      />
    );
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${buttonSize}
        rounded-lg
        bg-gray-100 dark:bg-slate-700
        border border-gray-200 dark:border-slate-600
        hover:bg-gray-200 dark:hover:bg-slate-600
        hover:border-[var(--harken-accent)] dark:hover:border-cyan-400
        hover:shadow-md dark:hover:shadow-cyan-500/20
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[var(--harken-accent)] focus:ring-offset-2 dark:focus:ring-offset-slate-800
        ${className}
      `}
      title={getTooltipTitle()}
      aria-label={getTooltipTitle()}
    >
      {renderIcon()}
    </button>
  );
}

export default ThemeToggle;
