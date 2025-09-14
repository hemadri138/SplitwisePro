import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import Card from '../components/Card';

const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { expenses, getExpensesByCategory, refreshData, user } = useApp();
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
    const defaultCurrency = user?.defaultCurrency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: defaultCurrency,
    }).format(amount);
  };

  const totalSpent = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);

  // Chart colors
  const chartColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.error,
    theme.colors.info,
  ];

  // Pie Chart Component
  const PieChart = ({ data, colors }: { data: Array<{x: string, y: number}>, colors: string[] }) => {
    if (data.length === 0) return null;
    
    const size = 200;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 80;
    
    let cumulativePercentage = 0;
    
    const createArcPath = (startAngle: number, endAngle: number, radius: number) => {
      const start = polarToCartesian(centerX, centerY, radius, endAngle);
      const end = polarToCartesian(centerX, centerY, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    };

    return (
      <Svg width={size} height={size}>
        {data.map((item, index) => {
          const percentage = (item.y / totalSpent) * 100;
          const startAngle = cumulativePercentage * 3.6;
          const endAngle = (cumulativePercentage + percentage) * 3.6;
          
          cumulativePercentage += percentage;
          
          return (
            <Path
              key={index}
              d={createArcPath(startAngle, endAngle, radius)}
              fill={colors[index % colors.length]}
              stroke={theme.colors.surface}
              strokeWidth={2}
            />
          );
        })}
      </Svg>
    );
  };

  // Bar Chart Component
  const BarChart = ({ data, colors }: { data: Array<{x: string, y: number}>, colors: string[] }) => {
    if (data.length === 0) return null;
    
    const width = 300;
    const height = 200;
    const padding = 40;
    const barWidth = (width - padding * 2) / data.length - 10;
    const maxValue = Math.max(...data.map(d => d.y));
    
    return (
      <Svg width={width} height={height}>
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.y / maxValue) * (height - padding * 2);
          const x = padding + index * (barWidth + 10);
          const y = height - padding - barHeight;
          
          return (
            <G key={index}>
              <Path
                d={`M ${x} ${height - padding} L ${x + barWidth} ${height - padding} L ${x + barWidth} ${y} L ${x} ${y} Z`}
                fill={colors[index % colors.length]}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - padding + 15}
                fontSize="10"
                fill={theme.colors.text}
                textAnchor="middle"
              >
                {item.x.length > 6 ? item.x.substring(0, 6) : item.x}
              </SvgText>
            </G>
          );
        })}
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const value = maxValue * ratio;
          const y = height - padding - (ratio * (height - padding * 2));
          
          return (
            <SvgText
              key={index}
              x={5}
              y={y + 4}
              fontSize="10"
              fill={theme.colors.textSecondary}
            >
              {formatCurrency(value)}
            </SvgText>
          );
        })}
      </Svg>
    );
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
                  <PieChart data={chartData} colors={chartColors} />
                  {/* Legend */}
                  <View style={styles.legend}>
                    {chartData.map((item, index) => (
                      <View key={index} style={styles.legendItem}>
                        <View 
                          style={[
                            styles.legendColor, 
                            { backgroundColor: chartColors[index % chartColors.length] }
                          ]} 
                        />
                        <Text style={[styles.legendText, { color: theme.colors.text }]}>
                          {item.x}: {formatCurrency(item.y)}
                        </Text>
                      </View>
                    ))}
                  </View>
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
                  <BarChart data={chartData} colors={chartColors} />
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
    marginTop: 10,
  },
  legend: {
    marginTop: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
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