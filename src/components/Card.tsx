import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'glassmorphism' | 'neumorphism';
  animated?: boolean;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  onPress, 
  variant = 'default',
  animated = true,
  disabled = false 
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    if (animated && !disabled) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.8, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (animated && !disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 100 });
    }
  };

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.medium,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    };

    switch (variant) {
      case 'glassmorphism':
        return {
          ...baseStyle,
          backgroundColor: `${theme.colors.surface}80`,
          borderWidth: 1,
          borderColor: `${theme.colors.border}40`,
          backdropFilter: 'blur(10px)',
        };
      case 'neumorphism':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.text,
          shadowOffset: { width: -2, height: -2 },
          shadowOpacity: 0.1,
          elevation: 5,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
        };
    }
  };

  const CardComponent = animated ? Animated.View : View;
  const TouchableComponent = onPress ? (animated ? Animated.createAnimatedComponent(TouchableOpacity) : TouchableOpacity) : View;

  if (onPress) {
    return (
      <TouchableComponent
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[getCardStyle(), style]}
        activeOpacity={0.8}
      >
        {animated ? (
          <CardComponent style={animatedStyle}>
            {children}
          </CardComponent>
        ) : (
          children
        )}
      </TouchableComponent>
    );
  }

  return (
    <CardComponent style={[getCardStyle(), style]}>
      {children}
    </CardComponent>
  );
};

export default Card;
