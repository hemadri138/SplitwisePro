import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const ProfileScreen: React.FC = () => {
  const { theme, isDark, toggleTheme, settings, updateSettings } = useTheme();

  const handleToggleHaptic = (value: boolean) => {
    updateSettings({ hapticFeedback: value });
  };

  const handleToggleNotifications = (value: boolean) => {
    updateSettings({ notifications: value });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Profile
          </Text>
        </View>

        {/* User Info */}
        <View style={[styles.userCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={32} color="white" />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              John Doe
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
              john.doe@example.com
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Settings
          </Text>
          
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.settingText, { color: theme.colors.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={isDark ? theme.colors.surface : theme.colors.surface}
              />
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="feedback" size={24} color={theme.colors.text} />
                <Text style={[styles.settingText, { color: theme.colors.text }]}>
                  Haptic Feedback
                </Text>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={handleToggleHaptic}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.hapticFeedback ? theme.colors.surface : theme.colors.surface}
              />
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.settingText, { color: theme.colors.text }]}>
                  Notifications
                </Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.notifications ? theme.colors.surface : theme.colors.surface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Other Options */}
        <View style={styles.section}>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.settingText, { color: theme.colors.text }]}>
                  Security
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.settingText, { color: theme.colors.text }]}>
                  Help & Support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.settingText, { color: theme.colors.text }]}>
                  About
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingsCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingDivider: {
    height: 1,
    marginLeft: 56,
  },
});

export default ProfileScreen;
