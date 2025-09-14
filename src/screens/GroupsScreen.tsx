import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useFriends } from '../contexts/FriendsContext';
import { NavigationProps } from '../types';
import { formatCurrency } from '../utils/currency';
import Card from '../components/Card';

const GroupsScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { groups, groupBalances, refreshData, user } = useApp();
  const { friends } = useFriends();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const formatAmount = (amount: number, currency?: string) => {
    const defaultCurrency = user?.defaultCurrency || 'USD';
    return formatCurrency(Math.abs(amount), currency || defaultCurrency);
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
            Groups
          </Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Groups List */}
        {groups.length > 0 ? (
          groups.map((group) => {
            const groupBalance = groupBalances.find(gb => gb.groupId === group.id);
            return (
              <Card 
                key={group.id} 
                style={styles.groupCard}
                onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
              >
                <View style={styles.groupHeader}>
                  <View style={[styles.groupColorIndicator, { backgroundColor: group.color }]} />
                  <View style={styles.groupInfo}>
                    <Text style={[styles.groupName, { color: theme.colors.text }]}>
                      {group.name}
                    </Text>
                    <Text style={[styles.groupDescription, { color: theme.colors.textSecondary }]}>
                      {group.description || `${(group.friendIds?.length || 0) + 1} members`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </View>
                
                {groupBalance && (
                  <View style={styles.groupBalance}>
                    <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
                      Total: {formatAmount(groupBalance.totalAmount, group.currency)}
                    </Text>
                    
                    {/* Detailed Balances */}
                    <View style={styles.balanceDetails}>
                      {groupBalance.balances.map((balance, index) => {
                        const isOwed = balance.amount < 0;
                        const isOwing = balance.amount > 0;
                        
                        return (
                          <View key={index} style={styles.balanceItem}>
                            <View style={styles.balanceInfo}>
                              <Text style={[styles.balanceName, { color: theme.colors.text }]}>
                                {balance.name}
                              </Text>
                              <View style={styles.balanceStatus}>
                                {isOwed && (
                                  <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
                                    <Text style={[styles.statusText, { color: theme.colors.success }]}>
                                      Owed
                                    </Text>
                                  </View>
                                )}
                                {isOwing && (
                                  <View style={[styles.statusBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                                    <Text style={[styles.statusText, { color: theme.colors.warning }]}>
                                      Owes
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            <Text style={[
                              styles.balanceAmount, 
                              { 
                                color: isOwed ? theme.colors.success : 
                                       isOwing ? theme.colors.warning : theme.colors.textSecondary 
                              }
                            ]}>
                              {isOwed ? '+' : ''}{formatAmount(balance.amount, group.currency)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              No groups yet
            </Text>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              Create a group to start splitting expenses with friends, family, or roommates
            </Text>
            <TouchableOpacity 
              style={[styles.createGroupButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <Text style={styles.createGroupButtonText}>Create Your First Group</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  groupCard: {
    padding: 16,
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
  },
  groupBalance: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceDetails: {
    gap: 8,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  balanceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  balanceStatus: {
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
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
    marginBottom: 24,
  },
  createGroupButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  createGroupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupsScreen;
