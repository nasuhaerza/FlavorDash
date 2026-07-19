/**
 * app/(tabs)/profile.js
 * Halaman Profil Pengguna
 *
 * Fitur tambahan:
 * - Update avatar dari kamera (useCamera hook)
 * - Toast notification via useNotification
 * - In-screen camera view untuk foto profil
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useCamera } from '../../hooks/useCamera';
import { useNotification } from '../../hooks/useNotification';
import { formatDate } from '../../utils/formatters';
import { getTokenRemainingTime } from '../../utils/jwtHelper';

const MENU_ITEMS = [
  { icon: 'receipt-outline',          label: 'Riwayat Pesanan',    route: '/(tabs)/orders', badge: null  },
  { icon: 'heart-outline',            label: 'Makanan Favorit',    route: 'favorite',       badge: null  },
  { icon: 'location-outline',         label: 'Alamat Tersimpan',   route: 'address',        badge: null  },
  { icon: 'card-outline',             label: 'Metode Pembayaran',  route: 'payment',        badge: 'Baru'},
  { icon: 'settings-outline',         label: 'Pengaturan Akun',    route: 'settings',       badge: null  },
  { icon: 'help-circle-outline',      label: 'Bantuan & FAQ',      route: 'help',           badge: null  },
  { icon: 'shield-checkmark-outline', label: 'Privasi & Keamanan', route: 'privacy',        badge: null  },
];

function MenuItem({ icon, label, badge, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrap}>
          <Ionicons name={icon} size={20} color={Colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {badge && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, token, isAuthenticated } = useAuth();

  const [loggingOut,   setLoggingOut]   = useState(false);
  const [showCamera,   setShowCamera]   = useState(false);
  const [localAvatar,  setLocalAvatar]  = useState(null);

  // ── Camera hook ─────────────────────────────────────
  const {
    permission, requestPermission,
    CameraView, cameraRef, facing,
    taking, takePicture, flipCamera,
  } = useCamera();

  // ── Toast ────────────────────────────────────────────
  const { notify, NotificationView } = useNotification();
  const { connected, checking, source: dbSource } = useSupabaseStatus();

  const paddingTop =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + 8
      : insets.top + 8;

  const remainingSeconds = token ? getTokenRemainingTime(token) : 0;
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingHours   = Math.floor(remainingMinutes / 60);
  const tokenExpDisplay  =
    remainingSeconds <= 0       ? 'Kedaluwarsa'
    : remainingHours > 0        ? `${remainingHours} jam ${remainingMinutes % 60} menit`
    :                             `${remainingMinutes} menit`;

  // ── Buka kamera untuk ganti avatar ──────────────────
  async function handleChangeAvatar() {
    if (!permission?.granted) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('Izin Kamera', 'Izin kamera diperlukan untuk mengganti foto profil.');
        return;
      }
    }
    setShowCamera(true);
  }

  // ── Ambil foto, simpan lokal ─────────────────────────
  async function handleCapture() {
    const uri = await takePicture();
    if (uri) {
      setLocalAvatar(uri);
      setShowCamera(false);
      notify('Foto profil berhasil diperbarui! 📸', 'success');
    }
  }

  function handleLogout() {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar', style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  // ── In-screen Camera View ────────────────────────────
  if (showCamera) {
    return (
      <View style={styles.cameraRoot}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.cameraView} facing={facing}>
            {/* Header kamera */}
            <View style={[styles.camTop, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity style={styles.camIconBtn} onPress={() => setShowCamera(false)}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.camTitle}>Foto Profil Baru</Text>
              <TouchableOpacity style={styles.camIconBtn} onPress={flipCamera}>
                <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Shutter */}
            <View style={[styles.camBottom, { paddingBottom: insets.bottom + 24 }]}>
              <TouchableOpacity
                style={[styles.shutter, taking && { opacity: 0.5 }]}
                onPress={handleCapture}
                disabled={taking}
              >
                {taking
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <View style={styles.shutterInner} />
                }
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionIcon}>📷</Text>
            <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
            <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
              <Text style={styles.grantBtnText}>Izinkan</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelText}>Kembali</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // ── Halaman Profil ───────────────────────────────────
  return (
    <View style={styles.root}>
      <NotificationView />

      <View style={[styles.header, { paddingTop }]}>
        <Text style={styles.title}>Profil Saya</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar + Info ─────────────────── */}
        <View style={styles.profileCard}>
          {/* Avatar dengan overlay kamera */}
          <TouchableOpacity onPress={handleChangeAvatar} activeOpacity={0.85}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: localAvatar ?? user?.avatar ?? 'https://i.pravatar.cc/150?img=8' }}
                style={styles.avatar}
              />
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? '-'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? '-'}</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="star" size={11} color={Colors.star} />
              <Text style={styles.memberText}>
                Member sejak {formatDate(user?.memberSince ?? '2024-01-01')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              Alert.alert('Edit Profil', 'Tap avatar untuk ganti foto. Fitur edit data akan segera tersedia.', [{ text: 'OK' }])
            }
          >
            <Ionicons name="pencil" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Foto profil baru (preview) */}
        {localAvatar && (
          <View style={styles.newAvatarNote}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={styles.newAvatarText}>Foto profil baru sudah diterapkan (sesi ini)</Text>
            <TouchableOpacity onPress={() => setLocalAvatar(null)}>
              <Text style={styles.newAvatarReset}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── JWT Info ──────────────────────── */}
        <View style={styles.jwtBox}>
          <View style={styles.jwtHeader}>
            <Ionicons name="key-outline" size={16} color={Colors.primary} />
            <Text style={styles.jwtTitle}>Info Session JWT</Text>
          </View>
          <View style={styles.jwtRow}>
            <Text style={styles.jwtLabel}>Status Token</Text>
            <View style={[styles.jwtStatus, {
              backgroundColor: isAuthenticated ? Colors.success + '20' : Colors.danger + '20'
            }]}>
              <Text style={[styles.jwtStatusText, {
                color: isAuthenticated ? Colors.success : Colors.danger
              }]}>
                {isAuthenticated ? '✓ Valid' : '✗ Tidak Valid'}
              </Text>
            </View>
          </View>
          <View style={styles.jwtRow}>
            <Text style={styles.jwtLabel}>Berlaku hingga</Text>
            <Text style={styles.jwtValue}>{tokenExpDisplay}</Text>
          </View>
          <View style={styles.jwtRow}>
            <Text style={styles.jwtLabel}>Database</Text>
            <View style={[styles.jwtStatus, {
              backgroundColor: checking
                ? Colors.textLight + '30'
                : connected ? Colors.success + '20' : Colors.warning + '20'
            }]}>
              <Text style={[styles.jwtStatusText, {
                color: checking
                  ? Colors.textGray
                  : connected ? Colors.success : Colors.warning
              }]}>
                {checking ? '⏳ Mengecek...' : connected ? '☁️ Supabase' : '💾 Lokal'}
              </Text>
            </View>
          </View>
          <Text style={styles.jwtNote}>
            * Token tersimpan di AsyncStorage. Sesi terjaga meski app ditutup.
          </Text>
        </View>

        {/* ── Stats ─────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Pesanan', value: '3', icon: '📦' },
            { label: 'Favorit', value: '4', icon: '❤️' },
            { label: 'Poin',    value: '240', icon: '⭐' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Menu ──────────────────────────── */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.label}
              {...item}
              onPress={() => {
                if (item.route?.startsWith('/')) {
                  router.push(item.route);
                } else if (item.route) {
                  Alert.alert(item.label, 'Fitur ini sedang dalam pengembangan.', [{ text: 'OK' }]);
                }
              }}
            />
          ))}
        </View>

        {/* ── Logout ────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>
            {loggingOut ? 'Keluar...' : 'Keluar dari Akun'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title:  { fontSize: 22, fontWeight: '800', color: Colors.secondary },

  // Camera overlay
  cameraRoot: { flex: 1, backgroundColor: '#000' },
  cameraView: { flex: 1 },
  camTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  camTitle:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  camIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  camBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    alignItems: 'center',
  },
  shutter: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 4, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  shutterInner: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#fff',
  },

  // Permission fallback
  permissionBox: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.background, gap: 12, padding: 40,
  },
  permissionIcon:  { fontSize: 60 },
  permissionTitle: { fontSize: 18, fontWeight: '700', color: Colors.secondary, textAlign: 'center' },
  grantBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 12, marginTop: 8,
  },
  grantBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelText:   { fontSize: 14, color: Colors.textGray, padding: 8 },

  // Profile card
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16, borderRadius: 20, padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  avatarWrap:    { position: 'relative' },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 3, borderColor: Colors.primary,
  },
  avatarOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  profileInfo:  { flex: 1, marginLeft: 14 },
  profileName:  { fontSize: 17, fontWeight: '800', color: Colors.secondary },
  profileEmail: { fontSize: 13, color: Colors.textGray, marginTop: 2 },
  memberBadge:  { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  memberText:   { fontSize: 11, color: Colors.textGray },
  editBtn:      { padding: 8 },

  newAvatarNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.success + '15',
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 10, padding: 10,
  },
  newAvatarText:  { flex: 1, fontSize: 11, color: Colors.success, fontWeight: '500' },
  newAvatarReset: { fontSize: 11, color: Colors.danger, fontWeight: '700' },

  // JWT
  jwtBox: {
    backgroundColor: Colors.primaryLight,
    marginHorizontal: 16, marginBottom: 16,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  jwtHeader:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  jwtTitle:      { fontSize: 13, fontWeight: '700', color: Colors.primary },
  jwtRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  jwtLabel:      { fontSize: 12, color: Colors.textGray },
  jwtValue:      { fontSize: 12, fontWeight: '600', color: Colors.secondary },
  jwtStatus:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  jwtStatusText: { fontSize: 11, fontWeight: '700' },
  jwtNote:       { fontSize: 10, color: Colors.textGray, fontStyle: 'italic', marginTop: 4 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statItem:  { flex: 1, alignItems: 'center', paddingVertical: 16, borderRightWidth: 1, borderRightColor: Colors.border },
  statIcon:  { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.secondary },
  statLabel: { fontSize: 11, color: Colors.textGray, marginTop: 2 },

  // Menu
  menuSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16, borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  menuItem:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconWrap:{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  menuLabel:   { fontSize: 14, fontWeight: '600', color: Colors.secondary },
  menuRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge:   { backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  menuBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, paddingVertical: 14, borderRadius: 16,
    backgroundColor: Colors.danger + '15', borderWidth: 1.5, borderColor: Colors.danger + '30', gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
});
