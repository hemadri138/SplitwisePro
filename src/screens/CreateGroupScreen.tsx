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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { NavigationProps } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const CreateGroupScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { addGroup, user } = useApp();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#14B8A6');
  const [isLoading, setIsLoading] = useState(false);

  const colors = [
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#F97316', // Coral
    '#10B981', // Green
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F59E0B', // Amber
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      setIsLoading(true);
      
      await addGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        members: user ? [{
          userId: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          joinedAt: new Date(),
        }] : [],
        color,
        currency: user?.defaultCurrency || 'USD',
      });

      Alert.alert('Success', 'Group created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create group. Please try again.');
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Group Details
            </Text>
            
            <Input
              label="Group Name"
              placeholder="Enter group name"
              value={name}
              onChangeText={setName}
              leftIcon="people"
            />
            
            <Input
              label="Description (Optional)"
              placeholder="Add a description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              leftIcon="document-text"
            />
          </Card>

          {/* Color Selection */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Group Color
            </Text>
            
            <View style={styles.colorGrid}>
              {colors.map((colorOption) => (
                <TouchableOpacity
                  key={colorOption}
                  style={[
                    styles.colorItem,
                    { 
                      backgroundColor: colorOption,
                      borderColor: color === colorOption ? theme.colors.text : 'transparent',
                      borderWidth: color === colorOption ? 3 : 0,
                    }
                  ]}
                  onPress={() => setColor(colorOption)}
                >
                  {color === colorOption && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Create Group"
              onPress={handleSave}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
  },
});

export default CreateGroupScreen;
