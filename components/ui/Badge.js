/**
 * components/ui/Badge.js
 * Badge label kecil untuk menandai status makanan (New, Popular, Healthy, dll)
 */

import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';

const BADGE_CONFIG = {
  new: { label: '✨ Baru', bg: Colors.badge.new },
  popular: { label: '🔥 Populer', bg: Colors.badge.popular },
  healthy: { label: '🥗 Sehat', bg: Colors.badge.healthy },
  spicy: { label: '🌶️ Pedas', bg: Colors.badge.spicy },
};

export default function Badge({ type }) {
  if (!type || !BADGE_CONFIG[type]) return null;
  const { label, bg } = BADGE_CONFIG[type];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
