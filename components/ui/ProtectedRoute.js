/**
 * components/ui/ProtectedRoute.js
 * Komponen wrapper untuk route protection berbasis JWT
 *
 * Penggunaan:
 *   <ProtectedRoute>
 *     <HalamanRahasia />
 *   </ProtectedRoute>
 *
 * Jika tidak autentikasi → tampilkan UI prompt login
 * Jika loading → tampilkan spinner
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, redirectTo = '/(auth)/login' }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Cek auth selesai — tampilkan loading
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memverifikasi sesi...</Text>
      </View>
    );
  }

  // Tidak autentikasi — tampilkan prompt
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Akses Terbatas</Text>
        <Text style={styles.message}>
          Halaman ini memerlukan autentikasi.{'\n'}
          Silakan login untuk melanjutkan.
        </Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.replace(redirectTo)}
          activeOpacity={0.85}
        >
          <Ionicons name="log-in-outline" size={18} color="#fff" />
          <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Autentikasi valid — render children
  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    gap: 12, backgroundColor: Colors.background,
  },
  loadingText: { fontSize: 14, color: Colors.textGray },

  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 40, backgroundColor: Colors.background, gap: 12,
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  title:   { fontSize: 20, fontWeight: '800', color: Colors.secondary },
  message: {
    fontSize: 14, color: Colors.textGray,
    textAlign: 'center', lineHeight: 22,
  },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14, marginTop: 8,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
