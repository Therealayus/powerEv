import React, { useState, useEffect, useMemo } from 'react';
import { Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import { getTerms } from '../services/api';

const FALLBACK_TERMS = `
EV Charging – Terms and Conditions

Last updated: 2025

1. Acceptance
By using the EV Charging app and services, you agree to these Terms and Conditions. If you do not agree, please do not use the app.

2. Use of charging stations
• You must use charging stations in accordance with the station owner's rules and local laws.
• You are responsible for your vehicle and any damage caused during charging.
• Charging fees are as displayed at the station and in the app at the time of use.

3. Account and data
• You must provide accurate information, including contact and vehicle/charging details required for use in India (e.g. phone number, vehicle registration, connector type).
• We may store and process your data as described in our Privacy Policy.
• You can delete your account at any time from Profile → Delete account.

4. Prohibited use
You may not use the app to violate any law, harm others, or misuse the charging network. We may suspend or terminate your account for breach.

5. Disclaimer
Charging services are provided by third-party station operators. We are not liable for availability, quality, or safety of charging equipment beyond what we reasonably control.

6. Changes
We may update these terms. Continued use of the app after changes means you accept the updated terms.

7. Contact
For questions, use the in-app "Send feedback" option or contact support.
`;

export default function TermsScreen() {
  const { colors } = useTheme();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTerms()
      .then(({ data }) => {
        if (!cancelled && data?.content) setContent(data.content);
      })
      .catch(() => {
        if (!cancelled) setContent(FALLBACK_TERMS.trim());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
        text: { ...typography.body, color: colors.text, lineHeight: 24 },
      }),
    [colors]
  );

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={[styles.scroll, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScrollView>
    );
  }

  const displayContent = content?.trim() || FALLBACK_TERMS.trim();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.text}>{displayContent}</Text>
    </ScrollView>
  );
}
