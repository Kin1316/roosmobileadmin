import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, VehiculoData} from '../../services/datos';
import {theme} from '../../theme';

const ESTADO_COLOR: Record<VehiculoData['estado'], string> = {
  activo: theme.colors.successStrong,
  mantenimiento: theme.colors.warningStrong,
  inactivo: theme.colors.danger,
};

export default function Vehiculos() {
  const {t} = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [vehiculos, setVehiculos] = useState<VehiculoData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const loadVehiculos = async () => {
      const data = await Datos.getVehiculos();
      if (active) {
        setVehiculos(data);
        setLoaded(true);
      }
    };

    loadVehiculos().catch(() => {
      if (active) {
        setVehiculos([]);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!loaded) {
    return (
      <View style={styles.center}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vehiculos}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('VehiculoEstado', {vehiculoId: item.id})}>
            <View style={styles.cardHeader}>
              <Text style={styles.placa}>{item.placa}</Text>
              <View style={[styles.estadoBadge, {backgroundColor: ESTADO_COLOR[item.estado]}]}>
                <Text style={styles.estadoText}>{t(`vehiculos.estado.${item.estado}`)}</Text>
              </View>
            </View>
            <Text style={styles.vehicleTitle}>
              {item.marca} {item.modelo} {item.anio}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('vehiculos.kilometraje')}:</Text>
              <Text style={styles.value}>{item.kilometraje.toLocaleString('es-MX')} km</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('vehiculos.assignedRoute')}:</Text>
              <Text style={styles.value}>{item.rutaAsignada || t('vehiculos.unassignedRoute')}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.colors.background},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {padding: theme.spacing.md, gap: 12},
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  placa: {fontSize: 18, fontWeight: '700', color: theme.colors.text, letterSpacing: 1},
  vehicleTitle: {fontSize: 15, color: theme.colors.textMuted, marginBottom: 8},
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radii.pill,
  },
  estadoText: {fontSize: 12, color: theme.colors.white, fontWeight: '600', textTransform: 'capitalize'},
  infoRow: {flexDirection: 'row', gap: 6},
  label: {fontSize: 13, color: theme.colors.textSoft},
  value: {fontSize: 13, color: theme.colors.text, fontWeight: '500'},
});
