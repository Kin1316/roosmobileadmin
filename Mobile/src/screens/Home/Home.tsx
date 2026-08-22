import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useAuthStore} from '../../store/auth.store';
import {useTranslation} from 'react-i18next';
import {theme} from '../../theme';

export default function Home() {
  const {t} = useTranslation();
  const logout = useAuthStore(s => s.logout);
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('home.welcome')}</Text>
        <Text style={styles.subtitle}>Panel principal con una presentación simple y formal.</Text>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  title: {fontSize: theme.typography.section, fontWeight: '700', color: theme.colors.text, marginBottom: 8},
  subtitle: {fontSize: theme.typography.body, color: theme.colors.textMuted, marginBottom: 16, lineHeight: 22},
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  buttonText: {color: theme.colors.white, fontSize: 15, fontWeight: '600'},
});
