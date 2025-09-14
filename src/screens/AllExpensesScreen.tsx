import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { NavigationProps } from '../types';
import { formatCurrency } from '../utils/currency';
import Card from '../components/Card';

const AllExpensesScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { 
    expenses, 
    user,
    getRecentExpenses,
    refreshData,
  } = useApp();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const allExpenses = getRecentExpenses(); // Get all expenses

  const formatAmount = (amount: number, currency?: string) => {
    const defaultCurrency = user?.defaultCurrency || 'USD';
    return formatCurrency(Math.abs(amount), currency || defaultCurrency);
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
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

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      food: '#FF6B6B',
      transport: '#4ECDC4',
      entertainment: '#45B7D1',
      shopping: '#96CEB4',
      utilities: '#FFEAA7',
      healthcare: '#DDA0DD',
      travel: '#98D8C8',
      education: '#F7DC6F',
      other: '#BB8FCE',
    };
    return categoryColors[category] || theme.colors.primary;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          All Expenses
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Total Expenses
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {allExpenses.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Total Amount
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {formatAmount(allExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </Text>
          </View>
        </Card>

        {/* Expenses List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Expenses ({allExpenses.length})
          </Text>
          
          {allExpenses.length > 0 ? (
            allExpenses.map((expense) => (
              <Card 
                key={expense.id} 
                style={styles.expenseCard}
                onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
              >
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseInfo}>
                    <View style={styles.expenseTitleRow}>
                      <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(expense.category) }]}>
                        <Ionicons 
                          name={getCategoryIcon(expense.category)} 
                          size={20} 
                          color="white" 
                        />
                      </View>
                      <View style={styles.expenseDetails}>
                        <Text style={[styles.expenseTitle, { color: theme.colors.text }]}>
                          {expense.title}
                        </Text>
                        <Text style={[styles.expenseCategory, { color: theme.colors.textSecondary }]}>
                          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                        </Text>
                      </View>
                    </View>
                    {expense.description && (
                      <Text style={[styles.expenseDescription, { color: theme.colors.textSecondary }]}>
                        {expense.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.expenseAmountContainer}>
                    <Text style={[styles.expenseAmount, { color: theme.colors.primary }]}>
                      {formatAmount(expense.amount, expense.currency)}
                    </Text>
                    <Text style={[styles.expenseDate, { color: theme.colors.textSecondary }]}>
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                {/* Participants */}
                {expense.participants.length > 0 && (
                  <View style={styles.participantsContainer}>
                    <Text style={[styles.participantsLabel, { color: theme.colors.textSecondary }]}>
                      Participants:
                    </Text>
                    <View style={styles.participantsList}>
                      {expense.participants.slice(0, 3).map((participant, index) => (
                        <View key={index} style={[styles.participantChip, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[styles.participantName, { color: theme.colors.text }]}>
                            {participant.name}
                          </Text>
                        </View>
                      ))}
                      {expense.participants.length > 3 && (
                        <View style={[styles.participantChip, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[styles.participantName, { color: theme.colors.textSecondary }]}>
                            +{expense.participants.length - 3} more
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </Card>
            ))
          ) : (
            <Card style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No expenses yet
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                Add your first expense to get started
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  expenseCard: {
    padding: 16,
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  expenseDescription: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
  },
  participantsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  participantsLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  participantChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantName: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AllExpensesScreen;
