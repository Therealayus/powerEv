import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { sendVerificationOtp, verifyEmail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export default function VerifyEmailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const emailFromParams = route.params?.email || '';
  const [email, setEmail] = useState(emailFromParams);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { completeVerification } = useAuth();
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
    resend: { marginTop: spacing.lg, alignItems: 'center' },
    resendText: { ...typography.body, color: colors.accent },
    back: { marginTop: spacing.md, alignItems: 'center' },
    backText: { ...typography.bodySmall, color: colors.textSecondary },
  }), [colors]);

  const handleVerify = async () => {
    const e = email.trim();
    if (!e || !otp.trim()) {
      Alert.alert('Error', 'Enter email and 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { data } = await verifyEmail(e, otp.trim());
      await completeVerification({ token: data.token, user: data.user });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const e = email.trim();
    if (!e) {
      Alert.alert('Error', 'Enter your email');
      return;
    }
    setResendLoading(true);
    try {
      await sendVerificationOtp(e);
      Alert.alert('Sent', 'New code sent to your email');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.card]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Icon name="mark-email-read" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to your email</Text>
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
          <PrimaryButton title="Verify" onPress={handleVerify} loading={loading} style={styles.btn} />
          <TouchableOpacity onPress={handleResend} disabled={resendLoading} style={styles.resend}>
            <Text style={styles.resendText}>{resendLoading ? 'Sending...' : 'Resend code'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.back}>
            <Text style={styles.backText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

