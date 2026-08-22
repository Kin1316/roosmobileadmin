import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute, RouteProp, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, RutaData} from '../../services/datos';
import {theme} from '../../theme';

type RutaDetalleRouteProp = RouteProp<RootStackParamList, 'RutaDetalle'>;

export default function RutaDetalle() {
  const {t} = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RutaDetalleRouteProp>();
  const [routeInfo, setRouteInfo] = useState<RutaData | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadRoute = useCallback(async () => {
    const ruta = await Datos.getRutaById(route.params.routeId);
    setRouteInfo(ruta);
    setLoaded(true);
  }, [route.params.routeId]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const ruta = await Datos.getRutaById(route.params.routeId);
        if (active) {
          setRouteInfo(ruta);
          setLoaded(true);
        }
      } catch {
        if (active) {
          setRouteInfo(null);
          setLoaded(true);
        }
      }
    };

    run().catch(() => {
      if (active) {
        setRouteInfo(null);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, [route.params.routeId]);

  useFocusEffect(
    React.useCallback(() => {
      loadRoute().catch(() => {
        setRouteInfo(null);
      });
      return () => {};
    }, [loadRoute]),
  );

  if (!loaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!routeInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('rutas.notFound')}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>{t('rutas.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routeInfo.nombre}</Text>

      <View style={styles.card}>
        {routeInfo.conductor ? (
          <>
            <Text style={styles.label}>{t('rutas.driver')}</Text>
            <Text style={styles.value}>{routeInfo.conductor}</Text>
          </>
        ) : null}

        <Text style={styles.label}>{t('rutas.lastDestination')}</Text>
        <Text style={styles.value}>{routeInfo.ultimoDestino}</Text>

        <Text style={styles.label}>{t('rutas.pendingDestinations')}</Text>
        <Text style={styles.value}>{routeInfo.destinosPendientes}</Text>
      </View>

      <View style={styles.assignCard}>
        <Text style={styles.assignTitle}>{t('rutas.assignDriverTitle')}</Text>
        <Text style={styles.assignHint}>{t('rutas.assignDriverHint')}</Text>
        <TouchableOpacity
          style={styles.assignOpenButton}
          onPress={() => navigation.navigate('RutaAsignarConductor', {routeId: routeInfo.id})}>
          <Text style={styles.assignOpenButtonText}>{t('rutas.assignDriverOpen')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>{t('rutas.back')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('RutaMasInformacion', {routeId: routeInfo.id})}>
          <Text style={styles.primaryButtonText}>{t('rutas.moreInfo')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md, justifyContent: 'center'},
  title: {fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: theme.colors.text},
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  label: {fontSize: 14, color: theme.colors.textSoft, marginTop: 8},
  value: {fontSize: 18, fontWeight: '600', marginBottom: 8, color: theme.colors.text},
  assignCard: {
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  assignTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  assignHint: {
    fontSize: 13,
    color: theme.colors.textSoft,
  },
  assignOpenButton: {
    marginTop: 10,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  assignOpenButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {marginTop: 18, gap: 10},
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  primaryButtonText: {color: theme.colors.white, fontSize: 16, fontWeight: '600'},
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  secondaryButtonText: {fontSize: 16, fontWeight: '600', color: theme.colors.text},
});
