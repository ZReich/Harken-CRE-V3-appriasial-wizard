import { useState, useEffect } from 'react';

/**
 * Custom hook to sync state with localStorage changes
 * @param key The localStorage key to watch
 * @param initialValue Initial value if localStorage is empty
 * @returns [value, setValue] tuple
 */
export const useLocalStorageSync = (key: string, initialValue: string = '') => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialValue);

  useEffect(() => {
    const handleStorageChange = () => {
      const newValue = localStorage.getItem(key);
      setValue(newValue || initialValue);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [value, setValue] as const;
};