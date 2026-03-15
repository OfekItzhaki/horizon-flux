import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useThemedStyles } from '../utils/useThemedStyles';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';

type Mode = 'login' | 'register' | 'forgot';
type RegStep = 1 | 2 | 3; // 1=email, 2=otp, 3=password
type ResetStep = 1 | 2 | 3; // 1=email, 2=otp, 3=new password

export default function LoginScreen() {
  const { login } = useAuth();
  const { setThemeMode, isDark } = useTheme();

  const [mode, setMode] = useState<Mode>('login');
  const [regStep, setRegStep] = useState<RegStep>(1);
  const [resetStep, setResetStep] = useState<ResetStep>(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);

  // tokens from OTP steps
  const [regToken, setRegToken] = useState('');
  const [resetToken, setResetToken] = useState('');

  // resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    header: { flexDirection: 'row' as const, justifyContent: 'flex-end' as const, paddingHorizontal: 24, paddingTop: 16, zIndex: 10 },
    themeButton: { padding: 10, borderRadius: 20, backgroundColor: colors.cardGlass },
    scrollContent: { flexGrow: 1, justifyContent: 'center' as const, padding: 24 },
    title: { fontSize: 32, fontWeight: '900' as const, marginBottom: 8, textAlign: 'center' as const, color: colors.primary },
    subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' as const, marginBottom: 32 },
    input: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16,
      marginBottom: 14, fontSize: 16, backgroundColor: colors.cardGlass, color: colors.text,
    },
    otpInput: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16,
      marginBottom: 14, fontSize: 24, backgroundColor: colors.cardGlass, color: colors.text,
      textAlign: 'center' as const, letterSpacing: 12, fontWeight: '700' as const,
    },
    passwordRow: {
      flexDirection: 'row' as const, alignItems: 'center' as const,
      borderWidth: 1, borderColor: colors.border, borderRadius: 16,
      marginBottom: 14, backgroundColor: colors.cardGlass,
    },
    passwordInput: { flex: 1, padding: 16, fontSize: 16, color: color
      backgroundColor: colors.cardGlass,
      color: colors.text,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      marginBottom: 16,
      backgroundColor: colors.cardGlass,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    passwordInput: {
      flex: 1,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 12,
      shadowColor: colors.shadowStrong,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    switchButton: {
      marginTop: 24,
      alignItems: 'center',
    },
    switchText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    setShowResendVerification(false);
    try {
      await login(email, password);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message.toLowerCase() : '';
      if (msg.includes('verif') || msg.includes('not verified')) {
        setShowResendVerification(true);
      }
      handleApiError(error, 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }
    setResendLoading(true);
    try {
      await authService.resendVerification(email);
      Alert.alert('Email Sent', 'Verification email sent. Please check your inbox.');
      setShowResendVerification(false);
    } catch (error: unknown) {
      handleApiError(error, 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      Alert.alert('Success', 'Account created! Please log in.');
      setIsLogin(true);
      setPassword('');
    } catch (error: unknown) {
      handleApiError(error, 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
            style={styles.themeButton}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={24}
              color={isDark ? '#fbbf24' : '#1e293b'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{isLogin ? 'Horizon Flux' : 'Create Account'}</Text>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={isDark ? '#cbd5e1' : '#64748b'}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : (
            <TouchableOpacity onPress={isLogin ? handleLogin : handleRegister} activeOpacity={0.8}>
              <LinearGradient
                colors={['#6366f1', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>

          {isLogin && showResendVerification && (
            <TouchableOpacity
              style={[styles.switchButton, { marginTop: 12 }]}
              onPress={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Text style={[styles.switchText, { color: '#f59e0b' }]}>
                  Resend verification email
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
