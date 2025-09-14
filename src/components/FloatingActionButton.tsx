import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface FABAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  mainIcon?: keyof typeof Ionicons.glyphMap;
  style?: any;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  mainIcon = 'add',
  style,
}) => {
  const { theme, settings } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const expandValue = useSharedValue(0);
  const rotationValue = useSharedValue(0);

  const animatedMainButton = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotationValue.value}deg` },
        { scale: interpolate(expandValue.value, [0, 1], [1, 0.9]) },
      ],
    };
  });

  const animatedOverlay = useAnimatedStyle(() => {
    return {
      opacity: expandValue.value,
      pointerEvents: expandValue.value > 0 ? 'auto' : 'none',
    };
  });

  const animatedActions = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: expandValue.value },
        { translateY: interpolate(expandValue.value, [0, 1], [20, 0]) },
      ],
      opacity: expandValue.value,
    };
  });

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    expandValue.value = withSpring(newExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 300,
    });
    
    rotationValue.value = withSpring(newExpanded ? 45 : 0, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handleActionPress = (action: FABAction) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action.onPress();
    toggleExpanded();
  };

  const handleOverlayPress = () => {
    toggleExpanded();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, animatedOverlay]}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject} 
          onPress={handleOverlayPress}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.actionsContainer, animatedActions]}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              {
                backgroundColor: action.color || theme.colors.secondary,
                bottom: 80 + (index * 60),
              },
            ]}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.8}
          >
            <Ionicons name={action.icon} size={20} color="white" />
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Main Button */}
      <Animated.View style={animatedMainButton}>
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: theme.colors.primary }]}
          onPress={toggleExpanded}
          activeOpacity={0.8}
        >
          <Ionicons name={mainIcon} size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  actionButton: {
    position: 'absolute',
    right: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionLabel: {
    position: 'absolute',
    right: 60,
    top: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
    overflow: 'hidden',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default FloatingActionButton;
