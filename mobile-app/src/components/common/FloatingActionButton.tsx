import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface FloatingActionButtonProps {
  onPress: () => void;
  ariaLabel: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function FloatingActionButton({
  onPress,
  ariaLabel,
  disabled = false,
  icon,
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom + 80,
          right: 20,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
      pointerEvents={disabled ? 'none' : 'auto'}
    >
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={ariaLabel}
        accessibilityRole="button"
        style={[styles.button, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
      >
        {icon ?? <Text style={styles.defaultIcon}>+</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  defaultIcon: {
    fontSize: 28,
    color: '#ffffff',
    lineHeight: 32,
  },
});
