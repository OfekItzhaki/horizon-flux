import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useThemedStyles } from '../utils/useThemedStyles';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const styles = useThemedStyles((colors) => ({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 48,
      textAlign: 'center',
      color: colors.primary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      fontSize: 16,
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
    eyeIcon: {
      fontSize: 20,
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
    try {
      await login(email, password);
      // Navigation will be handled by AppNavigator via AuthContext
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid credentials';
      // Check for timeout or slow connection
      const isTimeout = errorMessage.toLowerCase().includes('too long') || 
                       errorMessage.toLowerCase().includes('timeout') ||
                       error?.code === 'ECONNABORTED';
      const isNetworkError = error.statusCode === 0 || 
                            errorMessage.toLowerCase().includes('connect') ||
                            isTimeout;
      
      let finalMessage = errorMessage;
      if (isTimeout) {
        finalMessage = 'Login is taking too long. Please try again later.';
      } else if (isNetworkError && !isTimeout) {
        finalMessage = errorMessage + ' Please try again later.';
      }
      
      Alert.alert(
        isNetworkError ? 'Connection Error' : 'Login Failed',
        finalMessage,
        [{ text: 'OK', style: 'default' }],
        { cancelable: true },
      );
    } finally {
      setLoading(false);
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
    } catch (error: any) {
      const errorMessage = error.message || 'Could not create account';
      // Check for timeout or slow connection
      const isTimeout = errorMessage.toLowerCase().includes('too long') || 
                       errorMessage.toLowerCase().includes('timeout') ||
                       error?.code === 'ECONNABORTED';
      const isNetworkError = error.statusCode === 0 || 
                            errorMessage.toLowerCase().includes('connect') ||
                            isTimeout;
      
      let finalMessage = errorMessage;
      if (isTimeout) {
        finalMessage = 'Registration is taking too long. Please try again later.';
      } else if (isNetworkError && !isTimeout) {
        finalMessage = errorMessage + ' Please try again later.';
      }
      
      Alert.alert(
        isNetworkError ? 'Connection Error' : 'Registration Failed',
        finalMessage,
        [{ text: 'OK', style: 'default' }],
        { cancelable: true },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLogin ? 'Tasks Management' : 'Create Account'}
      </Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
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
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" />
      ) : (
        <TouchableOpacity
          onPress={isLogin ? handleLogin : handleRegister}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6366f1', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {isLogin ? 'Login' : 'Register'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsLogin(!isLogin)}
      >
        <Text style={styles.switchText}>
          {isLogin
            ? "Don't have an account? Register"
            : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
