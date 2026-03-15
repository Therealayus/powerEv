import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { forgotPassword } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
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

  const handleSend = async () => {
    const e = email.trim();
    if (!e) {
      Alert.alert('Error', 'Enter your email');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(e);
      Alert.alert('Check your email', 'If an account exists, a code has been sent. Enter it on the next screen.', [
        { text: 'OK', onPress: () => navigation.navigate('ResetPassword', { email: e }) },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.card]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Icon name="lock-reset" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send a reset code</Text>
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
          />
          <PrimaryButton title="Send reset code" onPress={handleSend} loading={loading} style={styles.btn} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.back}>
            <Text style={styles.backText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

