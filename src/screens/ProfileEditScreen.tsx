import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { User, Currency } from '../types';
import { SUPPORTED_CURRENCIES, getCurrencyByCode } from '../utils/currency';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import * as Haptics from 'expo-haptics';

interface ProfileEditScreenProps {
  navigation: any;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ navigation }) => {
  const { theme, settings } = useTheme();
  const { user, updateUser } = useApp();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency | null>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || null);
      
      // Set default currency
      if (user.defaultCurrency) {
        const currency = getCurrencyByCode(user.defaultCurrency);
        if (currency) {
          setDefaultCurrency(currency);
        }
      }
    }
  }, [user]);

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
      setAvatar(result.assets[0].uri);
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
      setAvatar(result.assets[0].uri);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      setIsLoading(true);
      
      const updatedUser: User = {
        ...user!,
        name: name.trim(),
        email: email.trim(),
        avatar: avatar || undefined,
        defaultCurrency: defaultCurrency?.code || undefined,
      };

      await updateUser(updatedUser);
      
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Edit Profile
          </Text>
          <View style={styles.placeholder} />
        </View>

        <Card style={styles.formCard}>
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
              Profile Photo
            </Text>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={showImagePicker}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.photo} />
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
              Tap to change photo
            </Text>
          </View>

          <Input
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          {/* Default Currency Selection */}
          <View style={styles.currencySection}>
            <Text style={[styles.currencyLabel, { color: theme.colors.text }]}>
              Default Currency
            </Text>
            <TouchableOpacity
              style={[styles.currencySelector, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border 
              }]}
              onPress={() => setShowCurrencyModal(true)}
            >
              <View style={styles.currencyInfo}>
                {defaultCurrency ? (
                  <>
                    <Text style={[styles.currencySymbol, { color: theme.colors.primary }]}>
                      {defaultCurrency.symbol}
                    </Text>
                    <View style={styles.currencyDetails}>
                      <Text style={[styles.currencyCode, { color: theme.colors.text }]}>
                        {defaultCurrency.code}
                      </Text>
                      <Text style={[styles.currencyName, { color: theme.colors.textSecondary }]}>
                        {defaultCurrency.name}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text style={[styles.currencyPlaceholder, { color: theme.colors.textSecondary }]}>
                    Select default currency
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            disabled={!name.trim() || !email.trim()}
            style={styles.saveButton}
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
                Select Default Currency
              </Text>
              <TouchableOpacity
                onPress={() => setShowCurrencyModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.currencyList}>
              {SUPPORTED_CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyItem,
                    { 
                      backgroundColor: defaultCurrency?.code === currency.code 
                        ? theme.colors.primary + '20' 
                        : 'transparent',
                      borderColor: theme.colors.border 
                    }
                  ]}
                  onPress={() => {
                    setDefaultCurrency(currency);
                    setShowCurrencyModal(false);
                    if (settings.hapticFeedback) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                >
                  <View style={styles.currencyItemInfo}>
                    <Text style={[styles.currencyItemSymbol, { color: theme.colors.primary }]}>
                      {currency.symbol}
                    </Text>
                    <View style={styles.currencyItemDetails}>
                      <Text style={[styles.currencyItemCode, { color: theme.colors.text }]}>
                        {currency.code}
                      </Text>
                      <Text style={[styles.currencyItemName, { color: theme.colors.textSecondary }]}>
                        {currency.name}
                      </Text>
                    </View>
                  </View>
                  {defaultCurrency?.code === currency.code && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  formCard: {
    padding: 20,
    marginBottom: 24,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: {
    fontSize: 14,
  },
  input: {
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
  currencyPlaceholder: {
    fontSize: 16,
  },
  buttonContainer: {
    paddingBottom: 32,
  },
  saveButton: {
    marginBottom: 16,
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

export default ProfileEditScreen;
