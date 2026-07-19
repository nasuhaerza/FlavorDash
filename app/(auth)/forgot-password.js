/**
 * app/(auth)/forgot-password.js
 * Halaman Lupa Password — kirim reset link via Supabase
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Colors from '../../constants/Colors';
import supabase from '../../services/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleReset() {
    Keyboard.dismiss();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Email Tidak Valid', 'Masukkan alamat email yang benar.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: 'flavordash://reset-password' }
      );
      if (error) throw error;
      setSent(true);
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Tidak bisa mengirim link reset. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.secondary} />
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔑</Text>
        </View>
        <Text style={styles.title}>Lupa Password?</Text>
        <Text style={styles.subtitle}>
          Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
        </Text>

        {sent ? (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>📧</Text>
            <Text style={styles.successTitle}>Email Terkirim!</Text>
            <Text style={styles.successText}>
              Cek inbox {email} untuk link reset password. Juga periksa folder Spam.
            </Text>
            <Button
              title="Kembali ke Login"
              onPress={() => router.replace('/(auth)/login')}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <InputField
              label="Alamat Email"
              value={email}
              onChangeText={setEmail}
              placeholder="contoh@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="done"
              onSubmitEditing={handleReset}
              leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.textGray} />}
            />
            <Button
              title={loading ? 'Mengirim...' : 'Kirim Link Reset'}
              onPress={handleReset}
              loading={loading}
              style={{ width: '100%' }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: Colors.background },
  container: { paddingHorizontal: 24 },
  backBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 32, alignSelf: 'flex-start', padding: 4 },
  backText:  { fontSize: 14, color: Colors.secondary, fontWeight: '600' },
  iconWrap:  { alignItems: 'center', marginBottom: 16 },
  icon:      { fontSize: 56 },
  title:     { fontSize: 24, fontWeight: '900', color: Colors.secondary, textAlign: 'center', marginBottom: 8 },
  subtitle:  { fontSize: 14, color: Colors.textGray, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 14, elevation: 4,
  },
  successCard: {
    backgroundColor: Colors.surface, borderRadius: 24, padding: 28,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 14, elevation: 4,
  },
  successIcon:  { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: '800', color: Colors.secondary, marginBottom: 8 },
  successText:  { fontSize: 14, color: Colors.textGray, textAlign: 'center', lineHeight: 22 },
});
