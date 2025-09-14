import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Group, User, AppSettings, Friend } from '../types';

const STORAGE_KEYS = {
  EXPENSES: 'expenses',
  GROUPS: 'groups',
  USER: 'user',
  FRIENDS: 'friends',
  SETTINGS: 'app_settings',
} as const;

class StorageService {
  // User Management
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Expense Management
  async saveExpense(expense: Expense): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const updatedExpenses = [...expenses, expense];
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error saving expense:', error);
      throw error;
    }
  }

  async getExpenses(): Promise<Expense[]> {
    try {
      const expensesData = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      return expensesData ? JSON.parse(expensesData) : [];
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  async updateExpense(expenseId: string, updatedExpense: Partial<Expense>): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const expenseIndex = expenses.findIndex(expense => expense.id === expenseId);
      
      if (expenseIndex !== -1) {
        expenses[expenseIndex] = { ...expenses[expenseIndex], ...updatedExpense };
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(expenseId: string): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const filteredExpenses = expenses.filter(expense => expense.id !== expenseId);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filteredExpenses));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async getExpensesByGroup(groupId: string): Promise<Expense[]> {
    try {
      const expenses = await this.getExpenses();
      return expenses.filter(expense => expense.groupId === groupId);
    } catch (error) {
      console.error('Error getting expenses by group:', error);
      return [];
    }
  }

  // Group Management
  async saveGroup(group: Group): Promise<void> {
    try {
      const groups = await this.getGroups();
      const updatedGroups = [...groups, group];
      await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updatedGroups));
    } catch (error) {
      console.error('Error saving group:', error);
      throw error;
    }
  }

  async getGroups(): Promise<Group[]> {
    try {
      const groupsData = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
      return groupsData ? JSON.parse(groupsData) : [];
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  }

  async updateGroup(groupId: string, updatedGroup: Partial<Group>): Promise<void> {
    try {
      const groups = await this.getGroups();
      const groupIndex = groups.findIndex(group => group.id === groupId);
      
      if (groupIndex !== -1) {
        groups[groupIndex] = { ...groups[groupIndex], ...updatedGroup };
        await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
      }
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const groups = await this.getGroups();
      const filteredGroups = groups.filter(group => group.id !== groupId);
      await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(filteredGroups));
      
      // Also delete all expenses associated with this group
      const expenses = await this.getExpenses();
      const filteredExpenses = expenses.filter(expense => expense.groupId !== groupId);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filteredExpenses));
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  // Friends Management
  async saveFriend(friend: Friend): Promise<void> {
    try {
      const friends = await this.getFriends();
      const updatedFriends = [...friends, friend];
      await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(updatedFriends));
    } catch (error) {
      console.error('Error saving friend:', error);
      throw error;
    }
  }

  async getFriends(): Promise<Friend[]> {
    try {
      const friendsData = await AsyncStorage.getItem(STORAGE_KEYS.FRIENDS);
      return friendsData ? JSON.parse(friendsData) : [];
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  async updateFriend(friendId: string, updatedFriend: Partial<Friend>): Promise<void> {
    try {
      const friends = await this.getFriends();
      const friendIndex = friends.findIndex(friend => friend.id === friendId);
      
      if (friendIndex !== -1) {
        friends[friendIndex] = { ...friends[friendIndex], ...updatedFriend };
        await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
      }
    } catch (error) {
      console.error('Error updating friend:', error);
      throw error;
    }
  }

  async deleteFriend(friendId: string): Promise<void> {
    try {
      const friends = await this.getFriends();
      const filteredFriends = friends.filter(friend => friend.id !== friendId);
      await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(filteredFriends));
    } catch (error) {
      console.error('Error deleting friend:', error);
      throw error;
    }
  }

  // Settings Management
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async getSettings(): Promise<AppSettings | null> {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsData ? JSON.parse(settingsData) : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.EXPENSES,
        STORAGE_KEYS.GROUPS,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.FRIENDS,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async exportData(): Promise<{ expenses: Expense[]; groups: Group[]; user: User | null; friends: Friend[] }> {
    try {
      const [expenses, groups, user, friends] = await Promise.all([
        this.getExpenses(),
        this.getGroups(),
        this.getUser(),
        this.getFriends(),
      ]);
      
      return { expenses, groups, user, friends };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(data: { expenses: Expense[]; groups: Group[]; user: User | null; friends?: Friend[] }): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses)),
        AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(data.groups)),
        data.user ? AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user)) : Promise.resolve(),
        data.friends ? AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(data.friends)) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

export default new StorageService();
