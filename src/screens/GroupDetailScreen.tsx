import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useFriends } from '../contexts/FriendsContext';
import { NavigationProps } from '../types';
import { formatCurrency } from '../utils/currency';
import Card from '../components/Card';
import Button from '../components/Button';

const GroupDetailScreen: React.FC<NavigationProps> = ({ navigation, route }) => {
  const { theme, settings } = useTheme();
  const { groups, groupBalances, getExpensesByGroup, user, addMemberToGroup, removeMemberFromGroup } = useApp();
  const { friends, getFriendById } = useFriends();
  
  const groupId = route.params?.groupId;
  const group = groups.find(g => g.id === groupId);
  const groupBalance = groupBalances.find(gb => gb.groupId === groupId);
  const groupExpenses = getExpensesByGroup(groupId);

  const formatAmount = (amount: number, currency: string = 'USD') => {
    return formatCurrency(Math.abs(amount), currency);
  };

  const getBalanceColor = (amount: number) => {
    if (amount > 0) return theme.colors.error; // Owed money (red)
    if (amount < 0) return theme.colors.success; // Owed to them (green)
    return theme.colors.textSecondary; // Even (gray)
  };

  const getBalanceText = (amount: number, name: string) => {
    const currency = group?.currency || 'USD';
    if (amount > 0) return `${name} owes ${formatAmount(amount, currency)}`;
    if (amount < 0) return `${name} is owed ${formatAmount(Math.abs(amount), currency)}`;
    return `${name} is settled up`;
  };

  const getGroupMembers = () => {
    if (!group) return [];
    
    const members = [{ id: user?.id || 'current-user', name: user?.name || 'You', isFriend: false }];
    
    // Check if friendIds exists and is an array before calling forEach
    if (group.friendIds && Array.isArray(group.friendIds)) {
      group.friendIds.forEach(friendId => {
        const friend = getFriendById(friendId);
        if (friend) {
          members.push({ id: friendId, name: friend.name, isFriend: true });
        }
      });
    }

    return members;
  };

  const getAvailableFriendsToAdd = () => {
    if (!group) return [];
    const currentFriendIds = group.friendIds || [];
    return friends.filter(friend => !currentFriendIds.includes(friend.id));
  };

  const handleAddMember = async (friendId: string) => {
    try {
      await addMemberToGroup(groupId, friendId);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add member to group');
    }
  };

  const handleRemoveMember = async (friendId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMemberFromGroup(groupId, friendId);
              if (settings.hapticFeedback) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member from group');
            }
          },
        },
      ]
    );
  };

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Group not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const members = getGroupMembers();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={[styles.groupColorIndicator, { backgroundColor: group.color }]} />
            <Text style={[styles.groupName, { color: theme.colors.text }]}>
              {group.name}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddExpense', { groupId: group.id })}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Group Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Members
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {members.length}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Total Expenses
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {groupExpenses.length}
            </Text>
          </View>
          {group.description && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Description
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {group.description}
              </Text>
            </View>
          )}
        </Card>

        {/* Balance Summary */}
        {groupBalance && groupBalance.balances.length > 0 && (
          <Card style={styles.balanceCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Balance Summary
            </Text>
            <View style={styles.balanceList}>
              {groupBalance.balances.map((balance) => (
                <View key={balance.userId} style={styles.balanceItem}>
                  <View style={styles.balanceInfo}>
                    <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.avatarText, { color: theme.colors.surface }]}>
                        {balance.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.balanceName, { color: theme.colors.text }]}>
                      {balance.name}
                    </Text>
                  </View>
                  <Text style={[styles.balanceAmount, { color: getBalanceColor(balance.amount) }]}>
                    {getBalanceText(balance.amount, balance.name)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Members List */}
        <Card style={styles.membersCard}>
          <View style={styles.membersHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Members
            </Text>
            <TouchableOpacity
              style={[styles.addMemberButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                // Show available friends to add
                const availableFriends = getAvailableFriendsToAdd();
                if (availableFriends.length === 0) {
                  Alert.alert('No Friends Available', 'All your friends are already in this group.');
                  return;
                }
                // For now, we'll add the first available friend
                // In a full implementation, you'd show a modal to select
                handleAddMember(availableFriends[0].id);
              }}
            >
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.membersList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.surface }]}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.memberName, { color: theme.colors.text }]}>
                    {member.name}
                  </Text>
                  {member.isFriend && (
                    <Ionicons name="person" size={16} color={theme.colors.textSecondary} />
                  )}
                </View>
                {member.isFriend && (
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
                    onPress={() => handleRemoveMember(member.id)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </Card>

        {/* Recent Expenses */}
        <Card style={styles.expensesCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Expenses
          </Text>
          {groupExpenses.length > 0 ? (
            <View style={styles.expensesList}>
              {groupExpenses.slice(0, 5).map((expense) => (
                <TouchableOpacity 
                  key={expense.id} 
                  style={styles.expenseItem}
                  onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
                >
                  <View style={styles.expenseInfo}>
                    <Text style={[styles.expenseTitle, { color: theme.colors.text }]}>
                      {expense.title}
                    </Text>
                    <Text style={[styles.expenseDate, { color: theme.colors.textSecondary }]}>
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.expenseAmount, { color: theme.colors.primary }]}>
                    {formatAmount(expense.amount, expense.currency)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No expenses yet
        </Text>
      </View>
          )}
        </Card>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  groupColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  balanceCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  balanceList: {
    gap: 12,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
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
  balanceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  membersCard: {
    padding: 16,
    marginBottom: 16,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMemberButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expensesCard: {
    padding: 16,
    marginBottom: 16,
  },
  expensesList: {
    gap: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 14,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
  },
});

export default GroupDetailScreen;
