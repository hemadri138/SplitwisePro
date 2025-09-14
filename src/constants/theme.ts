import { Theme } from '../types';

export const lightTheme: Theme = {
  colors: {
    primary: '#14B8A6', // Teal
    secondary: '#6366F1', // Indigo
    accent: '#F97316', // Coral
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  gradients: {
    primary: ['#14B8A6', '#0D9488'],
    secondary: ['#6366F1', '#4F46E5'],
    accent: ['#F97316', '#EA580C'],
    background: ['#F8FAFC', '#F1F5F9'],
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#2DD4BF', // Lighter teal for dark mode
    secondary: '#818CF8', // Lighter indigo
    accent: '#FB923C', // Lighter coral
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
  gradients: {
    primary: ['#2DD4BF', '#14B8A6'],
    secondary: ['#818CF8', '#6366F1'],
    accent: ['#FB923C', '#F97316'],
    background: ['#0F172A', '#1E293B'],
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.3)',
    large: '0 10px 15px rgba(0, 0, 0, 0.3)',
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
  },
};

export const categoryColors = {
  food: '#F59E0B',
  transport: '#3B82F6',
  entertainment: '#8B5CF6',
  shopping: '#EC4899',
  utilities: '#10B981',
  healthcare: '#EF4444',
  travel: '#06B6D4',
  education: '#84CC16',
  other: '#6B7280',
};

export const categoryIcons = {
  food: 'restaurant',
  transport: 'car',
  entertainment: 'movie',
  shopping: 'shopping-bag',
  utilities: 'home',
  healthcare: 'medical-bag',
  travel: 'airplane',
  education: 'school',
  other: 'ellipsis-horizontal',
};
