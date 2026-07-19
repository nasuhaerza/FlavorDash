/**
 * app/camera/index.js
 * Halaman Kamera — Bukti Penerimaan Pesanan
 *
 * Fitur:
 * - Request permission kamera sebelum membuka kamera
 * - Ambil foto bukti penerimaan pesanan
 * - Preview hasil foto
 * - Simpan foto dan kembali ke halaman sebelumnya
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams(); // orderId dari halaman pesanan

  const [permission, requestPermission] = useCameraPermissions();
  const [facing,  setFacing]  = useState('back');
  const [photo,   setPhoto]   = useState(null);
  const [taking,  setTaking]  = useState(false);
  const cameraRef = useRef(null);

  // ── Belum ada permission ──────────────────────────────
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // ── Permission ditolak ────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { paddingTop: insets.top + 16 }]}>
        {/* Header */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.secondary} />
        </TouchableOpacity>

        <View style={styles.permissionBody}>
          <Text style={styles.permissionIcon}>📸</Text>
          <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
          <Text style={styles.permissionText}>
            FlavorDash membutuhkan akses kamera untuk mengambil foto bukti
            penerimaan pesanan Anda.
          </Text>
          <TouchableOpacity
            style={styles.grantBtn}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={18} color="#fff" />
            <Text style={styles.grantBtnText}>Izinkan Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelTextBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Ambil foto ────────────────────────────────────────
  async function takePicture() {
    if (!cameraRef.current || taking) return;
    setTaking(true);
    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        skipProcessing: Platform.OS === 'android',
      });
      setPhoto(result.uri);
    } catch (e) {
      console.warn('Gagal capture:', e);
    } finally {
      setTaking(false);
    }
  }

  // ── Setelah foto diambil: Preview ─────────────────────
  if (photo) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="cover" />

        {/* Overlay info */}
        <View style={[styles.previewOverlay, { paddingTop: insets.top + 8 }]}>
          <View style={styles.previewHeader}>
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={() => setPhoto(null)}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.previewBtnText}>Ulangi</Text>
            </TouchableOpacity>

            <View style={styles.previewCenter}>
              <Text style={styles.previewLabel}>Bukti Penerimaan</Text>
              {params?.orderId && (
                <Text style={styles.previewOrderId}>{params.orderId}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.previewBtn, styles.previewBtnPrimary]}
              onPress={() => {
                // Kembali ke halaman pesanan dengan membawa URI foto
                router.back();
              }}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.previewBtnText}>Gunakan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Watermark / Keterangan */}
        <View style={[styles.previewFooter, { paddingBottom: insets.bottom + 16 }]}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
          <Text style={styles.previewFooterText}>
            Foto ini akan digunakan sebagai bukti penerimaan pesanan
          </Text>
        </View>
      </View>
    );
  }

  // ── Camera View ───────────────────────────────────────
  return (
    <View style={styles.root}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* ── Top Bar ────────────────────────── */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={styles.topTitle}>Foto Bukti Pesanan</Text>
            {params?.orderId && (
              <Text style={styles.topSubtitle}>{params.orderId}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          >
            <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Frame Guide ────────────────────── */}
        <View style={styles.frameGuide}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Text style={styles.frameText}>Arahkan kamera ke bukti pesanan</Text>
        </View>

        {/* ── Bottom Controls ─────────────────── */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
          {/* Spacer kiri */}
          <View style={styles.sideControl} />

          {/* Shutter button */}
          <TouchableOpacity
            style={[styles.shutterOuter, taking && styles.shutterDisabled]}
            onPress={takePicture}
            disabled={taking}
            activeOpacity={0.85}
          >
            {taking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>

          {/* Flash toggle (placeholder) */}
          <View style={styles.sideControl}>
            <TouchableOpacity style={styles.iconCircleSmall}>
              <Ionicons name="flash-off-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Permission
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  closeBtn: { padding: 4, alignSelf: 'flex-start' },
  permissionBody: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  permissionIcon:  { fontSize: 72 },
  permissionTitle: { fontSize: 22, fontWeight: '800', color: Colors.secondary, textAlign: 'center' },
  permissionText:  { fontSize: 14, color: Colors.textGray, textAlign: 'center', lineHeight: 22 },
  grantBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 14, marginTop: 8,
  },
  grantBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelTextBtn: { padding: 8 },
  cancelText:    { fontSize: 14, color: Colors.textGray },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topCenter:   { alignItems: 'center' },
  topTitle:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  topSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Frame guide
  frameGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28, height: 28,
    borderColor: '#fff',
    opacity: 0.8,
  },
  cornerTL: { top: '20%', left: '10%', borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: '20%', right: '10%', borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: '20%', left: '10%', borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: '20%', right: '10%', borderBottomWidth: 3, borderRightWidth: 3 },
  frameText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: '45%',
  },

  // Bottom controls
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  sideControl:       { width: 50, alignItems: 'center' },
  iconCircleSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterOuter: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#fff',
  },
  shutterDisabled: { opacity: 0.5 },

  // Preview
  previewContainer: { flex: 1, backgroundColor: '#000' },
  previewImage:     { ...StyleSheet.absoluteFillObject },
  previewOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  previewHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewCenter:       { alignItems: 'center' },
  previewLabel:        { color: '#fff', fontWeight: '700', fontSize: 14 },
  previewOrderId:      { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  previewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  previewBtnPrimary:   { backgroundColor: Colors.primary },
  previewBtnText:      { color: '#fff', fontSize: 13, fontWeight: '600' },
  previewFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 10,
    paddingHorizontal: 16,
  },
  previewFooterText: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
});
