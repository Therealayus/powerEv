import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('EV');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const styles = useMemo(() => StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingVertical: spacing.xxl },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    logo: { height: 40, width: 200 },
    titleWrap: { marginTop: spacing.md },
    title: { ...typography.h1, color: colors.text, textAlign: 'center' },
    subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
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
    link: { marginTop: spacing.xl, alignItems: 'center', paddingVertical: spacing.sm },
    linkText: { ...typography.body, color: colors.accent },
  }), [colors]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill name, email and password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await register(name.trim(), email.trim(), password, vehicleType);
      if (data?.email) navigation.navigate('VerifyEmail', { email: data.email });
    } catch (e) {
      Alert.alert('Registration failed', e.response?.data?.message || e.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.card]} style={styles.gradient}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image source={require('../assets/logo-wordmark.png')} style={styles.logo} resizeMode="contain" />
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Join to find stations and charge</Text>
            </View>
          </View>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6)"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle type (e.g. EV, Tesla)"
              placeholderTextColor={colors.textSecondary}
              value={vehicleType}
              onChangeText={setVehicleType}
            />
            <PrimaryButton title="Sign Up" onPress={handleRegister} loading={loading} style={styles.btn} />
            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

