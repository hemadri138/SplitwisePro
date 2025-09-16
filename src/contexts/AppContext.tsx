import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Group, User, Balance, GroupBalance } from '../types';
import StorageService from '../services/StorageService';

interface AppContextType {
  // Data
  expenses: Expense[];
  groups: Group[];
  user: User | null;
  balances: Balance[];
  groupBalances: GroupBalance[];
   
  // Loading states
  isLoading: boolean;
  
  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  settleGroup: (groupId: string) => Promise<void>;
  settleBetweenUsers: (params: { groupId: string; fromUserId: string; toUserId: string; amount: number }) => Promise<void>;
  
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, friendId: string) => Promise<void>;
  removeMemberFromGroup: (groupId: string, friendId: string) => Promise<void>;
  
  updateUser: (user: User) => Promise<void>;
  
  // Computed values
  getExpensesByGroup: (groupId: string) => Expense[];
  getTotalBalance: () => number;
  getRecentExpenses: (limit?: number) => Expense[];
  getExpensesByCategory: () => Record<string, number>;
  getGroupExpensesByCategory: () => Record<string, number>;
  getPersonalExpensesByCategory: () => Record<string, number>;
  
  // Refresh
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [expensesData, groupsData, userData] = await Promise.all([
        StorageService.getExpenses(),
        StorageService.getGroups(),
        StorageService.getUser(),
      ]);
      
      setExpenses(expensesData);
      setGroups(groupsData);
      
      // Initialize user if none exists
      if (!userData) {
        const defaultUser: User = {
          id: generateId(),
          name: 'User',
          email: 'user@example.com',
          defaultCurrency: 'USD',
          createdAt: new Date(),
        };
        await StorageService.saveUser(defaultUser);
        setUser(defaultUser);
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Computed values
  const balances = React.useMemo(() => {
    const balanceMap = new Map<string, Balance>();
    
    expenses
      .filter(expense => !expense.isSettled)
      .forEach(expense => {
        expense.participants.forEach(participant => {
          const current = balanceMap.get(participant.userId) || {
            userId: participant.userId,
            name: participant.name,
            amount: 0,
          };

          // Net change = share owed minus amount paid
          const amountPaid = expense.paidBy === participant.userId ? expense.amount : 0;
          const netDelta = participant.amount - amountPaid;

          current.amount += netDelta;
          balanceMap.set(participant.userId, current);
        });
    });
    
    return Array.from(balanceMap.values());
  }, [expenses]);

  const groupBalances = React.useMemo(() => {
    return groups.map(group => {
      const groupExpenses = expenses.filter(expense => expense.groupId === group.id && !expense.isSettled);
      const groupBalanceMap = new Map<string, Balance>();
      
      groupExpenses.forEach(expense => {
        expense.participants.forEach(participant => {
          const current = groupBalanceMap.get(participant.userId) || {
            userId: participant.userId,
            name: participant.name,
            amount: 0,
          };

          const amountPaid = expense.paidBy === participant.userId ? expense.amount : 0;
          const netDelta = participant.amount - amountPaid;

          current.amount += netDelta;
          groupBalanceMap.set(participant.userId, current);
        });
      });
      
      const groupBalances = Array.from(groupBalanceMap.values());
      const totalAmount = groupBalances.reduce((sum, balance) => sum + Math.abs(balance.amount), 0) / 2;
      
      return {
        groupId: group.id,
        groupName: group.name,
        balances: groupBalances,
        totalAmount,
      };
    });
  }, [expenses, groups]);

  // Actions
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const expense: Expense = {
        ...expenseData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        currency: expenseData.currency || 'USD', // Default to USD if not provided
      };
      
      await StorageService.saveExpense(expense);
      setExpenses(prev => [...prev, expense]);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    try {
      const updatedExpense = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await StorageService.updateExpense(expenseId, updatedExpense);
      setExpenses(prev => 
        prev.map(expense => 
          expense.id === expenseId 
            ? { ...expense, ...updatedExpense }
            : expense
        )
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      await StorageService.deleteExpense(expenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const settleGroup = async (groupId: string) => {
    try {
      const groupExpenseIds = expenses
        .filter(e => e.groupId === groupId && !e.isSettled)
        .map(e => e.id);
      await Promise.all(
        groupExpenseIds.map(id => StorageService.updateExpense(id, { isSettled: true, updatedAt: new Date() }))
      );
      setExpenses(prev => prev.map(e => groupExpenseIds.includes(e.id) ? { ...e, isSettled: true, updatedAt: new Date() } : e));
    } catch (error) {
      console.error('Error settling group:', error);
      throw error;
    }
  };

  const settleBetweenUsers = async ({ groupId, fromUserId, toUserId, amount }: { groupId: string; fromUserId: string; toUserId: string; amount: number }) => {
    // Represent a settlement as a zero-net transfer expense in the group
    // fromUser pays 'amount' to toUser, splitting only between them
    try {
      const payerId = fromUserId;
      const payeeId = toUserId;

      const payerName = groups
        .find(g => g.id === groupId)?.members.find(m => m.userId === payerId)?.name
        || user?.name || 'Payer';
      const payeeName = groups
        .find(g => g.id === groupId)?.members.find(m => m.userId === payeeId)?.name
        || 'Payee';

      await addExpense({
        title: 'Settlement',
        amount,
        category: 'other',
        description: `Settlement between ${payerName} and ${payeeName}`,
        paidBy: payerId,
        groupId,
        participants: [
          { userId: payerId, name: payerName, amount: amount, isSettled: true },
          { userId: payeeId, name: payeeName, amount: 0, isSettled: true },
        ],
        splitType: 'custom',
        currency: groups.find(g => g.id === groupId)?.currency || user?.defaultCurrency || 'USD',
        isSettled: true,
      });
    } catch (error) {
      console.error('Error settling between users:', error);
      throw error;
    }
  };

  const addGroup = async (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const group: Group = {
        ...groupData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        currency: groupData.currency || 'USD', // Default to USD if not provided
      };
      
      await StorageService.saveGroup(group);
      setGroups(prev => [...prev, group]);
    } catch (error) {
      console.error('Error adding group:', error);
      throw error;
    }
  };

  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    try {
      const updatedGroup = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await StorageService.updateGroup(groupId, updatedGroup);
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId 
            ? { ...group, ...updatedGroup }
            : group
        )
      );
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      await StorageService.deleteGroup(groupId);
      setGroups(prev => prev.filter(group => group.id !== groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  const addMemberToGroup = async (groupId: string, friendId: string) => {
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');

      const updatedFriendIds = [...(group.friendIds || []), friendId];
      await updateGroup(groupId, { friendIds: updatedFriendIds });
    } catch (error) {
      console.error('Error adding member to group:', error);
      throw error;
    }
  };

  const removeMemberFromGroup = async (groupId: string, friendId: string) => {
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');

      const updatedFriendIds = (group.friendIds || []).filter(id => id !== friendId);
      await updateGroup(groupId, { friendIds: updatedFriendIds });
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  };

  const updateUser = async (userData: User) => {
    try {
      await StorageService.saveUser(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Helper functions
  const getExpensesByGroup = (groupId: string) => {
    return expenses.filter(expense => expense.groupId === groupId);
  };

  const getTotalBalance = () => {
    return balances.reduce((sum, balance) => sum + balance.amount, 0);
  };

  const getRecentExpenses = (limit = 5) => {
    return expenses
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });
    
    return categoryTotals;
  };

  const getGroupExpensesByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    expenses
      .filter(expense => !!expense.groupId)
      .forEach(expense => {
        const category = expense.category;
        categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
      });
    return categoryTotals;
  };

  const getPersonalExpensesByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    expenses
      .filter(expense => !expense.groupId)
      .forEach(expense => {
        const category = expense.category;
        categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
      });
    return categoryTotals;
  };

  const refreshData = async () => {
    await loadData();
  };

  const value: AppContextType = {
    expenses,
    groups,
    user,
    balances,
    groupBalances,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    settleGroup,
    settleBetweenUsers,
    addGroup,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    updateUser,
    getExpensesByGroup,
    getTotalBalance,
    getRecentExpenses,
    getExpensesByCategory,
    getGroupExpensesByCategory,
    getPersonalExpensesByCategory,
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
