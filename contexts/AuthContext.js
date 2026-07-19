/**
 * contexts/AuthContext.js
 * Manajemen state autentikasi global menggunakan Context API
 *
 * Menyimpan token JWT ke AsyncStorage agar sesi tetap ada saat app dibuka ulang.
 * Seluruh komponen bisa mengakses: { user, token, isLoading, login, logout, isAuthenticated }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loginUser, logoutUser } from '../services/authService';
import { decodeToken, isTokenValid } from '../utils/jwtHelper';

// Kunci penyimpanan token di AsyncStorage
const TOKEN_STORAGE_KEY = '@flavordash_token';

// -------------------------------------------------------
// Buat Context
// -------------------------------------------------------
const AuthContext = createContext(null);

// -------------------------------------------------------
// AuthProvider — bungkus seluruh aplikasi dengan ini
// -------------------------------------------------------
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true saat pertama kali cek token

  // ---------------------------------------------------
  // Saat app pertama dibuka: baca token dari AsyncStorage
  // ---------------------------------------------------
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

        if (storedToken && isTokenValid(storedToken)) {
          // Token masih valid — restore session
          const payload = decodeToken(storedToken);
          setToken(storedToken);
          setUser({
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            avatar: payload.avatar,
          });
        } else if (storedToken) {
          // Token ada tapi sudah expired — hapus
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch (error) {
        console.warn('Gagal restore session:', error);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // ---------------------------------------------------
  // Login: panggil authService, simpan token
  // ---------------------------------------------------
  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await loginUser(email, password);

    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);

    return newUser;
  }, []);

  // ---------------------------------------------------
  // Logout: hapus token dari storage dan reset state
  // ---------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Abaikan error dari service, tetap lanjut logout
    } finally {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  // ---------------------------------------------------
  // Cek apakah saat ini terautentikasi
  // ---------------------------------------------------
  const isAuthenticated = !!token && isTokenValid(token);

  const value = {
    token,
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -------------------------------------------------------
// Custom hook — gunakan di komponen manapun
// Contoh: const { user, login, logout } = useAuth();
// -------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
