import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useFriends } from '../contexts/FriendsContext';
import { Group, Friend, Currency } from '../types';
import { SUPPORTED_CURRENCIES, getDefaultCurrency } from '../utils/currency';
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
  const [friendsDropdownVisible, setFriendsDropdownVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(getDefaultCurrency());
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
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

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setGroupPhoto(result.assets[0].uri);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setGroupPhoto(result.assets[0].uri);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Group Photo',
      'Choose how you want to add a group photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
        currency: selectedCurrency.code,
        groupPhoto: groupPhoto || undefined,
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
          {/* Group Photo */}
          <View style={styles.photoSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
              Group Photo (Optional)
            </Text>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={showImagePicker}
            >
              {groupPhoto ? (
                <Image source={{ uri: groupPhoto }} style={styles.groupPhoto} />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="camera" size={32} color="white" />
                </View>
              )}
              <View style={[styles.photoOverlay, { backgroundColor: theme.colors.primary + '80' }]}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.photoHint, { color: theme.colors.textSecondary }]}>
              Tap to add group photo
            </Text>
          </View>

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
        </Card>

        <Card style={styles.friendsCard}>
          <View style={styles.friendsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Members</Text>
            <TouchableOpacity onPress={() => setFriendsDropdownVisible(true)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Add Friends</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={[styles.selectedCount, { color: theme.colors.textSecondary }]}>
            {selectedFriends.length} selected
          </Text>

          {/* Selected friends preview */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {selectedFriends.map(id => {
              const f = friends.find(fr => fr.id === id);
              if (!f) return null;
              return (
                <View key={id} style={[styles.participantChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
                  <Text style={{ color: theme.colors.text }}>{f.name}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Friends dropdown modal */}
        <Modal visible={friendsDropdownVisible} transparent animationType="slide" onRequestClose={() => setFriendsDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}> 
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Friends</Text>
                <TouchableOpacity onPress={() => setFriendsDropdownVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              {friends.length > 0 ? (
                <FlatList
                  data={friends}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.currencyItem, { borderBottomColor: '#F3F4F6' }]}
                      onPress={() => {
                        handleFriendToggle(item.id);
                      }}
                    >
                      <Text style={{ color: theme.colors.text }}>{item.name}</Text>
                      {selectedFriends.includes(item.id) && (
                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                  style={styles.currencyList}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>No friends available.</Text>
                </View>
              )}
              <View style={{ padding: 16 }}>
                <Button title="Done" onPress={() => setFriendsDropdownVisible(false)} />
              </View>
            </View>
          </View>
        </Modal>

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
              renderItem={({ item }) => (
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  groupPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: {
    fontSize: 12,
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
  participantChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
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
  currencySection: {
    marginTop: 16,
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

export default GroupCreationScreen;
