import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme } from '../constants/theme';
import { Theme, AppSettings } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  theme: 'light',
  currency: 'USD',
  language: 'en',
  biometricEnabled: false,
  notifications: true,
  hapticFeedback: true,
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setIsDark(parsedSettings.theme === 'dark');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const newSettings = { ...settings, theme: newIsDark ? 'dark' : 'light' };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    
    if (newSettings.theme !== undefined) {
      setIsDark(newSettings.theme === 'dark');
    }
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    settings,
    updateSettings,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
