import React, {useEffect, useState} from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuthStore} from '../store/auth.store';
import type {RootStackParamList} from '../navigation/RootNavigator';
import {Datos, OpcionMenu} from '../services/datos';
import {theme} from '../theme';

const SIDEBAR_WIDTH = 268;
const BAR_HEIGHT = 48;

interface DashboardBarProps {
  onMenuPress: () => void;
}

export default function DashboardBar({onMenuPress}: DashboardBarProps) {
  const {t} = useTranslation();
  const logout = useAuthStore(s => s.logout);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [visible, setVisible] = useState(false);
  const [menuItems, setMenuItems] = useState<OpcionMenu[]>([]);
  const [translateX] = useState(() => new Animated.Value(-SIDEBAR_WIDTH));
  const [overlayOpacity] = useState(() => new Animated.Value(0));
  const [itemsProgress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    Datos.getMenuItems()
      .then(items => {
        if (active) {setMenuItems(items);}
      })
      .catch(() => {
        if (active) {setMenuItems([]);}
      });
    return () => {
      active = false;
    };
  }, []);

  const openSidebar = () => {
    setVisible(true);
    itemsProgress.setValue(0);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(itemsProgress, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -SIDEBAR_WIDTH,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(itemsProgress, {
        toValue: 0,
        duration: 120,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  const handleMenuItemPress = (item: OpcionMenu) => {
    closeSidebar();
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={openSidebar}
          accessibilityLabel="Abrir menú lateral">
          <View style={styles.hamburger}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.action} onPress={onMenuPress}>
          <Text style={styles.actionText}>Menú</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.action} onPress={logout}>
          <Text style={styles.actionText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}>
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.overlay, {opacity: overlayOpacity}]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar} />
          </Animated.View>
          <Animated.View style={[styles.sidebar, {transform: [{translateX}]}]}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Navegacion</Text>
              <Text style={styles.sidebarSubtitle}>Accesos principales</Text>
            </View>
            {menuItems.map(item => (
              <Animated.View
                key={item.id}
                style={[
                  styles.itemAnimatedWrapper,
                  {
                    opacity: itemsProgress.interpolate({
                      inputRange: [
                        Math.min(0.7, (item.id - 1) * 0.12),
                        Math.min(1, 0.35 + (item.id - 1) * 0.12),
                      ],
                      outputRange: [0, 1],
                      extrapolate: 'clamp',
                    }),
                    transform: [
                      {
                        translateX: itemsProgress.interpolate({
                          inputRange: [
                            Math.min(0.7, (item.id - 1) * 0.12),
                            Math.min(1, 0.35 + (item.id - 1) * 0.12),
                          ],
                          outputRange: [-18, 0],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}>
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleMenuItemPress(item)}
                  disabled={!item.screen}>
                  <Text
                    style={[
                      styles.itemText,
                      !item.screen ? styles.itemTextMuted : undefined,
                    ]}>
                    {t(item.labelKey)}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  hamburgerBtn: {
    width: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburger: {
    gap: 4,
  },
  hamburgerLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.text,
  },
  divider: {
    width: 1,
    backgroundColor: theme.colors.border,
    alignSelf: 'stretch',
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    paddingTop: 64,
    paddingHorizontal: theme.spacing.sm,
  },
  sidebarHeader: {
    paddingHorizontal: 10,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sidebarSubtitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: theme.radii.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primarySoft,
    backgroundColor: theme.colors.surfaceMuted,
  },
  itemAnimatedWrapper: {
    width: '100%',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  itemTextMuted: {
    color: theme.colors.textSoft,
  },
});
