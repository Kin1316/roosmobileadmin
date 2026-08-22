import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, TrabajadorData} from '../../services/datos';
import {theme} from '../../theme';

const POLL_INTERVAL_MS = 5000;

export default function Trabajadores() {
  const {t} = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [trabajadores, setTrabajadores] = useState<TrabajadorData[]>([]);
  const [rutasAsignadasPorConductor, setRutasAsignadasPorConductor] = useState<Record<number, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const activeRef = useRef(true);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    }
    try {
      const data = await Datos.getTrabajadores();
      if (activeRef.current) {
        const conductores = data.filter(item => item.tipo === 'conductor');
        const map = await Datos.getRutasAsignadasPorConductores(conductores.map(item => item.id));

        setTrabajadores(data);
        setRutasAsignadasPorConductor(map);
        setLoaded(true);
      }
    } catch {
      if (activeRef.current) {
        setLoaded(true);
      }
    } finally {
      if (activeRef.current && isManual) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    activeRef.current = true;
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, POLL_INTERVAL_MS);

    return () => {
      activeRef.current = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trabajadores}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('TrabajadorDetalle', {trabajadorId: item.id})}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.cargo}>{item.cargo}</Text>
            {item.tipo === 'conductor' ? (
              <Text style={styles.rutaAsignada}>
                {rutasAsignadasPorConductor[item.id]
                  ? t('trabajadores.assignedRouteLabel', {ruta: rutasAsignadasPorConductor[item.id]})
                  : t('trabajadores.assignedRouteNone')}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  list: {
    padding: theme.spacing.md,
    gap: 10,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cargo: {
    fontSize: 13,
    color: theme.colors.textSoft,
  },
  rutaAsignada: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
});
