import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {AccionRuta, Datos, RutaData} from '../../services/datos';
import {theme} from '../../theme';

type RutaMasInformacionRouteProp = RouteProp<RootStackParamList, 'RutaMasInformacion'>;

export default function RutaMasInformacion() {
  const {t} = useTranslation();
  const route = useRoute<RutaMasInformacionRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [routeInfo, setRouteInfo] = useState<RutaData | null>(null);
  const [acciones, setAcciones] = useState<AccionRuta[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const [ruta, accionesData] = await Promise.all([
        Datos.getRutaById(route.params.routeId),
        Datos.getRutaAcciones(),
      ]);

      if (active) {
        setRouteInfo(ruta);
        setAcciones(accionesData);
        setLoaded(true);
      }
    };

    loadData().catch(() => {
      if (active) {
        setRouteInfo(null);
        setAcciones([]);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, [route.params.routeId]);

  const routeName = routeInfo?.nombre ?? t('rutas.notFound');

  const handleAccion = async (
    messageKey: 'rutas.showEvidenceMessage' | 'rutas.truckStatusMessage' | 'rutas.canceledDestinationsMessage',
    accionId: number,
  ) => {
    if (accionId === 1) {
      navigation.navigate('RutaEvidencias', {routeId: route.params.routeId});
      return;
    }

    if (accionId === 2) {
      const vehiculo = await Datos.getVehiculoAsignadoPorRutaId(route.params.routeId);
      if (vehiculo) {
        navigation.navigate('VehiculoEstado', {vehiculoId: vehiculo.id});
        return;
      }

      Alert.alert(t('rutas.moreInfo'), t('rutas.noAssignedVehicleMessage', {route: routeName}));
      return;
    }

    if (accionId === 3) {
      navigation.navigate('RutaDestinosCancelados', {routeId: route.params.routeId});
      return;
    }

    Alert.alert(t('rutas.moreInfo'), t(messageKey, {route: routeName}));
  };

  if (!loaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Acciones</Text>
      <Text style={styles.title}>{t('rutas.moreInfo')}</Text>
      <Text style={styles.subtitle}>{routeName}</Text>

      <View style={styles.actions}>
        {acciones.map(action => (
          <TouchableOpacity key={action.id} style={styles.primaryButton} onPress={() => {
            handleAccion(action.messageKey, action.id).catch(() => {
              Alert.alert(t('rutas.moreInfo'), t(action.messageKey, {route: routeName}));
            });
          }}>
            <Text style={styles.primaryButtonText}>{t(action.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md, justifyContent: 'center'},
  eyebrow: {fontSize: theme.typography.caption, fontWeight: '700', textAlign: 'center', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8},
  title: {fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8, color: theme.colors.text},
  subtitle: {fontSize: 16, textAlign: 'center', color: theme.colors.textSoft, marginBottom: 20},
  actions: {gap: 12},
  primaryButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  primaryButtonText: {color: theme.colors.text, fontSize: 16, fontWeight: '600'},
});
