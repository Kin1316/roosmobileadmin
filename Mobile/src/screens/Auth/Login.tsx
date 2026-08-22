import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {useAuthStore} from '../../store/auth.store';
import {useTranslation} from 'react-i18next';
import {Datos} from '../../services/datos';
import {ApiError} from '../../services/api';
import {theme} from '../../theme';

export default function Login() {
  const {t} = useTranslation();
  const login = useAuthStore(s => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolveLoginError = (apiError: ApiError) => {
    if (apiError.kind === 'unauthenticated') {
      return t('auth.invalidCredentials');
    }

    if (apiError.kind === 'internal') {
      return t('auth.serverError');
    }

    return t('auth.genericError');
  };

  const onSubmit = async () => {
    if (loading) {
      return;
    }

    if (!username.trim() || !password) {
      setError(t('auth.invalidCredentials'));
      return;
    }

    setLoading(true);
    try {
      const sesion = await Datos.autenticar(username.trim(), password);
      setError(null);
      await login(sesion.token, sesion.username);
    } catch (rawError) {
      const apiError = rawError as ApiError;
      setError(resolveLoginError(apiError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>FK</Text>
        <Text style={styles.heading}>{t('auth.loginTitle')}</Text>
        <Text style={styles.subtitle}>Acceso seguro con una interfaz limpia y enfocada.</Text>
      </View>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder={t('auth.username')}
          placeholderTextColor={theme.colors.textSoft}
          value={username}
          onChangeText={text => {
            setUsername(text);
            if (error) setError(null);
          }}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder={t('auth.password')}
          placeholderTextColor={theme.colors.textSoft}
          value={password}
          onChangeText={text => {
            setPassword(text);
            if (error) setError(null);
          }}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.loginButton, loading ? styles.loginButtonDisabled : undefined]}
          onPress={onSubmit}
          disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? t('common.loading') : t('auth.login')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  hero: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  eyebrow: {
    fontSize: theme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
    marginBottom: 8,
    fontWeight: '700',
  },
  heading: {
    fontSize: theme.typography.title,
    lineHeight: 34,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  error: {color: theme.colors.danger, textAlign: 'center', marginBottom: 12},
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {color: theme.colors.white, fontSize: 16, fontWeight: '600'},
});
