import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { NavigationProps } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import * as Haptics from 'expo-haptics';

const ExpenseDetailScreen: React.FC<NavigationProps> = ({ navigation, route }) => {
  const { theme, settings } = useTheme();
  const { expenses, deleteExpense, groups, user } = useApp();
  
  const expenseId = route.params?.expenseId;
  const expense = expenses.find(e => e.id === expenseId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
      food: 'restaurant',
      transport: 'car',
      entertainment: 'film',
      shopping: 'bag',
      utilities: 'home',
      healthcare: 'medical',
      travel: 'airplane',
      education: 'school',
      other: 'ellipsis-horizontal',
    };
    return categoryIcons[category] || 'receipt';
  };

  const handleEdit = () => {
    navigation.navigate('AddExpense', { 
      expenseId: expenseId,
      editMode: true 
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
              if (settings.hapticFeedback) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              }
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  if (!expense) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Expense not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const group = expense.groupId ? groups.find(g => g.id === expense.groupId) : null;
  const paidByUser = expense.paidBy === user?.id || expense.paidBy === 'current-user';

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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Expense Details
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleEdit}
            >
              <Ionicons name="pencil" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expense Info */}
        <Card style={styles.expenseCard}>
          <View style={styles.expenseHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons 
                name={getCategoryIcon(expense.category)} 
                size={24} 
                color="white" 
              />
            </View>
            <View style={styles.expenseInfo}>
              <Text style={[styles.expenseTitle, { color: theme.colors.text }]}>
                {expense.title}
              </Text>
              <Text style={[styles.expenseAmount, { color: theme.colors.primary }]}>
                {formatCurrency(expense.amount)}
              </Text>
            </View>
          </View>
          
          {expense.description && (
            <Text style={[styles.expenseDescription, { color: theme.colors.textSecondary }]}>
              {expense.description}
            </Text>
          )}
          
          <View style={styles.expenseMeta}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
                Category
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
              </Text>
            </View>
            
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
                Paid by
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                {paidByUser ? 'You' : expense.participants.find(p => p.userId === expense.paidBy)?.name || 'Unknown'}
              </Text>
            </View>
            
            {group && (
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
                  Group
                </Text>
                <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                  {group.name}
                </Text>
              </View>
            )}
            
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
                Date
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                {new Date(expense.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Participants */}
        <Card style={styles.participantsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Split Details
          </Text>
          <View style={styles.participantsList}>
            {expense.participants.map((participant) => (
              <View key={participant.userId} style={styles.participantItem}>
                <View style={styles.participantInfo}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.surface }]}>
                      {participant.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.participantName, { color: theme.colors.text }]}>
                    {participant.name}
                  </Text>
                </View>
                <View style={styles.participantAmount}>
                  <Text style={[styles.amountText, { color: theme.colors.text }]}>
                    {formatCurrency(participant.amount)}
                  </Text>
                  {participant.isSettled && (
                    <View style={[styles.settledBadge, { backgroundColor: theme.colors.success }]}>
                      <Text style={styles.settledText}>Settled</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
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
  expenseCard: {
    padding: 20,
    marginBottom: 16,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  expenseDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  expenseMeta: {
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  participantsCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  participantsList: {
    gap: 12,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantInfo: {
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
  participantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  participantAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  settledText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ExpenseDetailScreen;
