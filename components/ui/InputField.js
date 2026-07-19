/**
 * components/ui/InputField.js
 * Input field reusable dengan label, icon, error message, dan password toggle
 *
 * Perbaikan keyboard:
 * - returnKeyType untuk tombol Done/Next/Go di keyboard
 * - onSubmitEditing callback saat user tekan tombol keyboard
 * - blurOnSubmit untuk dismiss keyboard otomatis
 * - textContentType untuk iOS autofill (email, password)
 * - autoComplete untuk Android autofill
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,           // Android autofill: 'email' | 'password' | 'current-password'
  textContentType,        // iOS autofill: 'emailAddress' | 'password' | 'newPassword'
  returnKeyType = 'done', // 'done' | 'next' | 'go' | 'search' | 'send'
  onSubmitEditing,        // callback saat tombol keyboard ditekan
  blurOnSubmit,           // dismiss keyboard setelah submit (default true kecuali ada next field)
  inputRef,               // ref untuk fokus antar field (field chaining)
  error,
  leftIcon,
  editable = true,
  style,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = secureTextEntry;
  const secure = isPassword && !showPassword;

  // Default blurOnSubmit: true jika tidak ada next field, false jika ada
  const shouldBlurOnSubmit = blurOnSubmit !== undefined
    ? blurOnSubmit
    : returnKeyType !== 'next';

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Input Row */}
      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          !!error && styles.inputRowError,
          !editable && styles.inputRowDisabled,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIconWrap}>{leftIcon}</View>}

        <TextInput
          ref={inputRef}
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
          // Padding vertikal konsisten lintas platform
          paddingVertical={Platform.OS === 'android' ? 10 : 0}
        />

        {/* Password Toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.rightIconWrap}
            // Jangan dismiss keyboard saat toggle password
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textGray}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 6,
  },
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
  inputRowError: {
    borderColor: Colors.danger,
  },
  inputRowDisabled: {
    backgroundColor: Colors.background,
    opacity: 0.7,
  },
  leftIconWrap: {
    marginRight: 10,
  },
  rightIconWrap: {
    marginLeft: 8,
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.secondary,
  },
  error: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});
