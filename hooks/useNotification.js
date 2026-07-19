/**
 * hooks/useNotification.js
 * Custom hook untuk notifikasi in-app sederhana
 * (toast/snackbar tanpa library tambahan)
 *
 * Penggunaan:
 *   const { notify, NotificationView } = useNotification();
 *   notify('Berhasil ditambahkan!', 'success');
 *   return <View>...<NotificationView /></View>
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import Colors from '../constants/Colors';

const TYPE_CONFIG = {
  success: { color: Colors.success, icon: 'checkmark-circle' },
  error:   { color: Colors.danger,  icon: 'alert-circle'     },
  info:    { color: Colors.info,    icon: 'information-circle' },
  warning: { color: Colors.warning, icon: 'warning'           },
};

export function useNotification() {
  const [message, setMessage]   = useState('');
  const [type,    setType]       = useState('info');
  const [visible, setVisible]    = useState(false);
  const opacity   = useRef(new Animated.Value(0)).current;
  const timerRef  = useRef(null);

  const notify = useCallback((msg, notifType = 'info', duration = 2500) => {
    // Batalkan timer sebelumnya jika ada
    if (timerRef.current) clearTimeout(timerRef.current);

    setMessage(msg);
    setType(notifType);
    setVisible(true);

    // Fade in
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setVisible(false);
      });
    }, duration);
  }, [opacity]);

  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  function NotificationView() {
    if (!visible) return null;
    return (
      <Animated.View style={[styles.container, { opacity, borderLeftColor: config.color }]}>
        <Ionicons name={config.icon} size={18} color={config.color} />
        <Text style={styles.text} numberOfLines={2}>{message}</Text>
      </Animated.View>
    );
  }

  return { notify, NotificationView };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
});
