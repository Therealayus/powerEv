import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { resetPassword } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { spacing, typography } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export default function ResetPasswordScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const emailFromParams = route.params?.email || '';
  const [email, setEmail] = useState(emailFromParams);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const styles = useMemo(() => StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
    title: { ...typography.h1, color: colors.text, marginTop: spacing.lg },
    subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
    form: { width: '100%' },
    input: { backgroundColor: colors.card, borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.lg, height: spacing.inputHeight, marginBottom: spacing.md, color: colors.text, borderWidth: 1, borderColor: colors.border, ...typography.body },
    btn: { marginTop: spacing.sm },
    back: { marginTop: spacing.xl, alignItems: 'center' },
    backText: { ...typography.body, color: colors.textSecondary },
  }), [colors]);

  const handleReset = async () => {
    const e = email.trim();
    if (!e || !otp.trim() || !newPassword) {
      showAlert('Error', 'Fill email, code and new password');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(e, otp.trim(), newPassword);
      showAlert('Success', 'Password reset. Sign in with your new password.', 'success', () => navigation.navigate('Login'));
    } catch (err) {
      showAlert('Error', err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.card]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Icon name="vpn-key" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>Enter the code from your email and choose a new password</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!emailFromParams}
          />
          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            placeholderTextColor={colors.textSecondary}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TextInput
            style={styles.input}
            placeholder="New password (min 6)"
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <PrimaryButton title="Reset password" onPress={handleReset} loading={loading} style={styles.btn} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.back}>
            <Text style={styles.backText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

