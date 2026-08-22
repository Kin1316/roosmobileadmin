import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Dimensions} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RouteProp, useRoute} from '@react-navigation/native';
import {SvgUri} from 'react-native-svg';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import {EvidenceService, EvidenceData, EvidenceImage} from '../../services/evidence';
import {theme} from '../../theme';

type EvidenciaDetalleRouteProp = RouteProp<RootStackParamList, 'EvidenciaDetalle'>;

const {width} = Dimensions.get('window');
const CAROUSEL_IMAGE_WIDTH = width - theme.spacing.md * 4;

const ImageCarousel = ({title, images}: {title: string; images: EvidenceImage[]}) => {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CAROUSEL_IMAGE_WIDTH + 10}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContainer}>
        {images.map((img, index) => (
          <View key={`${img.id}-${index}`} style={styles.carouselItem}>
            <Image source={{uri: img.url}} style={styles.carouselImage} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default function EvidenciaDetalle() {
  const {t} = useTranslation();
  const route = useRoute<EvidenciaDetalleRouteProp>();
  const {serviceId, storeName} = route.params;

  const [evidencia, setEvidencia] = useState<EvidenceData | null>(null);
  const [wasteTypes, setWasteTypes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [evidenceData, typesData] = await Promise.all([
          EvidenceService.getEvidenceByServiceId(serviceId),
          EvidenceService.getWasteTypes()
        ]);
        
        if (active) {
          setEvidencia(evidenceData);
          
          const typesMap: Record<number, string> = {};
          typesData.forEach(t => {
            typesMap[t.wasteTypeId] = `${t.name} (${t.measurementUnit})`;
          });
          setWasteTypes(typesMap);
        }
      } catch {
        if (active) setEvidencia(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [serviceId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading', 'Cargando evidencia...')}</Text>
      </View>
    );
  }

  if (!evidencia) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>
          {t('rutas.evidencias.notFound', 'No se encontró evidencia para este servicio.')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Service Data Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalles del Servicio</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID:</Text>
          <Text style={styles.detailValue}>{serviceId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tienda:</Text>
          <Text style={styles.detailValue}>{storeName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Horario:</Text>
          <Text style={styles.detailValue}>
            {evidencia.startTime || '---'} a {evidencia.endTime || '---'}
          </Text>
        </View>
        {evidencia.observation && (
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Observación:</Text>
            <Text style={styles.detailValue}>{evidencia.observation}</Text>
          </View>
        )}
        
        {evidencia.wastes && evidencia.wastes.length > 0 && (
          <View style={styles.wastesContainer}>
            {evidencia.wastes.map(w => (
              <View key={w.id} style={styles.wasteBadge}>
                <Text style={styles.wasteBadgeText}>
                  {wasteTypes[w.wasteTypeId] ? `${wasteTypes[w.wasteTypeId].split(' (')[0]}: ${w.weight}${wasteTypes[w.wasteTypeId].split('(')[1].replace(')', '')}` : `Tipo ${w.wasteTypeId}: ${w.weight}kg`}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Skipped Service Card */}
      {evidencia.skippedDescription && (
        <View style={[styles.card, styles.alertCard]}>
          <Text style={[styles.cardTitle, styles.alertTitle]}>Servicio Saltado</Text>
          <Text style={styles.detailValue}>{evidencia.skippedDescription}</Text>
          {evidencia.skippedReportedAt && (
            <Text style={styles.alertMeta}>Reportado: {evidencia.skippedReportedAt}</Text>
          )}
        </View>
      )}

      {evidencia.skippedImages && evidencia.skippedImages.length > 0 && (
         <ImageCarousel title="Imágenes de Servicio Saltado" images={evidencia.skippedImages} />
      )}

      {/* Carousels */}
      <ImageCarousel title="Evidencia Previa (PRE)" images={evidencia.preImages} />
      <ImageCarousel title="Evidencia Posterior (POST)" images={evidencia.postImages} />

      {/* Signature rendered as SVG */}
      {evidencia.signatureUrl && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Firma del Encargado</Text>
          <View style={styles.signatureContainer}>
            <SvgUri
              width="100%"
              height="100%"
              uri={evidencia.signatureUrl}
            />
          </View>
          {evidencia.signatory && (
            <Text style={styles.signatoryText}>{evidencia.signatory}</Text>
          )}
        </View>
      )}
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailColumn: {
    gap: 4,
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
    width: 65,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  wastesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  wasteBadge: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
  },
  wasteBadgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  alertCard: {
    backgroundColor: '#fff0f0',
    borderColor: '#ffcaca',
  },
  alertTitle: {
    color: '#d32f2f',
  },
  alertMeta: {
    fontSize: 12,
    color: '#d32f2f',
    opacity: 0.8,
    marginTop: 4,
  },
  carouselContainer: {
    gap: 10,
  },
  carouselItem: {
    width: CAROUSEL_IMAGE_WIDTH,
    height: CAROUSEL_IMAGE_WIDTH * 0.8,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  signatureContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#ffffff',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    overflow: 'hidden',
  },
  signatoryText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
