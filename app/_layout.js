/**
 * app/_layout.js
 * Root layout aplikasi FlavorDash
 *
 * - Membungkus seluruh app dengan Provider (Auth + Cart)
 * - Mengatur font dan splash screen
 * - Menangani redirects berdasarkan status autentikasi
 */

// Polyfill Buffer agar jwtHelper.js bisa berjalan di React Native
import '../utils/polyfills';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Colors from '../constants/Colors';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

// Tahan splash screen sampai app siap
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Sembunyikan splash screen setelah app mount
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/* Auth context membungkus segalanya */}
        <AuthProvider>
          {/* Cart context untuk keranjang belanja */}
          <CartProvider>
            <StatusBar style="dark" backgroundColor={Colors.surface} />
            <Stack screenOptions={{ headerShown: false }}>
              {/* Auth screens */}
              <Stack.Screen name="(auth)" />
              {/* Tab screens */}
              <Stack.Screen name="(tabs)" />
              {/* Detail — Food */}
              <Stack.Screen
                name="food/[id]"
                options={{ animation: 'slide_from_right' }}
              />
              {/* Detail — Order */}
              <Stack.Screen
                name="orders/[id]"
                options={{ animation: 'slide_from_right' }}
              />
              {/* Cart — modal dari bawah */}
              <Stack.Screen
                name="cart/index"
                options={{
                  animation: 'slide_from_bottom',
                  presentation: 'modal',
                }}
              />
            </Stack>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
