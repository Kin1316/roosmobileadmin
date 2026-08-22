 import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RouteProp, useRoute} from '@react-navigation/native';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, VehiculoData, VehiculoEstadoData} from '../../services/datos';
import {theme} from '../../theme';

type VehiculoEstadoRouteProp = RouteProp<RootStackParamList, 'VehiculoEstado'>;

export default function VehiculoEstado() {
  const {t} = useTranslation();
  const route = useRoute<VehiculoEstadoRouteProp>();

  const [vehiculo, setVehiculo] = useState<VehiculoData | null>(null);
  const [estado, setEstado] = useState<VehiculoEstadoData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const loadEstado = async () => {
      const [vehiculoData, estadoData] = await Promise.all([
        Datos.getVehiculoById(route.params.vehiculoId),
        Datos.getVehiculoEstadoById(route.params.vehiculoId),
      ]);

      if (active) {
        setVehiculo(vehiculoData);
        setEstado(estadoData);
        setLoaded(true);
      }
    };

    loadEstado().catch(() => {
      if (active) {
        setVehiculo(null);
        setEstado(null);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, [route.params.vehiculoId]);

  if (!loaded) {
    return (
      <View style={styles.center}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!vehiculo || !estado) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>{t('vehiculos.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{vehiculo.placa}</Text>
        <Text style={styles.subtitle}>
          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
        </Text>
        <Text style={styles.kmText}>
          {t('vehiculos.kilometraje')}: {vehiculo.kilometraje.toLocaleString('es-MX')} km
        </Text>
        <Text style={styles.routeText}>
          {t('vehiculos.assignedRoute')}: {vehiculo.rutaAsignada || t('vehiculos.unassignedRoute')}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('vehiculos.deficiencias')}</Text>
        {estado.deficiencias.length === 0 ? (
          <Text style={styles.empty}>{t('vehiculos.noDeficiencias')}</Text>
        ) : (
          estado.deficiencias.map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.listItem}>
              {index + 1}. {item}
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('vehiculos.comentarios')}</Text>
        {estado.comentarios.length === 0 ? (
          <Text style={styles.empty}>{t('vehiculos.noComentarios')}</Text>
        ) : (
          estado.comentarios.map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.listItem}>
              {index + 1}. {item}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: theme.spacing.md, backgroundColor: theme.colors.background, gap: 12},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  title: {fontSize: 22, fontWeight: '700', color: theme.colors.text, marginBottom: 4},
  subtitle: {fontSize: 15, color: theme.colors.textMuted},
  kmText: {fontSize: 14, color: theme.colors.text, marginTop: 8, fontWeight: '600'},
  routeText: {fontSize: 14, color: theme.colors.text, marginTop: 8, fontWeight: '500'},
  sectionTitle: {fontSize: 17, fontWeight: '600', color: theme.colors.text, marginBottom: 8},
  listItem: {fontSize: 14, color: theme.colors.text, marginBottom: 6, lineHeight: 20},
  empty: {fontSize: 14, color: theme.colors.textSoft},
  notFound: {fontSize: 16, color: theme.colors.danger, fontWeight: '600'},
});
