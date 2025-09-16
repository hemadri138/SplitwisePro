import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useFriends } from '../contexts/FriendsContext';
import { Friend } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import * as Haptics from 'expo-haptics';

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFriend: (friend: Omit<Friend, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ visible, onClose, onAddFriend }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    onAddFriend({
      name: name.trim(),
      email: email.trim() || undefined,
    });

    setName('');
    setEmail('');
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
      <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
          Add New Friend
        </Text>
        
        <Input
          label="Name"
          placeholder="Enter friend's name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        
        <Input
          label="Email (Optional)"
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
        
        <View style={styles.modalButtons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.modalButton}
          />
          <Button
            title="Add Friend"
            onPress={handleSubmit}
            style={styles.modalButton}
          />
        </View>
      </View>
    </View>
  );
};

interface FriendItemProps {
  friend: Friend;
  onEdit: (friend: Friend) => void;
  onDelete: (friendId: string) => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onEdit, onDelete }) => {
  const { theme } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      'Delete Friend',
      `Are you sure you want to delete ${friend.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(friend.id),
        },
      ]
    );
  };

  return (
    <Card style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          {friend.avatarUrl ? (
            <Text style={[styles.avatarText, { color: theme.colors.surface }]}>
              {friend.name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person" size={24} color={theme.colors.surface} />
          )}
        </View>
        
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: theme.colors.text }]}>
            {friend.name}
          </Text>
          {friend.email && (
            <Text style={[styles.friendEmail, { color: theme.colors.textSecondary }]}>
              {friend.email}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.friendActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onEdit(friend)}
        >
          <Ionicons name="pencil" size={16} color={theme.colors.surface} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={16} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const FriendsScreen: React.FC = () => {
  const { theme, settings } = useTheme();
  const { friends, isLoading, addFriend, updateFriend, deleteFriend, refreshFriends } = useFriends();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFriends();
    setRefreshing(false);
  };

  const handleAddFriend = async (friendData: Omit<Friend, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addFriend(friendData);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add friend');
    }
  };

  const handleUpdateFriend = async (friendId: string, updates: Partial<Friend>) => {
    try {
      await updateFriend(friendId, updates);
      setEditingFriend(null);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update friend');
    }
  };

  const handleDeleteFriend = async (friendId: string) => {
    try {
      await deleteFriend(friendId);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete friend');
    }
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <FriendItem
      friend={item}
      onEdit={setEditingFriend}
      onDelete={handleDeleteFriend}
    />
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
        No friends yet
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
        Add friends to start splitting expenses and creating groups
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top','left','right']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Friends
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <AddFriendModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddFriend={handleAddFriend}
      />

      <AddFriendModal
        visible={editingFriend !== null}
        onClose={() => setEditingFriend(null)}
        onAddFriend={(friendData) => {
          if (editingFriend) {
            handleUpdateFriend(editingFriend.id, friendData);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 14,
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});

export default FriendsScreen;
