/**
 * components/ui/LoadingSpinner.js
 * Loading indicator dengan beberapa varian tampilan
 *
 * Varian:
 * - overlay: fullscreen dengan background semi-transparent
 * - inline: di dalam konten (default)
 * - skeleton: placeholder berbentuk kotak abu-abu (simulasi)
 */

import { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Colors from '../../constants/Colors';

// ── Inline / Overlay Spinner ────────────────────────
export default function LoadingSpinner({
  message = 'Memuat...',
  overlay = false,
  size = 'large',
}) {
  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size={size} color={Colors.primary} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

// ── Skeleton Placeholder ─────────────────────────────
export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      {/* Gambar placeholder */}
      <View style={styles.skeletonImage} />
      {/* Teks placeholder */}
      <View style={styles.skeletonBody}>
        <View style={[styles.skeletonLine, { width: '70%' }]} />
        <View style={[styles.skeletonLine, { width: '100%', marginTop: 6 }]} />
        <View style={[styles.skeletonLine, { width: '50%', marginTop: 6 }]} />
        <View style={[styles.skeletonLine, { width: '40%', marginTop: 12 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16, padding: 28,
    alignItems: 'center', minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 8,
  },

  // Inline
  inline: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 32, gap: 12,
  },
  text: { fontSize: 14, color: Colors.textGray, fontWeight: '500' },

  // Skeleton
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16, marginVertical: 6,
    overflow: 'hidden',
    height: 100,
  },
  skeletonImage: {
    width: '32%',
    backgroundColor: Colors.border,
  },
  skeletonBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
  },
});
