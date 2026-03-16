import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { submitFeedback } from '../services/api';
import { spacing, typography } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export default function FeedbackScreen({ navigation }) {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
        title: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
        subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
        label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
        input: {
          backgroundColor: colors.card,
          borderRadius: 8,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          minHeight: 120,
          marginBottom: spacing.lg,
          color: colors.text,
          borderWidth: 1,
          borderColor: colors.border,
          ...typography.body,
          textAlignVertical: 'top',
        },
        starsRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.xl },
        starBtn: { padding: 4 },
        btn: { marginTop: spacing.sm },
      }),
    [colors]
  );

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      showAlert('Message required', 'Please enter your feedback to help us improve.', 'info');
      return;
    }
    setSending(true);
    try {
      await submitFeedback({ message: trimmed, rating: rating || undefined });
      showAlert('Thank you', 'Your feedback has been sent. We use it to improve our services.', 'success', () => navigation.goBack());
    } catch (e) {
      showAlert('Error', e.response?.data?.message || 'Could not send feedback');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Send feedback</Text>
        <Text style={styles.subtitle}>Your feedback helps us improve charging services for you.</Text>
        <Text style={styles.label}>How would you rate your experience? (optional)</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} style={styles.starBtn} onPress={() => setRating(n)}>
              <Icon name={rating >= n ? 'star' : 'star-border'} size={36} color={rating >= n ? colors.warning : colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Your feedback *</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Tell us what we can improve..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <PrimaryButton title="Send feedback" onPress={handleSubmit} loading={sending} style={styles.btn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
