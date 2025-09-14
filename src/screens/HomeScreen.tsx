import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { NavigationProps } from '../types';
import FloatingActionButton from '../components/FloatingActionButton';
import Card from '../components/Card';

const HomeScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { 
    expenses, 
    groups, 
    balances, 
    getTotalBalance, 
    getRecentExpenses, 
    getExpensesByCategory,
    refreshData,
    isLoading 
  } = useApp();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const totalBalance = getTotalBalance();
  const recentExpenses = getRecentExpenses(5);
  const categoryTotals = getExpensesByCategory();
  const totalThisMonth = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              Good morning!
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Splitwise Pro
            </Text>
          </View>
          <TouchableOpacity style={[styles.notificationButton, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <Card style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {formatCurrency(totalBalance)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Balance</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.accent }]}>{groups.length}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Active Groups</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {formatCurrency(totalThisMonth)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>This Month</Text>
          </View>
        </Card>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Expenses
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => (
              <Card 
                key={expense.id} 
                style={styles.expenseCard}
                onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
              >
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseInfo}>
                    <Text style={[styles.expenseTitle, { color: theme.colors.text }]}>
                      {expense.title}
                    </Text>
                    <Text style={[styles.expenseCategory, { color: theme.colors.textSecondary }]}>
                      {expense.category}
                    </Text>
                  </View>
                  <Text style={[styles.expenseAmount, { color: theme.colors.primary }]}>
                    {formatCurrency(expense.amount)}
                  </Text>
                </View>
                <Text style={[styles.expenseDate, { color: theme.colors.textSecondary }]}>
                  {new Date(expense.createdAt).toLocaleDateString()}
                </Text>
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('AddExpense')}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.quickActionText}>Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: theme.colors.secondary }]}
              onPress={() => navigation.navigate('Groups')}
            >
              <Ionicons name="people" size={24} color="white" />
              <Text style={styles.quickActionText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          {
            icon: 'receipt',
            label: 'Add Expense',
            onPress: () => navigation.navigate('AddExpense'),
            color: theme.colors.primary,
          },
          {
            icon: 'people',
            label: 'Create Group',
            onPress: () => navigation.navigate('Groups'),
            color: theme.colors.secondary,
          },
          {
            icon: 'camera',
            label: 'Scan Receipt',
            onPress: () => {/* TODO: Implement receipt scanning */},
            color: theme.colors.accent,
          },
        ]}
        mainIcon="add"
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '400',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
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
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseDate: {
    fontSize: 12,
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
