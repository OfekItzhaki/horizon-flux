import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../services/auth.service';
import { useThemedStyles } from '../utils/useThemedStyles';
import { RootStackParamList } from '../navigation/AppNavigator';

type VerifyEmailRouteProp = RouteProp<{ VerifyEmail: { token?: string } }, 'VerifyEmail'>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

type ScreenState = 'loading' | 'success' | 'error';

export default function VerifyEmailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<VerifyEmailRouteProp>();
  const token = (route.params as { token?: string } | undefined)?.token;

  const [state, setState] = useState<ScreenState>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useState('Verification link is missing or invalid.');
  const hasCalled = useRef(false);

  const styles = useThemedStyles((colors) => ({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    iconWrapper: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
  }));

  useEffect(() => {
    if (!token || hasCalled.current) return;
    hasCalled.current = true;

    authService
      .verifyEmail(token)
      .then(() => {
        setState('success');
        const timer = setTimeout(() => {
          navigation.navigate('Auth');
        }, 3000);
        return () => clearTimeout(timer);
      })
      .catch((err: Error) => {
        setErrorMessage(err?.message ?? 'Email verification failed. Please try again.');
        setState('error');
      });
  }, [token, navigation]);

  const goToLogin = () => navigation.navigate('Auth');

  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={[styles.message, { marginTop: 16 }]}>Verifying your email…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'success') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.iconWrapper}>
            <Ionicons name="checkmark-circle" size={72} color="#22c55e" />
          </View>
          <Text style={styles.title}>Email Verified!</Text>
          <Text style={styles.message}>
            Your email has been successfully verified. Redirecting you to login…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // error state
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Ionicons name="close-circle" size={72} color="#ef4444" />
        </View>
        <Text style={styles.title}>Verification Failed</Text>
        <Text style={styles.message}>{errorMessage}</Text>
        <TouchableOpacity style={styles.button} onPress={goToLogin} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
