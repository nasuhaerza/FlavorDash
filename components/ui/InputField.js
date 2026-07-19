/**
 * components/ui/InputField.js
 * Input field reusable — versi yang dijamin keyboard bisa muncul
 *
 * Perubahan kunci:
 * - Hapus pointerEvents dari View wrapper
 * - inputRow menggunakan TouchableOpacity ringan agar seluruh area
 *   bisa di-tap untuk fokus ke TextInput
 * - Tidak ada komponen apapun yang menghalangi touch ke TextInput
 */

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors from '../../constants/Colors';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType    = 'default',
  autoCapitalize  = 'none',
  autoComplete,
  textContentType,
  returnKeyType   = 'done',
  onSubmitEditing,
  blurOnSubmit,
  inputRef,
  error,
  leftIcon,
  editable = true,
  style,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused,    setIsFocused]    = useState(false);

  // Ref internal agar area bisa di-tap untuk fokus
  const internalRef = useRef(null);
  const ref = inputRef ?? internalRef;

  const secure = secureTextEntry && !showPassword;

  const shouldBlurOnSubmit =
    blurOnSubmit !== undefined ? blurOnSubmit : returnKeyType !== 'next';

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Tap seluruh baris → fokus ke TextInput */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => ref.current?.focus()}
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          !!error  && styles.inputRowError,
          !editable && styles.inputRowDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrap}>{leftIcon}</View>}

        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={shouldBlurOnSubmit}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          paddingVertical={Platform.OS === 'android' ? 10 : 0}
          // Pastikan tidak ada yang menghalangi touch
          pointerEvents="auto"
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(v => !v)}
            style={styles.rightIconWrap}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textGray}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:    { marginBottom: 16 },
  label:      { fontSize: 13, fontWeight: '600', color: Colors.secondary, marginBottom: 6 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputRowFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRowError:    { borderColor: Colors.danger },
  inputRowDisabled: { backgroundColor: Colors.background, opacity: 0.7 },

  leftIconWrap:  { marginRight: 10 },
  rightIconWrap: { marginLeft: 8, padding: 4 },

  input: { flex: 1, fontSize: 15, color: Colors.secondary },
  error: { fontSize: 12, color: Colors.danger, marginTop: 4, marginLeft: 4 },
});
