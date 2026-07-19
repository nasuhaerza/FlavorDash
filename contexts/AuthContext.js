/**
 * contexts/AuthContext.js
 * Manajemen autentikasi global
 *
 * - Jika Supabase dikonfigurasi → pakai Supabase Auth + listen onAuthStateChange
 * - Jika tidak → fallback ke JWT mock (AsyncStorage)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TOKEN_KEY } from '../constants/api';
import supabase from '../services/supabase';
import { getCurrentUser, signIn, signOut, signUp } from '../services/supabaseAuthService';
import { decodeToken, isTokenValid } from '../utils/jwtHelper';

const AuthContext = createContext(null);

function isSupabaseConfigured() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  return url.includes('.supabase.co') && !url.includes('your-project');
}

export function AuthProvider({ children }) {
  const [token,     setToken]     = useState(null);
  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const configured = isSupabaseConfigured();

  // ── Restore sesi saat app buka ───────────────────────
  useEffect(() => {
    if (configured) {
      // Supabase: cek session aktif
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setToken(session.access_token);
          getCurrentUser().then(setUser);
        }
        setIsLoading(false);
      });

      // Listen perubahan auth state (login/logout/refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session) {
            setToken(session.access_token);
            const u = await getCurrentUser();
            setUser(u);
          } else {
            setToken(null);
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    } else {
      // Fallback: restore dari AsyncStorage
      AsyncStorage.getItem(TOKEN_KEY).then((storedToken) => {
        if (storedToken && isTokenValid(storedToken)) {
          const payload = decodeToken(storedToken);
          setToken(storedToken);
          setUser({
            id:     payload.sub,
            name:   payload.name,
            email:  payload.email,
            avatar: payload.avatar,
          });
        } else if (storedToken) {
          AsyncStorage.removeItem(TOKEN_KEY);
        }
        setIsLoading(false);
      });
    }
  }, [configured]);

  // ── Login ────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await signIn(email, password);
    if (!configured) {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
    }
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, [configured]);

  // ── Register ─────────────────────────────────────────
  const register = useCallback(async (email, password, name) => {
    const { token: newToken, user: newUser } = await signUp(email, password, name);
    if (!configured) {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
    }
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, [configured]);

  // ── Logout ───────────────────────────────────────────
  const logout = useCallback(async () => {
    await signOut();
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = configured
    ? !!token                         // Supabase: cek token ada
    : !!token && isTokenValid(token); // Mock: cek token valid & belum expired

  return (
    <AuthContext.Provider value={{
      token, user, isLoading, isAuthenticated,
      login, register, logout,
      isSupabase: configured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus di dalam AuthProvider');
  return ctx;
}
