import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, RutaServicioData} from '../../services/datos';
import {theme} from '../../theme';

type RutaEvidenciasRouteProp = RouteProp<RootStackParamList, 'RutaEvidencias'>;

export default function RutaEvidencias() {
  const {t} = useTranslation();
  const route = useRoute<RutaEvidenciasRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [servicios, setServicios] = useState<RutaServicioData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const today = Datos.getTodayIsoDate();

    const loadServicios = async () => {
      const data = await Datos.getServiciosConEstadoByRutaId(route.params.routeId, today);
      if (active) {
        // Ordenar por prioridad (menor número = mayor prioridad)
        data.sort((a, b) => a.priority - b.priority);
        setServicios(data);
        setLoaded(true);
      }
    };

    loadServicios().catch(() => {
      if (active) {
        setServicios([]);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, [route.params.routeId]);

  const getStatusLabel = (status: RutaServicioData['estado']) => {
    if (status === 'completed') return t('rutas.evidencias.status.completed', 'Completado');
    if (status === 'skipped') return t('rutas.evidencias.status.skipped', 'Saltado');
    if (status === 'canceled') return t('rutas.evidencias.status.canceled', 'Cancelado');
    return t('rutas.evidencias.status.pending', 'Pendiente');
  };

  const navigateToEvidencia = (servicio: RutaServicioData) => {
    navigation.navigate('EvidenciaDetalle', {
      serviceId: servicio.id,
      storeName: servicio.storeName || `Servicio ${servicio.id}`
    });
  };

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading', 'Cargando...')}</Text>
      </View>
    );
  }

  if (servicios.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{t('rutas.evidencias.noServices', 'No hay servicios hoy.')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.seccionLabel}>
        {t('rutas.evidencias.todayServicesTitle', 'SERVICIOS ORDENADOS POR PRIORIDAD')}
      </Text>
      
      <View style={styles.listContainer}>
        {servicios.map((servicio, index) => (
          <TouchableOpacity
            key={servicio.id}
            style={styles.serviceItem}
            onPress={() => navigateToEvidencia(servicio)}>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{index + 1}</Text>
            </View>
            
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>
                {servicio.storeName || `Servicio ${servicio.id}`}
              </Text>
              <Text style={styles.serviceMeta}>
                ID: {servicio.id} · {getStatusLabel(servicio.estado)}
              </Text>
              {servicio.priority !== 999 && (
                 <Text style={styles.serviceMeta}>
                   Prioridad del sistema: {servicio.priority}
                 </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSoft,
  },
  empty: {
    fontSize: 15,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },
  seccionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  listContainer: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 12,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  priorityBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  serviceMeta: {
    fontSize: 13,
    color: theme.colors.textSoft,
  },
});
