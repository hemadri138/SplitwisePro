import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  VictoryPie, 
  VictoryChart, 
  VictoryBar as VictoryBarChart, 
  VictoryAxis 
} from 'victory-native';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import Card from '../components/Card';

const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { expenses, getExpensesByCategory, refreshData } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const categoryData = getExpensesByCategory();
  const chartData = Object.entries(categoryData).map(([category, amount]) => ({
    x: category.charAt(0).toUpperCase() + category.slice(1),
    y: amount,
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalSpent = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);

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
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Analytics
          </Text>
        </View>

        {expenses.length > 0 ? (
          <>
            {/* Total Spent */}
            <Card style={styles.totalCard}>
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
                Total Spent
              </Text>
              <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
                {formatCurrency(totalSpent)}
              </Text>
            </Card>

            {/* Category Breakdown */}
            <Card style={styles.chartCard}>
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                Spending by Category
              </Text>
              {chartData.length > 0 && (
                <View style={styles.chartContainer}>
                  <VictoryPie
                    data={chartData}
                    width={300}
                    height={300}
                    colorScale={[
                      theme.colors.primary,
                      theme.colors.secondary,
                      theme.colors.accent,
                      theme.colors.success,
                      theme.colors.warning,
                      theme.colors.error,
                      theme.colors.info,
                    ]}
                    innerRadius={50}
                    labelRadius={100}
                    style={{
                      labels: {
                        fill: theme.colors.text,
                        fontSize: 12,
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </View>
              )}
            </Card>

            {/* Bar Chart */}
            <Card style={styles.chartCard}>
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                Category Comparison
              </Text>
              {chartData.length > 0 && (
                <View style={styles.chartContainer}>
                  <VictoryChart
                    domainPadding={20}
                    width={350}
                    height={250}
                  >
                    <VictoryAxis
                      style={{
                        axis: { stroke: theme.colors.border },
                        tickLabels: { fill: theme.colors.text, fontSize: 10 },
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      style={{
                        axis: { stroke: theme.colors.border },
                        tickLabels: { fill: theme.colors.text, fontSize: 10 },
                      }}
                    />
                    <VictoryBarChart
                      data={chartData}
                      style={{
                        data: { fill: theme.colors.primary },
                      }}
                    />
                  </VictoryChart>
                </View>
              )}
            </Card>

            {/* Category List */}
            <Card style={styles.categoryListCard}>
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                Category Details
              </Text>
              {Object.entries(categoryData).map(([category, amount]) => (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <Text style={[styles.categoryAmount, { color: theme.colors.textSecondary }]}>
                      {formatCurrency(amount)}
                    </Text>
                  </View>
                  <View style={styles.categoryBar}>
                    <View 
                      style={[
                        styles.categoryBarFill, 
                        { 
                          backgroundColor: theme.colors.primary,
                          width: `${(amount / totalSpent) * 100}%`,
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </Card>
          </>
        ) : (
          <Card style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              No data yet
            </Text>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              Start adding expenses to see your spending patterns and insights
            </Text>
          </Card>
        )}
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
  totalCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  categoryListCard: {
    padding: 16,
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
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
});

export default AnalyticsScreen;