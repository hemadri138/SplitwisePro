import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Friend } from '../types';
import StorageService from '../services/StorageService';

interface FriendsContextType {
  friends: Friend[];
  isLoading: boolean;
  addFriend: (friend: Omit<Friend, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFriend: (friendId: string, updates: Partial<Friend>) => Promise<void>;
  deleteFriend: (friendId: string) => Promise<void>;
  getFriendById: (friendId: string) => Friend | undefined;
  refreshFriends: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

interface FriendsProviderProps {
  children: ReactNode;
}

export const FriendsProvider: React.FC<FriendsProviderProps> = ({ children }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load friends on mount
  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const friendsData = await StorageService.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFriend = async (friendData: Omit<Friend, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const friend: Friend = {
        ...friendData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await StorageService.saveFriend(friend);
      setFriends(prev => [...prev, friend]);
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  };

  const updateFriend = async (friendId: string, updates: Partial<Friend>) => {
    try {
      const updatedFriend = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await StorageService.updateFriend(friendId, updatedFriend);
      setFriends(prev => 
        prev.map(friend => 
          friend.id === friendId 
            ? { ...friend, ...updatedFriend }
            : friend
        )
      );
    } catch (error) {
      console.error('Error updating friend:', error);
      throw error;
    }
  };

  const deleteFriend = async (friendId: string) => {
    try {
      await StorageService.deleteFriend(friendId);
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Error deleting friend:', error);
      throw error;
    }
  };

  const getFriendById = (friendId: string) => {
    return friends.find(friend => friend.id === friendId);
  };

  const refreshFriends = async () => {
    await loadFriends();
  };

  const value: FriendsContextType = {
    friends,
    isLoading,
    addFriend,
    updateFriend,
    deleteFriend,
    getFriendById,
    refreshFriends,
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = (): FriendsContextType => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
