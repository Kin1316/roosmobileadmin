import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, DestinoCanceladoData} from '../../services/datos';
import {theme} from '../../theme';

type RutaDestinosCanceladosRouteProp = RouteProp<RootStackParamList, 'RutaDestinosCancelados'>;

export default function RutaDestinosCancelados() {
  const {t} = useTranslation();
  const route = useRoute<RutaDestinosCanceladosRouteProp>();
  const [destinos, setDestinos] = useState<DestinoCanceladoData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDestinos = async () => {
      const data = await Datos.getDestinosCanceladosByRutaId(route.params.routeId);
      if (active) {
        setDestinos(data);
        setLoaded(true);
      }
    };

    loadDestinos().catch(() => {
      if (active) {
        setDestinos([]);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, [route.params.routeId]);

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (destinos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{t('rutas.cancelados.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {destinos.map(destino => (
        <View key={destino.id} style={styles.card}>
          <Text style={styles.destinationLabel}>{t('rutas.cancelados.destination')}</Text>
          <Text style={styles.destinationValue}>{destino.storeName}</Text>
          <Text style={styles.commentLabel}>{t('rutas.cancelados.comment')}</Text>
          <Text style={styles.commentValue}>{destino.comentario}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textSoft,
  },
  empty: {
    fontSize: 15,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    ...theme.shadows.soft,
  },
  destinationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  destinationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  commentValue: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 21,
  },
});