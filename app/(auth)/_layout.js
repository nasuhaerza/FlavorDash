/**
 * app/(auth)/_layout.js
 * Layout untuk grup screen autentikasi (login, register)
 * Jika sudah login, redirect ke home
 */

import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
