/**
 * components/ui/LoadingSpinner.js
 * Komponen loading fullscreen dengan overlay
 */

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';

export default function LoadingSpinner({ message = 'Memuat...', overlay = false }) {
  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  inline: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textGray,
    fontWeight: '500',
  },
});
