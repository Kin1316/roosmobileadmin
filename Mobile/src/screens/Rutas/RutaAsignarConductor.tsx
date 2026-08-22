import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, TrabajadorData} from '../../services/datos';
import {theme} from '../../theme';

type RutaAsignarConductorRouteProp = RouteProp<RootStackParamList, 'RutaAsignarConductor'>;

export default function RutaAsignarConductor() {
  const {t} = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RutaAsignarConductorRouteProp>();

  const [routeName, setRouteName] = useState('');
  const [conductores, setConductores] = useState<TrabajadorData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const [ruta, conductoresSinRuta] = await Promise.all([
        Datos.getRutaById(route.params.routeId),
        Datos.getConductoresParaRuta(route.params.routeId),
      ]);

      if (active) {
        setRouteName(ruta?.nombre ?? '');
        setConductores(conductoresSinRuta);
        setLoaded(true);
      }
    };

    loadData().catch(() => {
      if (active) {
        setRouteName('');
        setConductores([]);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, [route.params.routeId]);

  const onAsignar = (conductor: TrabajadorData) => {
    Alert.alert(
      t('rutas.assignDriverTitle'),
      t('rutas.assignDriverConfirm', {driver: conductor.nombre, route: routeName}),
      [
        {text: t('trabajadores.cancel'), style: 'cancel'},
        {
          text: t('trabajadores.asignar'),
          onPress: async () => {
            const result = await Datos.asignarConductorARuta(conductor.id, route.params.routeId);
            if (!result.ok) {
              Alert.alert(t('rutas.assignDriverTitle'), t(`trabajadores.errors.${result.reason ?? 'invalid-route'}`));
              return;
            }
            navigation.goBack();
          },
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('rutas.assignDriverTitle')}</Text>
      <Text style={styles.subtitle}>{routeName}</Text>

      {conductores.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{t('rutas.assignDriverNoDrivers')}</Text>
        </View>
      ) : (
        <FlatList
          data={conductores}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.item} onPress={() => onAsignar(item)}>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.role}>{item.cargo}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10},
  loadingText: {fontSize: 14, color: theme.colors.textSoft},
  title: {fontSize: 22, fontWeight: '700', color: theme.colors.text, textAlign: 'center'},
  subtitle: {fontSize: 14, color: theme.colors.textSoft, textAlign: 'center', marginBottom: 12},
  list: {gap: 10, paddingBottom: 20},
  item: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 14,
    ...theme.shadows.soft,
  },
  name: {fontSize: 15, fontWeight: '600', color: theme.colors.text, marginBottom: 4},
  role: {fontSize: 12, color: theme.colors.textSoft},
  emptyBox: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  emptyText: {fontSize: 14, color: theme.colors.textSoft, textAlign: 'center'},
});
