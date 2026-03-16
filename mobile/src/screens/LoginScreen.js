import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const styles = useMemo(() => StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    logo: { height: 40, width: 200 },
    subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.md },
    form: { width: '100%' },
    input: {
      backgroundColor: colors.card,
      borderRadius: spacing.buttonRadius,
      paddingHorizontal: spacing.lg,
      height: spacing.inputHeight,
      marginBottom: spacing.md,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      ...typography.body,
    },
    btn: { marginTop: spacing.md },
    forgot: { marginTop: spacing.sm, alignItems: 'center' },
    forgotText: { ...typography.bodySmall, color: colors.textSecondary },
    link: { marginTop: spacing.lg, alignItems: 'center', paddingVertical: spacing.sm },
    linkText: { ...typography.body, color: colors.accent },
  }), [colors]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showAlert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      showAlert('Login failed', e.response?.data?.message || e.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.card]} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Image source={require('../assets/logo-wordmark.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>Sign in to find stations and charge</Text>
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
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <PrimaryButton title="Sign In" onPress={handleLogin} loading={loading} style={styles.btn} />
          <TouchableOpacity
            style={styles.forgot}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.8}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

