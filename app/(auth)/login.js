/**
 * app/(auth)/login.js
 * Halaman Login FlavorDash
 *
 * Catatan keyboard:
 * - Tidak menggunakan Pressable wrapper — menyebabkan TextInput tidak bisa di-tap
 * - Dismiss keyboard ditangani oleh ScrollView keyboardDismissMode + TouchableWithoutFeedback
 *   yang wrapping HANYA area kosong (bukan seluruh ScrollView)
 * - KeyboardAvoidingView: 'padding' iOS, 'height' Android
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { login } = useAuth();

  const passwordRef = useRef(null);

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [errors,    setErrors]    = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const e = {};
    if (!email.trim())                    e.email    = 'Email tidak boleh kosong';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Format email tidak valid';
    if (!password)                        e.password = 'Password tidak boleh kosong';
    else if (password.length < 6)         e.password = 'Password minimal 6 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    Keyboard.dismiss();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Login Gagal', err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo() {
    Keyboard.dismiss();
    setEmail('user@flavordash.com');
    setPassword('password123');
    setErrors({});
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/*
        TouchableWithoutFeedback hanya membungkus area DI LUAR form.
        Tidak menghalangi touch ke TextInput di dalam ScrollView.
        keyboardShouldPersistTaps="handled" memastikan tap ke tombol
        di dalam ScrollView tetap berfungsi walau keyboard terbuka.
      */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>🍽️</Text>
            </View>
            <Text style={styles.appName}>FlavorDash</Text>
            <Text style={styles.tagline}>Pesan makanan favoritmu, kapanpun!</Text>
          </View>

          {/* ── Form Card ───────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Selamat Datang 👋</Text>
            <Text style={styles.cardSubtitle}>Masuk ke akun FlavorDash Anda</Text>

            <InputField
              label="Email"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors(e => ({ ...e, email: '' })); }}
              placeholder="contoh@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.textGray} />}
            />

            <InputField
              inputRef={passwordRef}
              label="Password"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors(e => ({ ...e, password: '' })); }}
              placeholder="Masukkan password"
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textGray} />}
            />

            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => Alert.alert(
                'Lupa Password?',
                'Fitur reset password akan segera tersedia. Gunakan akun demo untuk saat ini.',
                [{ text: 'OK' }]
              )}
            >
              <Text style={styles.forgotText}>Lupa password?</Text>
            </TouchableOpacity>

            <Button
              title={isLoading ? 'Memproses...' : 'Masuk'}
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginBtn}
            />
          </View>

          {/* ── Demo Helper ─────────────────────── */}
          <TouchableOpacity style={styles.demoBox} onPress={fillDemo}>
            <Ionicons name="flash" size={14} color={Colors.primary} />
            <Text style={styles.demoText}>
              Gunakan akun demo:{' '}
              <Text style={styles.demoCredential}>user@flavordash.com</Text>
            </Text>
          </TouchableOpacity>

          {/* ── Footer ──────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 24 },

  header: { alignItems: 'center', marginBottom: 32 },
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  logoIcon:  { fontSize: 36 },
  appName:   { fontSize: 28, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  tagline:   { fontSize: 14, color: Colors.textGray, marginTop: 4 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24, padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
    marginBottom: 16,
  },
  cardTitle:    { fontSize: 22, fontWeight: '800', color: Colors.secondary, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: Colors.textGray, marginBottom: 24 },

  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -8, marginBottom: 20, padding: 4,
  },
  forgotText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  loginBtn:   { width: '100%' },

  demoBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12, padding: 12, marginBottom: 24, gap: 6,
  },
  demoText:       { fontSize: 12, color: Colors.textGray, flex: 1 },
  demoCredential: { fontWeight: '700', color: Colors.primary },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: Colors.textGray },
  footerLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
