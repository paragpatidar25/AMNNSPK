import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, AuthResponse } from '@/services/api';
import { STORAGE_KEYS } from '@/constants';

interface AuthState {
  token: string | null;
  userEmail: string | null;
  userRole: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    userEmail: null,
    userRole: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load persisted token on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        const email = await SecureStore.getItemAsync(STORAGE_KEYS.USER_EMAIL);
        setState({
          token,
          userEmail: email,
          userRole: null,
          isLoading: false,
          isAuthenticated: !!token,
        });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const result = await api.login({ email, password });
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, result.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_EMAIL, result.email);
    setState({
      token: result.accessToken,
      userEmail: result.email,
      userRole: result.role,
      isLoading: false,
      isAuthenticated: true,
    });
    return result;
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_EMAIL);
    setState({
      token: null,
      userEmail: null,
      userRole: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  return { ...state, login, logout };
}
