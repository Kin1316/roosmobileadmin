import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {useAuthStore} from '../../store/auth.store';
import {Datos, OpcionMenu} from '../../services/datos';
import {theme} from '../../theme';

export default function Menu() {
  const {t} = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const username = useAuthStore(s => s.username);
  const [items, setItems] = useState<OpcionMenu[]>([]);

  useEffect(() => {
    let active = true;

    const loadMenu = async () => {
      const menuItems = await Datos.getMenuItems();
      if (active) {
        setItems(menuItems);
      }
    };

    loadMenu().catch(() => {
      if (active) {
        setItems([]);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Panel</Text>
      <Text style={styles.welcome}>{t('menu.welcomeUser', {user: username ?? t('auth.username')})}</Text>
      <Text style={styles.subtitle}>Accede a cada modulo desde tarjetas limpias y uniformes.</Text>
      <View style={styles.contentBottom}>
        <View style={styles.grid}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.button,
                items.length % 2 !== 0 && index === items.length - 1 ? styles.buttonFull : undefined,
              ]}
              onPress={() => {
                if (item.screen) {
                  navigation.navigate(item.screen);
                }
              }}>
              <Text style={styles.buttonText}>{t(item.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.background},
  eyebrow: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  welcome: {fontSize: theme.typography.section, fontWeight: '700', marginBottom: 8, textAlign: 'center', color: theme.colors.text},
  subtitle: {fontSize: theme.typography.body, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 18},
  contentBottom: {flex: 1, justifyContent: 'center'},
  grid: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    width: '46%',
    height: 120,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    ...theme.shadows.card,
  },
  buttonFull: {
    width: '94%',
  },
  buttonText: {fontSize: 16, fontWeight: '600', color: theme.colors.text},
});
