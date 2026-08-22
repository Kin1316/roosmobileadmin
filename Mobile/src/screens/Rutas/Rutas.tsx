import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, RutaData} from '../../services/datos';
import {theme} from '../../theme';

type RouteStatus = 'completed' | 'alert' | 'basic';

export default function Rutas() {
  const {t} = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [routes, setRoutes] = useState<RutaData[]>([]);

  const loadRoutes = useCallback(async () => {
    try {
      const routeItems = await Datos.getRutas();
      setRoutes(routeItems);
    } catch {
      setRoutes([]);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadRoutesSafe = async () => {
      try {
        const routeItems = await Datos.getRutas();
        if (active) {
          setRoutes(routeItems);
        }
      } catch {
        if (active) {
          setRoutes([]);
        }
      }
    };

    loadRoutesSafe();

    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRoutes();
      return () => {};
    }, [loadRoutes]),
  );

  const getRouteStatus = (route: RutaData): RouteStatus => {
    if (route.destinosCompletados > 0 && route.destinosPendientes === 0) {
      return 'completed';
    }
    if (route.destinosCancelados > 0) {
      return 'alert';
    }
    return 'basic';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {routes.map(route => {
          const status = getRouteStatus(route);
          const statusBadgeStyle =
            status === 'completed' ? styles.statusCompleted : status === 'alert' ? styles.statusAlert : styles.statusBasic;
          const statusLabel =
            status === 'completed' ? t('rutas.statusCompleted') : status === 'alert' ? t('rutas.statusAlert') : t('rutas.statusBasic');

          return (
            <TouchableOpacity
              key={route.id}
              style={styles.item}
              onPress={() => {
                navigation.navigate('RutaDetalle', {routeId: route.id});
              }}>
              <View style={styles.headerRow}>
                <Text style={styles.routeName}>{route.nombre}</Text>
                <View style={[styles.statusBadge, statusBadgeStyle]}>
                  <Text style={styles.statusText}>{statusLabel}</Text>
                </View>
              </View>

              <Text style={styles.driverText}>
                {t('rutas.assignedDriver')}: {route.conductor || t('rutas.unassignedDriver')}
              </Text>
              <Text style={styles.vehicleText}>
                {t('rutas.assignedVehicle')}: {route.vehiculoAsignado || t('rutas.unassignedVehicle')}
              </Text>

              <View style={styles.summaryRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{route.destinosCompletados}</Text>
                  <Text style={styles.metricLabel}>{t('rutas.completedDestinations')}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{route.destinosPendientes}</Text>
                  <Text style={styles.metricLabel}>{t('rutas.pendingDestinations')}</Text>
                </View>
                <View style={[styles.metricBox, styles.metricBoxLast]}>
                  <Text style={styles.metricValue}>{route.destinosCompletados + route.destinosPendientes}</Text>
                  <Text style={styles.metricLabel}>{t('rutas.totalDestinations')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md},
  listContent: {paddingBottom: 20},
  item: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    ...theme.shadows.soft,
  },
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6},
  routeName: {fontSize: 16, fontWeight: '700', color: theme.colors.text},
  statusBadge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.radii.pill},
  statusCompleted: {backgroundColor: theme.colors.success},
  statusAlert: {backgroundColor: theme.colors.warning},
  statusBasic: {backgroundColor: theme.colors.primarySoft},
  statusText: {fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase'},
  driverText: {fontSize: 13, color: theme.colors.textMuted, marginBottom: 10},
  vehicleText: {fontSize: 13, color: theme.colors.textMuted, marginBottom: 10},
  summaryRow: {flexDirection: 'row'},
  metricBox: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  metricValue: {fontSize: 16, fontWeight: '700', color: theme.colors.text},
  metricLabel: {fontSize: 11, color: theme.colors.textSoft, textAlign: 'center'},
  metricBoxLast: {marginRight: 0},
});
