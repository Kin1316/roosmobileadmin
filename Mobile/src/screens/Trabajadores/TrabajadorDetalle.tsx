import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RouteProp, useRoute, useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, TrabajadorData, RutaData} from '../../services/datos';
import {theme} from '../../theme';

type TrabajadorDetalleRouteProp = RouteProp<
  RootStackParamList,
  'TrabajadorDetalle'
>;

export default function TrabajadorDetalle() {
  const {t} = useTranslation();
  const route = useRoute<TrabajadorDetalleRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [trabajador, setTrabajador] = useState<TrabajadorData | null>(null);
  const [rutaAsignada, setRutaAsignada] = useState<RutaData | null>(null);
  const [rutasDisponibles, setRutasDisponibles] = useState<RutaData[]>([]);
  const [conductores, setConductores] = useState<TrabajadorData[]>([]);
  const [rutasAsignadasPorConductor, setRutasAsignadasPorConductor] = useState<Record<number, string>>({});
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [trabajadorData, asignada, disponibles] = await Promise.all([
        Datos.getTrabajadorById(route.params.trabajadorId),
        Datos.getRutaAsignada(route.params.trabajadorId),
        Datos.getRutasDisponiblesParaConductor(route.params.trabajadorId),
      ]);

      const allWorkers = await Datos.getTrabajadores();
      const availableDrivers = allWorkers.filter(item => item.tipo === 'conductor');
      const assignedRoutes = await Datos.getRutasAsignadasPorConductores(availableDrivers.map(item => item.id));

      if (trabajadorData) {
        setTrabajador(trabajadorData);
        setRutaAsignada(asignada);
        setRutasDisponibles(disponibles);
        setConductores(availableDrivers);
        setRutasAsignadasPorConductor(assignedRoutes);
      } else {
        setTrabajador(null);
        setRutaAsignada(null);
        setRutasDisponibles([]);
        setConductores([]);
        setRutasAsignadasPorConductor({});
      }

      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }, [route.params.trabajadorId]);

  const isConductor = trabajador?.tipo === 'conductor';

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleAsignarRuta = (ruta: RutaData) => {
    Alert.alert(
      t('trabajadores.asignarRuta'),
      t('trabajadores.confirmarAsignacion', {ruta: ruta.nombre}),
      [
        {
          text: t('trabajadores.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('trabajadores.asignar'),
          onPress: async () => {
            const result = await Datos.asignarRutaAConductor(route.params.trabajadorId, ruta.id);
            if (!result.ok) {
              const reasonKey = result.reason ?? 'invalid-route';
              Alert.alert(t('trabajadores.asignarRuta'), t(`trabajadores.errors.${reasonKey}`));
            }
            loadData();
          },
        },
      ],
    );
  };

  const handleDesasignarRuta = () => {
    Alert.alert(
      t('trabajadores.desasignarRuta'),
      t('trabajadores.confirmarDesasignacion'),
      [
        {
          text: t('trabajadores.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('trabajadores.desasignar'),
          onPress: async () => {
            await Datos.desasignarRuta(route.params.trabajadorId);
            loadData();
          },
          style: 'destructive',
        },
      ],
    );
  };

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!trabajador) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>{t('trabajadores.notFound')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <View style={styles.card}>
          <Text style={styles.nombre}>{trabajador.nombre}</Text>
          <Text style={styles.cargo}>{trabajador.cargo}</Text>
        </View>
      </View>

      {isConductor ? (
        rutaAsignada ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>
                {t('trabajadores.rutasAsignadas')} (1)
              </Text>
            </View>
            <View style={styles.rutasList}>
              <View style={[styles.rutaCard, styles.rutaAsignada]}>
                <View style={styles.rutaHeader}>
                  <Text style={styles.rutaNombre}>{rutaAsignada.nombre}</Text>
                  <Text style={styles.rutaConductor}>{rutaAsignada.conductor}</Text>
                </View>
                <View style={styles.rutaInfo}>
                  <Text style={styles.infoText}>
                    {t('rutas.completedDestinations')}: {rutaAsignada.destinosCompletados}
                  </Text>
                  <Text style={styles.infoText}>
                    {t('rutas.pendingDestinations')}: {rutaAsignada.destinosPendientes}
                  </Text>
                </View>
                <TouchableOpacity style={styles.removeButton} onPress={handleDesasignarRuta}>
                  <Text style={styles.removeButtonText}>{t('trabajadores.desasignar')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>
                {t('trabajadores.rutasDisponibles')} ({rutasDisponibles.length})
              </Text>
            </View>
            <FlatList
              data={rutasDisponibles}
              keyExtractor={item => `disponible-${item.id}`}
              scrollEnabled
              contentContainerStyle={styles.rutasList}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.rutaCard}
                  activeOpacity={0.9}
                  onPress={() => handleAsignarRuta(item)}>
                  <View style={styles.rutaHeader}>
                    <Text style={styles.rutaNombre}>{item.nombre}</Text>
                    <Text style={styles.rutaConductor}>{item.conductor}</Text>
                  </View>
                  <View style={styles.rutaInfo}>
                    <Text style={styles.infoText}>
                      {t('rutas.completedDestinations')}: {item.destinosCompletados}
                    </Text>
                    <Text style={styles.infoText}>
                      {t('rutas.pendingDestinations')}: {item.destinosPendientes}
                    </Text>
                  </View>
                  <Text style={styles.asignarHint}>{t('trabajadores.tapToAssign')}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>{t('trabajadores.manageDriverAssignments')}</Text>
          </View>
          <FlatList
            data={conductores}
            keyExtractor={item => `conductor-${item.id}`}
            contentContainerStyle={styles.rutasList}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.rutaCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('TrabajadorDetalle', {trabajadorId: item.id})}>
                <Text style={styles.rutaNombre}>{item.nombre}</Text>
                <Text style={styles.rutaConductor}>{item.cargo}</Text>
                <Text style={styles.infoText}>
                  {rutasAsignadasPorConductor[item.id]
                    ? t('trabajadores.assignedRouteLabel', {ruta: rutasAsignadasPorConductor[item.id]})
                    : t('trabajadores.assignedRouteNone')}
                </Text>
                <Text style={styles.asignarHint}>{t('trabajadores.openDriverToEdit')}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('rutas.assignDriverNoDrivers')}</Text>
              </View>
            }
          />
        </>
      )}

      {isConductor && !rutaAsignada && rutasDisponibles.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('trabajadores.noRutas')}</Text>
        </View>
      )}
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
  notFound: {
    fontSize: 14,
    color: theme.colors.textSoft,
  },
  headerBlock: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    ...theme.shadows.soft,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cargo: {
    fontSize: 13,
    color: theme.colors.textSoft,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rutasList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  rutaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 10,
    ...theme.shadows.soft,
  },
  rutaAsignada: {
    borderColor: theme.colors.successStrong,
    borderWidth: 2,
  },
  rutaHeader: {
    marginBottom: 8,
  },
  rutaNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  rutaConductor: {
    fontSize: 12,
    color: theme.colors.textSoft,
  },
  rutaInfo: {
    gap: 4,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  asignarHint: {
    fontSize: 11,
    color: theme.colors.textSoft,
    fontStyle: 'italic',
  },
  removeButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },
});
