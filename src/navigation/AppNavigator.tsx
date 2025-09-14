import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import GroupsScreen from '../screens/GroupsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import ExpenseDetailScreen from '../screens/ExpenseDetailScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="AddExpense" 
      component={AddExpenseScreen}
      options={{ 
        title: 'Add Expense',
        presentation: 'modal',
      }}
    />
    <Stack.Screen 
      name="ExpenseDetail" 
      component={ExpenseDetailScreen}
      options={{ title: 'Expense Details' }}
    />
  </Stack.Navigator>
);

const GroupsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="GroupsMain" 
      component={GroupsScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreateGroup" 
      component={CreateGroupScreen}
      options={{ 
        title: 'Create Group',
        presentation: 'modal',
      }}
    />
    <Stack.Screen 
      name="GroupDetail" 
      component={GroupDetailScreen}
      options={{ title: 'Group Details' }}
    />
    <Stack.Screen 
      name="AddExpense" 
      component={AddExpenseScreen}
      options={{ 
        title: 'Add Expense',
        presentation: 'modal',
      }}
    />
  </Stack.Navigator>
);

const FriendsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="FriendsMain" 
      component={FriendsScreen} 
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const AnalyticsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AnalyticsMain" 
      component={AnalyticsScreen} 
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen} 
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Groups') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Friends') {
              iconName = focused ? 'person-add' : 'person-add-outline';
            } else if (route.name === 'Analytics') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStack}
          options={{ 
            title: 'Home',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Groups" 
          component={GroupsStack}
          options={{ 
            title: 'Groups',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Friends" 
          component={FriendsStack}
          options={{ 
            title: 'Friends',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Analytics" 
          component={AnalyticsStack}
          options={{ 
            title: 'Analytics',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileStack}
          options={{ 
            title: 'Profile',
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
