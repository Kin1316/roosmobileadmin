import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RouteProp, useRoute} from '@react-navigation/native';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {Datos, EvidenciaData, ImagenEvidencia, RutaServicioData} from '../../services/datos';
import {theme} from '../../theme';

type RutaEvidenciasRouteProp = RouteProp<RootStackParamList, 'RutaEvidencias'>;

function ImagenEvidenciaItem({img}: {img: ImagenEvidencia}) {
  return (
    <View style={styles.imagePlaceholder}>
      <Image source={{uri: img.url}} style={styles.imagePreview} resizeMode="cover" />
      <Text style={styles.imageCaption}>{img.descripcion}</Text>
    </View>
  );
}

export default function RutaEvidencias() {
  const {t} = useTranslation();
  const route = useRoute<RutaEvidenciasRouteProp>();
  const [servicios, setServicios] = useState<RutaServicioData[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [evidencia, setEvidencia] = useState<EvidenciaData | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const getLocalTodayIso = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    let active = true;
    const today = getLocalTodayIso();

    const loadServicios = async () => {
      const data = await Datos.getServiciosConEstadoByRutaId(route.params.routeId, today);
      if (active) {
        setServicios(data);
        setLoaded(true);
      }
    };

    loadServicios().catch(() => {
      if (active) {
        setServicios([]);
        setEvidencia(null);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, [route.params.routeId]);

  const handleSelectServicio = async (servicio: RutaServicioData) => {
    setSelectedServiceId(servicio.id);
    setLoadingEvidence(true);
    try {
      const data = await Datos.getEvidenciasByServiceId(servicio.id, route.params.routeId);
      setEvidencia(data);
    } catch {
      setEvidencia(null);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const getStatusLabel = (status: RutaServicioData['estado']) => {
    if (status === 'completed') {
      return t('rutas.evidencias.status.completed');
    }
    if (status === 'skipped') {
      return t('rutas.evidencias.status.skipped');
    }
    if (status === 'canceled') {
      return t('rutas.evidencias.status.canceled');
    }
    return t('rutas.evidencias.status.pending');
  };

  const buildAllImages = (currentEvidence: EvidenciaData): ImagenEvidencia[] => {
    const byKey = new Map<string, ImagenEvidencia>();
    [...currentEvidence.estadoAlLlegar, ...currentEvidence.estadoAlSalir, currentEvidence.firmaEncargado].forEach(img => {
      if (!img.url) {
        return;
      }
      const key = `${img.id}-${img.descripcion}-${img.url ?? ''}`;
      if (!byKey.has(key)) {
        byKey.set(key, img);
      }
    });
    return Array.from(byKey.values());
  };

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (servicios.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{t('rutas.evidencias.noServices')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.seccion}>
        <Text style={styles.seccionLabel}>{t('rutas.evidencias.todayServicesTitle')}</Text>
        <Text style={styles.servicesHint}>{t('rutas.evidencias.selectServiceHint')}</Text>
        {servicios.map(servicio => (
          <TouchableOpacity
            key={servicio.id}
            style={[
              styles.serviceItem,
              selectedServiceId === servicio.id ? styles.serviceItemSelected : null,
            ]}
            onPress={() => {
              handleSelectServicio(servicio).catch(() => {
                setEvidencia(null);
              });
            }}>
            <Text style={styles.serviceTitle}>{servicio.destino || `Servicio ${servicio.id}`}</Text>
            <Text style={styles.serviceMeta}>
              {t('rutas.evidencias.serviceId', {id: servicio.id})} · {getStatusLabel(servicio.estado)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!selectedServiceId ? (
        <View style={styles.centerCard}>
          <Text style={styles.empty}>{t('rutas.evidencias.selectServiceFirst')}</Text>
        </View>
      ) : loadingEvidence ? (
        <View style={styles.centerCard}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : !evidencia ? (
        <View style={styles.centerCard}>
          <Text style={styles.empty}>{t('rutas.evidencias.notFound')}</Text>
        </View>
      ) : (
        (() => {
          const allImages = buildAllImages(evidencia);
          return (
            <>
              <View style={styles.comentarioCard}>
                <Text style={styles.comentarioLabel}>{t('rutas.evidencias.comentario')}</Text>
                <Text style={styles.comentarioText}>{evidencia.comentario}</Text>
              </View>

              <View style={styles.seccion}>
                <Text style={styles.seccionLabel}>{t('rutas.evidencias.imagesTitle')}</Text>
                {allImages.length === 0 ? (
                  <Text style={styles.empty}>{t('rutas.evidencias.noImages')}</Text>
                ) : (
                  allImages.map((img, index) => (
                    <ImagenEvidenciaItem key={`${img.id}-${index}`} img={img} />
                  ))
                )}
              </View>
            </>
          );
        })()
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    gap: 12,
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
  centerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  empty: {
    fontSize: 15,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },
  comentarioCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  comentarioLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  comentarioText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 21,
  },
  seccion: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  seccionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  servicesHint: {
    fontSize: 12,
    color: theme.colors.textSoft,
    marginBottom: 8,
  },
  serviceItem: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 10,
    marginBottom: 8,
    backgroundColor: theme.colors.background,
  },
  serviceItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  serviceMeta: {
    marginTop: 2,
    fontSize: 12,
    color: theme.colors.textSoft,
  },
  imagePlaceholder: {
    gap: 4,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageCaption: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
});
