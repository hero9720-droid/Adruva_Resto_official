'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'elite-pulse' | 'midnight-gold' | 'cyber-neon' | 'nature-zen';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('elite-pulse');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      // For backwards compatibility with 'dark' class components
      document.documentElement.classList.toggle('dark', savedTheme !== 'nature-zen'); 
    } else {
      document.documentElement.setAttribute('data-theme', 'elite-pulse');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setThemeAndPersist = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme !== 'nature-zen');
  };

  const toggleTheme = () => {
    // Legacy toggle behavior (switches between elite and nature for demo)
    const newTheme = theme === 'elite-pulse' ? 'nature-zen' : 'elite-pulse';
    setThemeAndPersist(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeAndPersist }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
