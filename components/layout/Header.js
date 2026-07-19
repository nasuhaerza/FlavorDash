/**
 * components/layout/Header.js
 * Header reusable dengan title, back button, dan action button opsional
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function Header({
  title,
  showBack = false,
  rightIcon,
  onRightPress,
  rightBadge,
  transparent = false,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : insets.top;

  return (
    <View
      style={[
        styles.header,
        { paddingTop: paddingTop + 8 },
        transparent && styles.transparent,
      ]}
    >
      {/* Left: Back Button */}
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center: Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right: Action Icon */}
      <View style={styles.side}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconBtn}>
            <Ionicons name={rightIcon} size={24} color={Colors.secondary} />
            {rightBadge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {rightBadge > 9 ? '9+' : rightBadge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  side: {
    width: 40,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.secondary,
  },
  iconBtn: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
