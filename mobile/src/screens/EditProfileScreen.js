import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { updateProfile } from '../services/api';
import { spacing, typography } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

const CONNECTOR_OPTIONS = ['', 'Bharat AC', 'Bharat DC', 'CCS 2', 'CHAdeMO', 'Type 2 AC'];

export default function EditProfileScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { profile } = route.params || {};
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [vehicleNumber, setVehicleNumber] = useState(profile?.vehicleNumber ?? '');
  const [connectorType, setConnectorType] = useState(profile?.connectorType ?? '');
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
        label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
        input: {
          backgroundColor: colors.card,
          borderRadius: 8,
          paddingHorizontal: spacing.md,
          height: 48,
          marginBottom: spacing.lg,
          color: colors.text,
          borderWidth: 1,
          borderColor: colors.border,
          ...typography.body,
        },
        pickerWrap: {
          backgroundColor: colors.card,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: spacing.lg,
        },
        pickerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: 14,
        },
        pickerValue: { ...typography.body, color: colors.text },
        options: { borderTopWidth: 1, borderTopColor: colors.border },
        option: { paddingHorizontal: spacing.md, paddingVertical: 12 },
        optionText: { ...typography.body, color: colors.text },
        btn: { marginTop: spacing.md },
      }),
    [colors]
  );

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        vehicleNumber: vehicleNumber.trim(),
        connectorType: connectorType || '',
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
        />
        <Text style={styles.label}>Phone (for charging in India)</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g. +91 98765 43210"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Vehicle registration number</Text>
        <TextInput
          style={styles.input}
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          placeholder="e.g. MH 12 AB 1234"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="characters"
        />
        <Text style={styles.label}>Connector type (India)</Text>
        <View style={styles.pickerWrap}>
          <TouchableOpacity style={styles.pickerRow} onPress={() => setPickerOpen(!pickerOpen)}>
            <Text style={styles.pickerValue}>{connectorType || 'Select connector'}</Text>
            <Icon name={pickerOpen ? 'expand-less' : 'expand-more'} size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          {pickerOpen && (
            <View style={styles.options}>
              {CONNECTOR_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt || 'none'}
                  style={styles.option}
                  onPress={() => {
                    setConnectorType(opt);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{opt || 'Not set'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <PrimaryButton title="Save" onPress={handleSave} loading={saving} style={styles.btn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
