import React, { useState, forwardRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  animated?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  animated = true,
}, ref) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  
  const focusScale = useSharedValue(1);
  const borderColor = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: focusScale.value }],
      borderColor: borderColor.value === 1 ? theme.colors.primary : theme.colors.border,
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
    if (animated) {
      focusScale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
      borderColor.value = withTiming(1, { duration: 200 });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (animated) {
      focusScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      borderColor.value = withTiming(0, { duration: 200 });
    }
  };

  const toggleSecure = () => {
    setIsSecure(!isSecure);
  };

  const getContainerStyle = (): ViewStyle => {
    return {
      backgroundColor: disabled ? theme.colors.border : theme.colors.surface,
      borderWidth: 2,
      borderRadius: theme.borderRadius.medium,
      paddingHorizontal: 16,
      paddingVertical: multiline ? 12 : 0,
      minHeight: multiline ? 80 : 48,
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: multiline ? 8 : 12,
      textAlignVertical: multiline ? 'top' : 'center',
    };
  };

  return (
    <View style={style}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}
      
      <Animated.View style={[getContainerStyle(), animatedContainerStyle]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          ref={ref}
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecure} style={styles.iconButton}>
            <Ionicons 
              name={isSecure ? 'eye-off' : 'eye'} 
              size={20} 
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconButton}>
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  leftIcon: {
    marginRight: 12,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

Input.displayName = 'Input';

export default Input;
