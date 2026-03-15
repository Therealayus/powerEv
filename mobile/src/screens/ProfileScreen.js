import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { spacing, typography } from '../theme';
import {
  getProfile,
  uploadProfilePhoto,
  deleteAccount,
  getUploadBase,
} from '../services/api';

const CONNECTOR_OPTIONS = ['', 'Bharat AC', 'Bharat DC', 'CCS 2', 'CHAdeMO', 'Type 2 AC'];

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, refreshUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data);
      await refreshUser();
    } catch {
      setProfile(user ? { ...user } : null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
    else setProfile(null);
  }, [user?._id]);

  useEffect(() => {
    const unsub = navigation.addListener?.('focus', () => {
      if (user) fetchProfile();
    });
    return () => unsub?.();
  }, [navigation, user?._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handlePhotoPress = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true, maxWidth: 800, maxHeight: 800, quality: 0.8 },
      async (res) => {
        if (res.didCancel || !res.assets?.[0]?.base64) return;
        setUploadingPhoto(true);
        try {
          const base64 = `data:image/jpeg;base64,${res.assets[0].base64}`;
          const { data } = await uploadProfilePhoto(base64);
          setProfile(data);
          await refreshUser();
        } catch (e) {
          Alert.alert('Upload failed', e.response?.data?.message || 'Could not upload photo');
        } finally {
          setUploadingPhoto(false);
        }
      }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all data. You cannot undo this.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await logout();
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Could not delete account');
            }
          },
        },
      ]
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1 },
        photoWrap: {
          alignItems: 'center',
          paddingVertical: spacing.xl,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        avatarWrap: {
          position: 'relative',
          marginBottom: spacing.sm,
        },
        avatar: { width: 96, height: 96, borderRadius: 48 },
        avatarPlaceholder: {
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: colors.border,
        },
        avatarIcon: { fontSize: 40, color: colors.textSecondary },
        changePhoto: {
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        name: { ...typography.h2, color: colors.text, marginTop: spacing.sm },
        email: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
        section: { padding: spacing.lg },
        sectionTitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase' },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        rowLabel: { ...typography.bodySmall, color: colors.textSecondary, width: 120 },
        rowValue: { flex: 1, ...typography.body, color: colors.text },
        linkRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        linkText: { ...typography.body, color: colors.text },
        linkIcon: { color: colors.textSecondary },
        dangerRow: { marginTop: spacing.xl, paddingVertical: spacing.md },
        dangerText: { ...typography.body, color: colors.error },
        logoutBtn: {
          marginTop: spacing.lg,
          marginHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          alignItems: 'center',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
        logoutText: { ...typography.body, color: colors.textSecondary },
      }),
    [colors]
  );

  if (loading && !profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const photoUri = profile?.profilePhoto
    ? (profile.profilePhoto.startsWith('http') ? profile.profilePhoto : getUploadBase() + profile.profilePhoto)
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.photoWrap}>
        <TouchableOpacity style={styles.avatarWrap} onPress={handlePhotoPress} disabled={uploadingPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" style={styles.avatarIcon} />
            </View>
          )}
          {uploadingPhoto ? (
            <View style={styles.changePhoto}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <View style={styles.changePhoto}>
              <Icon name="camera-alt" size={18} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{profile?.name || user?.name || '—'}</Text>
        <Text style={styles.email}>{profile?.email || user?.email || '—'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Charging info (India)</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Phone</Text>
          <Text style={styles.rowValue}>{profile?.phone || 'Not set'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Vehicle no.</Text>
          <Text style={styles.rowValue}>{profile?.vehicleNumber || 'Not set'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Connector</Text>
          <Text style={styles.rowValue}>{profile?.connectorType || 'Not set'}</Text>
        </View>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('EditProfile', { profile })}
        >
          <Text style={styles.linkText}>Edit profile & charging info</Text>
          <Icon name="chevron-right" size={24} style={styles.linkIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.linkText}>Terms & Conditions</Text>
          <Icon name="chevron-right" size={24} style={styles.linkIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Feedback')}>
          <Text style={styles.linkText}>Send feedback</Text>
          <Icon name="chevron-right" size={24} style={styles.linkIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.linkRow} onPress={handleDeleteAccount}>
          <Text style={[styles.linkText, { color: colors.error }]}>Delete account</Text>
          <Icon name="chevron-right" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
