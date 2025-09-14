import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useFriends } from '../contexts/FriendsContext';
import { Group, Friend } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import * as Haptics from 'expo-haptics';

interface FriendSelectionItemProps {
  friend: Friend;
  isSelected: boolean;
  onToggle: (friendId: string) => void;
}

const FriendSelectionItem: React.FC<FriendSelectionItemProps> = ({ friend, isSelected, onToggle }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.friendItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        }
      ]}
      onPress={() => onToggle(friend.id)}
    >
      <View style={styles.friendInfo}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          {friend.avatarUrl ? (
            <Text style={[styles.avatarText, { color: theme.colors.surface }]}>
              {friend.name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person" size={20} color={theme.colors.surface} />
          )}
        </View>
        
        <Text style={[styles.friendName, { color: theme.colors.text }]}>
          {friend.name}
        </Text>
      </View>
      
      <View style={[
        styles.checkbox,
        {
          backgroundColor: isSelected ? theme.colors.primary : 'transparent',
          borderColor: theme.colors.primary,
        }
      ]}>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={theme.colors.surface} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const GroupCreationScreen: React.FC = ({ navigation }: any) => {
  const { theme, settings } = useTheme();
  const { addGroup } = useApp();
  const { friends } = useFriends();
  
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
    
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend');
      return;
    }

    try {
      setIsLoading(true);
      
      const groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'> = {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        members: [], // Will be populated with actual user data
        friendIds: selectedFriends || [], // Ensure it's always an array
        color: getRandomColor(),
      };

      await addGroup(groupData);
      
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#14B8A6', '#6366F1', '#F97316', '#10B981', 
      '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <FriendSelectionItem
      friend={item}
      isSelected={selectedFriends.includes(item.id)}
      onToggle={handleFriendToggle}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Create New Group
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Group Name"
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
            style={styles.input}
          />
          
          <Input
            label="Description (Optional)"
            placeholder="Enter group description"
            value={groupDescription}
            onChangeText={setGroupDescription}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </Card>

        <Card style={styles.friendsCard}>
          <View style={styles.friendsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Select Friends
            </Text>
            <Text style={[styles.selectedCount, { color: theme.colors.textSecondary }]}>
              {selectedFriends.length} selected
            </Text>
          </View>

          {friends.length > 0 ? (
            <FlatList
              data={friends}
              renderItem={renderFriend}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              style={styles.friendsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No friends available. Add friends first to create a group.
              </Text>
            </View>
          )}
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Create Group"
            onPress={handleCreateGroup}
            loading={isLoading}
            disabled={!groupName.trim() || selectedFriends.length === 0}
            style={styles.createButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  formCard: {
    padding: 20,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  friendsCard: {
    padding: 20,
    marginBottom: 24,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 14,
  },
  friendsList: {
    maxHeight: 300,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: 32,
  },
  createButton: {
    marginBottom: 16,
  },
});

export default GroupCreationScreen;
