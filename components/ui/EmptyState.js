/**
 * components/ui/EmptyState.js
 * Komponen untuk tampilan kosong / error state
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

export default function EmptyState({
  icon = 'alert-circle-outline',
  emoji,
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      {emoji ? (
        <Text style={styles.emoji}>{emoji}</Text>
      ) : (
        <Ionicons name={icon} size={56} color={Colors.textLight} />
      )}
      {title   && <Text style={styles.title}>{title}</Text>}
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.btn} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 10,
  },
  emoji: { fontSize: 56 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 21,
  },
  btn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
