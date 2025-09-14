import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useFriends } from '../contexts/FriendsContext';
import { NavigationProps, ExpenseCategory, SplitType, ExpenseSplit, Currency } from '../types';
import { SUPPORTED_CURRENCIES, getDefaultCurrency, formatCurrency } from '../utils/currency';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import * as Haptics from 'expo-haptics';

const AddExpenseScreen: React.FC<NavigationProps> = ({ navigation, route }) => {
  const { theme, settings } = useTheme();
  const { addExpense, updateExpense, groups, user, expenses } = useApp();
  const { friends, getFriendById } = useFriends();
  
  const expenseId = route.params?.expenseId;
  const editMode = route.params?.editMode;
  const existingExpense = editMode && expenseId ? expenses.find(e => e.id === expenseId) : null;
  
  const [title, setTitle] = useState(existingExpense?.title || '');
  const [amount, setAmount] = useState(existingExpense?.amount.toString() || '');
  const [description, setDescription] = useState(existingExpense?.description || '');
  const [category, setCategory] = useState<ExpenseCategory>(existingExpense?.category || 'other');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(existingExpense?.groupId || null);
  const [splitType, setSplitType] = useState<SplitType>(existingExpense?.splitType || 'equal');
  const [participants, setParticipants] = useState<string[]>(
    existingExpense ? existingExpense.participants.map(p => p.userId) : []
  );
  const [customSplits, setCustomSplits] = useState<ExpenseSplit[]>([]);
  const [payer, setPayer] = useState<string>(existingExpense?.paidBy || user?.id || 'current-user');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    existingExpense ? SUPPORTED_CURRENCIES.find(c => c.code === existingExpense.currency) || getDefaultCurrency() : getDefaultCurrency()
  );
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories: { 
    key: ExpenseCategory; 
    label: string; 
    icon: keyof typeof Ionicons.glyphMap | keyof typeof Entypo.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
    iconFamily: 'Ionicons' | 'Entypo' | 'MaterialCommunityIcons';
  }[] = [
    { key: 'food', label: 'Food', icon: 'restaurant', iconFamily: 'Ionicons' },
    { key: 'transport', label: 'Transport', icon: 'car', iconFamily: 'Ionicons' },
    { key: 'entertainment', label: 'Entertainment', icon: 'movie', iconFamily: 'MaterialCommunityIcons' },
    { key: 'shopping', label: 'Shopping', icon: 'shopping-bag', iconFamily: 'Entypo' },
    { key: 'utilities', label: 'Utilities', icon: 'home', iconFamily: 'Ionicons' },
    { key: 'healthcare', label: 'Healthcare', icon: 'medical-bag', iconFamily: 'MaterialCommunityIcons' },
    { key: 'travel', label: 'Travel', icon: 'airplane', iconFamily: 'Ionicons' },
    { key: 'education', label: 'Education', icon: 'school', iconFamily: 'Ionicons' },
    { key: 'other', label: 'Other', icon: 'ellipsis-horizontal', iconFamily: 'Ionicons' },
  ];

  // Get available participants (friends from selected group + current user)
  const getAvailableParticipants = () => {
    if (!selectedGroup) {
      return [{ id: user?.id || 'current-user', name: user?.name || 'You', isFriend: false }];
    }

    const group = groups.find(g => g.id === selectedGroup);
    if (!group) return [];

    const participants = [{ id: user?.id || 'current-user', name: user?.name || 'You', isFriend: false }];
    
    // Check if friendIds exists and is an array before calling forEach
    if (group.friendIds && Array.isArray(group.friendIds)) {
      group.friendIds.forEach(friendId => {
        const friend = getFriendById(friendId);
        if (friend) {
          participants.push({ id: friendId, name: friend.name, isFriend: true });
        }
      });
    }

    return participants;
  };

  // Calculate split amounts
  const calculateSplitAmounts = (totalAmount: number, participantIds: string[]) => {
    if (splitType === 'equal') {
      const amountPerPerson = totalAmount / participantIds.length;
      return participantIds.map(id => ({ participantId: id, amount: amountPerPerson }));
    } else if (splitType === 'custom') {
      return customSplits.filter(split => participantIds.includes(split.participantId));
    }
    return [];
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the expense');
      return;
    }
    
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (selectedGroup && participants.length === 0) {
      Alert.alert('Error', 'Please select at least one participant');
      return;
    }

    if (splitType === 'custom') {
      const totalCustomAmount = customSplits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalCustomAmount - Number(amount)) > 0.01) {
        Alert.alert('Error', 'Custom split amounts must equal the total expense amount');
        return;
      }
    }

    try {
      setIsLoading(true);
      
      const expenseAmount = Number(amount);
      const availableParticipants = getAvailableParticipants();
      const selectedParticipantIds = selectedGroup ? participants : [user?.id || 'current-user'];
      
      const splitAmounts = calculateSplitAmounts(expenseAmount, selectedParticipantIds);
      
      const expenseParticipants = splitAmounts.map(split => {
        const participant = availableParticipants.find(p => p.id === split.participantId);
            return {
          userId: split.participantId,
          name: participant?.name || 'Unknown',
          amount: split.amount,
              isSettled: false,
            };
      });

      if (editMode && existingExpense) {
        await updateExpense(expenseId, {
          title: title.trim(),
          amount: expenseAmount,
          category,
          description: description.trim() || undefined,
          paidBy: payer,
          groupId: selectedGroup || undefined,
          participants: expenseParticipants,
          splitType,
          currency: selectedCurrency.code,
        });
      } else {
        await addExpense({
          title: title.trim(),
          amount: expenseAmount,
          category,
          description: description.trim() || undefined,
          paidBy: payer,
          groupId: selectedGroup || undefined,
          participants: expenseParticipants,
          splitType,
          currency: selectedCurrency.code,
          isSettled: false,
        });
      }

      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const successMessage = editMode ? 'Expense updated successfully!' : 'Expense added successfully!';
      Alert.alert('Success', successMessage, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
      console.error('Error adding expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParticipant = (userId: string) => {
    setParticipants(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {editMode ? 'Edit Expense' : 'Add New Expense'}
            </Text>
          </View>

          {/* Basic Info */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Expense Details
            </Text>
            
            <Input
              label="Title"
              placeholder="Enter expense title"
              value={title}
              onChangeText={setTitle}
              leftIcon="receipt"
            />
            
            <Input
              label="Amount"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              leftIcon="cash"
            />

            {/* Currency Selection */}
            <View style={styles.currencySection}>
              <Text style={[styles.currencyLabel, { color: theme.colors.text }]}>
                Currency
              </Text>
              <TouchableOpacity
                style={[styles.currencySelector, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border 
                }]}
                onPress={() => setShowCurrencyModal(true)}
              >
                <View style={styles.currencyInfo}>
                  <Text style={[styles.currencySymbol, { color: theme.colors.primary }]}>
                    {selectedCurrency.symbol}
                  </Text>
                  <View style={styles.currencyDetails}>
                    <Text style={[styles.currencyCode, { color: theme.colors.text }]}>
                      {selectedCurrency.code}
                    </Text>
                    <Text style={[styles.currencyName, { color: theme.colors.textSecondary }]}>
                      {selectedCurrency.name}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Input
              label="Description (Optional)"
              placeholder="Add a note"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              leftIcon="document-text"
            />
          </Card>

          {/* Category Selection */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Category
            </Text>
            
            <View style={styles.categoryGrid}>
              {categories.map((cat) => {
                const IconComponent = cat.iconFamily === 'Ionicons' ? Ionicons : 
                                    cat.iconFamily === 'Entypo' ? Entypo : 
                                    MaterialCommunityIcons;
                
                return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryItem,
                    { 
                      backgroundColor: category === cat.key ? theme.colors.primary : theme.colors.surface,
                      borderColor: category === cat.key ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => setCategory(cat.key)}
                >
                    <IconComponent 
                      name={cat.icon as any} 
                    size={24} 
                    color={category === cat.key ? 'white' : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.categoryLabel,
                    { color: category === cat.key ? 'white' : theme.colors.text }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Group Selection */}
          {groups.length > 0 && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Group (Optional)
              </Text>
              
              <View style={styles.groupList}>
                <TouchableOpacity
                  style={[
                    styles.groupItem,
                    { 
                      backgroundColor: selectedGroup === null ? theme.colors.primary : theme.colors.surface,
                      borderColor: selectedGroup === null ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => setSelectedGroup(null)}
                >
                  <Text style={[
                    styles.groupLabel,
                    { color: selectedGroup === null ? 'white' : theme.colors.text }
                  ]}>
                    Personal Expense
                  </Text>
                </TouchableOpacity>
                
                {groups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.groupItem,
                      { 
                        backgroundColor: selectedGroup === group.id ? theme.colors.primary : theme.colors.surface,
                        borderColor: selectedGroup === group.id ? theme.colors.primary : theme.colors.border,
                      }
                    ]}
                    onPress={() => setSelectedGroup(group.id)}
                  >
                    <Text style={[
                      styles.groupLabel,
                      { color: selectedGroup === group.id ? 'white' : theme.colors.text }
                    ]}>
                      {group.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Participants Selection */}
          {selectedGroup && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Participants
              </Text>
              
              <View style={styles.participantsList}>
                {getAvailableParticipants().map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    style={[
                      styles.participantItem,
                      { 
                        backgroundColor: participants.includes(participant.id) ? theme.colors.primary : theme.colors.surface,
                        borderColor: participants.includes(participant.id) ? theme.colors.primary : theme.colors.border,
                      }
                    ]}
                    onPress={() => toggleParticipant(participant.id)}
                  >
                    <Text style={[
                      styles.participantLabel,
                      { color: participants.includes(participant.id) ? 'white' : theme.colors.text }
                    ]}>
                      {participant.name}
                    </Text>
                    {participants.includes(participant.id) && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Split Type Selection */}
          {selectedGroup && participants.length > 0 && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Split Type
              </Text>
              
              <View style={styles.splitTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.splitTypeButton,
                    { 
                      backgroundColor: splitType === 'equal' ? theme.colors.primary : theme.colors.surface,
                      borderColor: splitType === 'equal' ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => setSplitType('equal')}
                >
                  <Ionicons 
                    name="calculator" 
                    size={20} 
                    color={splitType === 'equal' ? 'white' : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.splitTypeLabel,
                    { color: splitType === 'equal' ? 'white' : theme.colors.text }
                  ]}>
                    Equal Split
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.splitTypeButton,
                    { 
                      backgroundColor: splitType === 'custom' ? theme.colors.primary : theme.colors.surface,
                      borderColor: splitType === 'custom' ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => setSplitType('custom')}
                >
                  <Ionicons 
                    name="create" 
                    size={20} 
                    color={splitType === 'custom' ? 'white' : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.splitTypeLabel,
                    { color: splitType === 'custom' ? 'white' : theme.colors.text }
                  ]}>
                    Custom Split
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Payer Selection */}
          {selectedGroup && participants.length > 0 && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Who Paid?
              </Text>
              
              <View style={styles.payerList}>
                {getAvailableParticipants().map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    style={[
                      styles.payerItem,
                      { 
                        backgroundColor: payer === participant.id ? theme.colors.primary : theme.colors.surface,
                        borderColor: payer === participant.id ? theme.colors.primary : theme.colors.border,
                      }
                    ]}
                    onPress={() => setPayer(participant.id)}
                  >
                    <Text style={[
                      styles.payerLabel,
                      { color: payer === participant.id ? 'white' : theme.colors.text }
                    ]}>
                      {participant.name}
                    </Text>
                    {payer === participant.id && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.button}
            />
            <Button
              title={editMode ? 'Update Expense' : 'Save Expense'}
              onPress={handleSave}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select Currency
              </Text>
              <TouchableOpacity
                onPress={() => setShowCurrencyModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={SUPPORTED_CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }: { item: Currency }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyItem,
                    { 
                      backgroundColor: selectedCurrency.code === item.code 
                        ? theme.colors.primary + '20' 
                        : 'transparent',
                      borderColor: theme.colors.border 
                    }
                  ]}
                  onPress={() => {
                    setSelectedCurrency(item);
                    setShowCurrencyModal(false);
                    if (settings.hapticFeedback) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                >
                  <View style={styles.currencyItemInfo}>
                    <Text style={[styles.currencyItemSymbol, { color: theme.colors.primary }]}>
                      {item.symbol}
                    </Text>
                    <View style={styles.currencyItemDetails}>
                      <Text style={[styles.currencyItemCode, { color: theme.colors.text }]}>
                        {item.code}
                      </Text>
                      <Text style={[styles.currencyItemName, { color: theme.colors.textSecondary }]}>
                        {item.name}
                      </Text>
                    </View>
                  </View>
                  {selectedCurrency.code === item.code && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.currencyList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  groupList: {
    gap: 8,
  },
  groupItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  groupLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  participantLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  splitTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  splitTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  splitTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  payerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  payerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  payerLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
  },
  currencySection: {
    marginBottom: 16,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 12,
    minWidth: 30,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 14,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  currencyItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyItemSymbol: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    minWidth: 30,
  },
  currencyItemDetails: {
    flex: 1,
  },
  currencyItemCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyItemName: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default AddExpenseScreen;
