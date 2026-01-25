import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  colors: typeof lightColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@tasks_management:theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isInitialized, setIsInitialized] = useState(false);

  // Determine actual theme based on mode
  const theme: 'light' | 'dark' = 
    themeMode === 'auto' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : themeMode;

  const isDark = theme === 'dark';

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadTheme();
  }, []);

  // Update theme when system preference changes (if in auto mode)
  useEffect(() => {
    if (themeMode === 'auto' && isInitialized) {
      // Theme will automatically update via the theme calculation above
    }
  }, [systemColorScheme, themeMode, isInitialized]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Don't render until theme is loaded to avoid flash
  if (!isInitialized) {
    return null;
  }

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        isDark,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Premium theme colors matching web app
export const lightColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: 'rgba(148, 163, 184, 0.2)',
  primary: '#6366f1', // indigo-500
  primaryDark: '#4f46e5', // indigo-600
  primaryLight: '#818cf8', // indigo-400
  purple: '#a855f7', // purple-500
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  card: 'rgba(255, 255, 255, 0.7)',
  cardGlass: 'rgba(255, 255, 255, 0.8)',
  shadow: 'rgba(99, 102, 241, 0.15)',
  shadowStrong: 'rgba(99, 102, 241, 0.3)',
  gradientStart: '#6366f1',
  gradientEnd: '#a855f7',
};

export const darkColors = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  border: 'rgba(148, 163, 184, 0.2)',
  primary: '#6366f1', // indigo-500
  primaryDark: '#4f46e5', // indigo-600
  primaryLight: '#818cf8', // indigo-400
  purple: '#a855f7', // purple-500
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  card: 'rgba(30, 41, 59, 0.7)',
  cardGlass: 'rgba(30, 41, 59, 0.8)',
  shadow: 'rgba(99, 102, 241, 0.25)',
  shadowStrong: 'rgba(99, 102, 241, 0.4)',
  gradientStart: '#6366f1',
  gradientEnd: '#a855f7',
};
