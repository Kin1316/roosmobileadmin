import { api } from './api';
import { Datos } from './datos';

// Interfaces mapping directly to the unified API response
export interface BackendEvidenceWaste {
  evidenceWasteId: number;
  weight: number;
  serviceId: number;
  wasteTypeId: number;
}

export interface WasteType {
  wasteTypeId: number;
  name: string;
  measurementUnit: string;
  status: boolean;
}

export interface BackendEvidenceImage {
  imageId: number;
  imageUrl: string;
  imageType: string;
  serviceId: number;
}

export interface BackendEvidencePayload {
  service_id: number;
  evidenceId?: number;
  evidence_id?: number;
  routeId?: number;
  route_id?: number;
  wastes: BackendEvidenceWaste[];
  images?: BackendEvidenceImage[];
  pre_images: BackendEvidenceImage[];
  post_images: BackendEvidenceImage[];
  skipped_service_images: BackendEvidenceImage[];
  signature_url: string | null;
  signatory: string | null;
  observation: string | null;
  skipped_service_description: string | null;
  skipped_service_reported_at: string | null;
  start_time: string | null;
  end_time: string | null;
  nfc_scan: string | null;
}

// Clean mapped interfaces for the UI
export interface EvidenceWaste {
  id: number;
  weight: number;
  wasteTypeId: number;
}

export interface EvidenceImage {
  id: number;
  url: string;
  type: string;
}

export interface EvidenceData {
  serviceId: number;
  wastes: EvidenceWaste[];
  preImages: EvidenceImage[];
  postImages: EvidenceImage[];
  skippedImages: EvidenceImage[];
  signatureUrl: string | null;
  signatory: string | null;
  observation: string | null;
  skippedDescription: string | null;
  skippedReportedAt: string | null;
  startTime: string | null;
  endTime: string | null;
  nfcScan: string | null;
}

export class EvidenceService {
  /**
   * Fetches the unified evidence payload for a specific service ID.
   */
  static async getEvidenceByServiceId(serviceId: number): Promise<EvidenceData | null> {
    try {
      const response = await api.get(`/evidence/service/${serviceId}`, {
        withCredentials: true,
      });

      const payload = Datos.extractObjectPayload<BackendEvidencePayload>(response.data);
      if (!payload || !payload.service_id) {
        return null;
      }

      return EvidenceService.mapBackendToEvidenceData(payload);
    } catch (error) {
      console.warn(`Failed to fetch evidence for service ${serviceId}`, error);
      return null;
    }
  }

  /**
   * Fetches the list of all waste types from the backend.
   */
  static async getWasteTypes(): Promise<WasteType[]> {
    try {
      const response = await api.get('/waste-types', {
        withCredentials: true,
      });
      return Datos.extractArrayPayload<WasteType>(response.data) || [];
    } catch (error) {
      console.warn('Failed to fetch waste types', error);
      return [];
    }
  }

  private static mapBackendToEvidenceData(raw: BackendEvidencePayload): EvidenceData {
    return {
      serviceId: Datos.toNumber(raw.service_id) ?? 0,
      wastes: (raw.wastes ?? []).map(w => ({
        id: Datos.toNumber(w.evidenceWasteId) ?? 0,
        weight: typeof w.weight === 'number' ? w.weight : 0,
        wasteTypeId: Datos.toNumber(w.wasteTypeId) ?? 0,
      })),
      preImages: (raw.pre_images ?? []).map(img => EvidenceService.mapImage(img)),
      postImages: (raw.post_images ?? []).map(img => EvidenceService.mapImage(img)),
      skippedImages: (raw.skipped_service_images ?? []).map(img => EvidenceService.mapImage(img)),
      signatureUrl: Datos.resolveMediaUrl(raw.signature_url ?? undefined) ?? null,
      signatory: raw.signatory ? raw.signatory.trim() : null,
      observation: raw.observation ? raw.observation.trim() : null,
      skippedDescription: raw.skipped_service_description ? raw.skipped_service_description.trim() : null,
      skippedReportedAt: raw.skipped_service_reported_at ? raw.skipped_service_reported_at.trim() : null,
      startTime: raw.start_time ? raw.start_time.trim() : null,
      endTime: raw.end_time ? raw.end_time.trim() : null,
      nfcScan: raw.nfc_scan ? raw.nfc_scan.trim() : null,
    };
  }

  private static mapImage(raw: BackendEvidenceImage): EvidenceImage {
    return {
      id: Datos.toNumber(raw.imageId) ?? 0,
      url: Datos.resolveMediaUrl(raw.imageUrl ?? undefined) ?? '',
      type: raw.imageType ? raw.imageType.trim() : 'UNKNOWN',
    };
  }
}
