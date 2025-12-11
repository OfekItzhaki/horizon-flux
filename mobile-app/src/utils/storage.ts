import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeBooleans } from './normalize';

const TOKEN_KEY = '@tasks_management:token';
const USER_KEY = '@tasks_management:user';

/**
 * Token storage utilities
 */
export const TokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },
};

/**
 * User storage utilities
 */
export const UserStorage = {
  async getUser(): Promise<any | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      if (!userJson) {
        return null;
      }
      const user = JSON.parse(userJson);
      // Normalize boolean fields to ensure they're actual booleans
      return normalizeBooleans(user);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      // Ensure we're storing proper types - normalize before storing
      const normalizedUser = normalizeBooleans(user);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },
};


