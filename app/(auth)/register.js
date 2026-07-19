/**
 * app/(auth)/register.js
 * Halaman Register FlavorDash
 *
 * Catatan keyboard:
 * - Tidak menggunakan Pressable wrapper (memblokir TextInput tap)
 * - TouchableWithoutFeedback hanya untuk dismiss keyboard di area kosong
 * - Field chaining: Nama → Email → Password → Konfirmasi → Submit
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

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  // Refs untuk chaining fokus antar field
  const emailRef    = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef  = useRef(null);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  function validate() {
    const e = {};
    if (!name.trim())                      e.name     = 'Nama tidak boleh kosong';
    if (!email.trim())                     e.email    = 'Email tidak boleh kosong';
    else if (!/\S+@\S+\.\S+/.test(email))  e.email    = 'Format email tidak valid';
    if (!password)                         e.password = 'Password tidak boleh kosong';
    else if (password.length < 6)          e.password = 'Password minimal 6 karakter';
    if (!confirm)                          e.confirm  = 'Konfirmasi password tidak boleh kosong';
    else if (confirm !== password)         e.confirm  = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    Keyboard.dismiss();
    if (!validate()) return;
    setLoading(true);
    try {
      await login('user@flavordash.com', 'password123');
      Alert.alert(
        '✅ Registrasi Berhasil!',
        'Akun Anda telah dibuat. Selamat datang di FlavorDash!',
        [{ text: 'Mulai Pesan', onPress: () => router.replace('/(tabs)/home') }]
      );
    } catch {
      Alert.alert('Gagal', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Back ──────────────────────── */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.secondary} />
            <Text style={styles.backText}>Kembali</Text>
          </TouchableOpacity>

          {/* ── Header ────────────────────── */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>🍽️</Text>
            </View>
            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>Daftar dan nikmati kemudahan pesan makanan</Text>
          </View>

          {/* ── Form ──────────────────────── */}
          <View style={styles.card}>
            {/* Nama */}
            <InputField
              label="Nama Lengkap"
              value={name}
              onChangeText={(v) => { setName(v); setErrors(e => ({ ...e, name: '' })); }}
              placeholder="Contoh: Nasuha Erza"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.name}
              leftIcon={<Ionicons name="person-outline" size={18} color={Colors.textGray} />}
            />

            {/* Email */}
            <InputField
              inputRef={emailRef}
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

            {/* Password */}
            <InputField
              inputRef={passwordRef}
              label="Password"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors(e => ({ ...e, password: '' })); }}
              placeholder="Minimal 6 karakter"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textGray} />}
            />

            {/* Konfirmasi Password */}
            <InputField
              inputRef={confirmRef}
              label="Konfirmasi Password"
              value={confirm}
              onChangeText={(v) => { setConfirm(v); setErrors(e => ({ ...e, confirm: '' })); }}
              placeholder="Ulangi password"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={errors.confirm}
              leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={Colors.textGray} />}
            />

            <Button
              title={loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              onPress={handleRegister}
              loading={loading}
              style={styles.registerBtn}
            />
          </View>

          {/* ── Footer ────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: Colors.background },
  container: { paddingHorizontal: 24 },

  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: 24, alignSelf: 'flex-start', padding: 4,
  },
  backText: { fontSize: 14, color: Colors.secondary, fontWeight: '600' },

  header:   { alignItems: 'center', marginBottom: 28 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 10, elevation: 5,
  },
  logoIcon: { fontSize: 32 },
  title:    { fontSize: 24, fontWeight: '900', color: Colors.secondary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textGray, textAlign: 'center' },

  card: {
    backgroundColor: Colors.surface, borderRadius: 24, padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 14, elevation: 4,
    marginBottom: 20,
  },
  registerBtn: { width: '100%', marginTop: 4 },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: Colors.textGray },
  footerLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
