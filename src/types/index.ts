export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Friend {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  friendIds?: string[]; // IDs of friends in this group (optional for backward compatibility)
  createdAt: Date;
  updatedAt: Date;
  color: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  paidBy: string; // userId
  groupId?: string;
  participants: ExpenseParticipant[];
  splitType: SplitType;
  createdAt: Date;
  updatedAt: Date;
  isSettled: boolean;
  receipt?: string;
}

export interface ExpenseParticipant {
  userId: string;
  name: string;
  amount: number;
  isSettled: boolean;
  settledAt?: Date;
}

export interface ExpenseSplit {
  participantId: string;
  amount: number;
}

export type SplitType = 'equal' | 'custom' | 'percentage';

export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'healthcare'
  | 'travel'
  | 'education'
  | 'other';

export interface Balance {
  userId: string;
  name: string;
  amount: number; // positive = owes, negative = owed
}

export interface GroupBalance {
  groupId: string;
  groupName: string;
  balances: Balance[];
  totalAmount: number;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    accent: string[];
    background: string[];
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    body: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
  };
}

export interface AppSettings {
  theme: 'light' | 'dark';
  currency: string;
  language: string;
  biometricEnabled: boolean;
  notifications: boolean;
  hapticFeedback: boolean;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}
