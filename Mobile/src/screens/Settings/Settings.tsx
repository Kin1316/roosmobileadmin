import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useThemeStore} from '../../store/theme.store';
import {useTranslation} from 'react-i18next';
import {theme as appTheme} from '../../theme';

export default function Settings() {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const toggleTheme = useThemeStore(s => s.toggle);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.body}>{t('settings.currentTheme', {theme})}</Text>
        <TouchableOpacity style={styles.button} onPress={toggleTheme}>
          <Text style={styles.buttonText}>{t('settings.toggleTheme')}</Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <Text style={styles.note}>{t('settings.onlySpanish')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: appTheme.spacing.lg, backgroundColor: appTheme.colors.background},
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: appTheme.spacing.lg,
    ...appTheme.shadows.card,
  },
  title: {fontSize: appTheme.typography.section, marginBottom: 12, color: appTheme.colors.text, fontWeight: '700'},
  body: {fontSize: appTheme.typography.body, color: appTheme.colors.textMuted},
  button: {
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radii.md,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: appTheme.colors.primary,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {color: appTheme.colors.white, fontSize: 15, fontWeight: '600'},
  spacer: {height: 12},
  note: {fontSize: 13, color: appTheme.colors.textSoft},
});
