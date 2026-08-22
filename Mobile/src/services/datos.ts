export type PantallaApp = 'Rutas' | 'Vehiculos' | 'Trabajadores';

import {api, ApiError, getApiBaseUrlCandidates, setApiBaseUrl} from './api';

export interface SesionUsuario {
  token: string;
  username: string;
}

export interface OpcionMenu {
  id: number;
  labelKey: string;
  screen?: PantallaApp;
}

export interface AccionRuta {
  id: number;
  labelKey: string;
  messageKey: 'rutas.showEvidenceMessage' | 'rutas.truckStatusMessage' | 'rutas.canceledDestinationsMessage';
}

export type ServiceLifecycleStatus = 'completed' | 'pending' | 'canceled' | 'skipped';

export interface RutaData {
  id: number;
  nombre: string;
  conductor: string;
  vehiculoAsignado: string;
  completado: number;
  destinosCompletados: number;
  ultimoDestino: string;
  destinosPendientes: number;
  destinosCancelados: number;
}

export interface VehiculoData {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  estado: 'activo' | 'mantenimiento' | 'inactivo';
  kilometraje: number;
  rutaAsignada: string;
}

type VehiculoCatalogoData = Omit<VehiculoData, 'rutaAsignada'>;

export interface TrabajadorData {
  id: number;
  nombre: string;
  cargo: string;
  tipo: 'conductor' | 'administrativo';
}

export interface VehiculoEstadoData {
  vehiculoId: number;
  deficiencias: string[];
  comentarios: string[];
}

export interface ImagenEvidencia {
  id: number;
  descripcion: string;
  url?: string;
}

export interface EvidenciaData {
  rutaId: number;
  comentario: string;
  estadoAlLlegar: ImagenEvidencia[];
  estadoAlSalir: ImagenEvidencia[];
  firmaEncargado: ImagenEvidencia;
}

export interface RutaServicioData {
  id: number;
  rutaId: number;
  destino: string;
  estado: ServiceLifecycleStatus;
  comentario: string;
  fechaServicio?: string;
}

export interface DestinoCanceladoData {
  id: number;
  rutaId: number;
  destino: string;
  comentario: string;
}

export interface AsignacionRutaResult {
  ok: boolean;
  reason?: 'already-assigned' | 'route-taken' | 'invalid-worker' | 'invalid-route';
}

interface BackendAuthErrorPayload {
  status?: string;
  message?: string;
  error?: {
    code?: string;
    details?: string;
  };
}

interface BackendVehiculoPayload {
  vehicleId?: number | string;
  brand?: string;
  model?: string;
  licensePlate?: string;
  year?: number | string;
  unitNumber?: string;
  status?: string;
}

interface BackendRoutePayload {
  routeId?: number | string;
  routeName?: string;
  description?: string;
  status?: string;
  userId?: number | string | null;
  user_id?: number | string | null;
}

interface BackendUserPayload {
  userId?: number | string;
  firstName?: string;
  paternalLastName?: string;
  maternalLastName?: string;
  phone?: string;
  email?: string;
  username?: string;
  role?: string;
}

interface BackendEvidencePayload {
  evidenceId?: number | string;
  createdAt?: string;
  serviceId?: number | string;
  routeId?: number | string;
  route_id?: number | string;
  images?: BackendImagePayload[];
  pre_images?: BackendImagePayload[];
  post_images?: BackendImagePayload[];
  skipped_service_images?: BackendImagePayload[];
  signature_url?: string;
  skipped_service_description?: string;
  skipped_service_reported_at?: string;
}

interface BackendServicePayload {
  serviceId?: number | string;
  routeId?: number | string;
  route_id?: number | string;
  destination?: string;
  address?: string;
  serviceDate?: string;
  service_date?: string;
  scheduledDate?: string;
  createdAt?: string;
  status?: string;
  canceled?: boolean;
  isCanceled?: boolean;
  comment?: string;
  observation?: string;
  skipped_service_description?: string;
  skipped_service_reported_at?: string;
}

interface BackendRouteServicesCountPayload {
  routeId?: number | string;
  routeName?: string;
  servicesCount?: number | string;
}

interface BackendRouteStatisticsPayload {
  routeId?: number | string;
  routeName?: string;
  completedCount?: number | string;
  pendingCount?: number | string;
  canceledCount?: number | string;
  rescheduledCount?: number | string;
  servicesCount?: number | string;
}

interface BackendImagePayload {
  imageId?: number | string;
  imageUrl?: string;
  url?: string;
  fileUrl?: string;
  file_url?: string;
  path?: string;
  imageType?: string;
  type?: string;
  description?: string;
  comment?: string;
  observation?: string;
  evidenceId?: number | string;
}

interface BackendEvidenceWastePayload {
  evidenceWasteId?: number | string;
  weight?: number | string;
  evidenceId?: number | string;
  wasteTypeId?: number | string;
}

interface BackendInspectionImagePayload {
  imageId?: number | string;
  imageUrl?: string;
  imageInt?: number | string;
  description?: string;
  inspectionId?: number | string;
}

interface BackendInspectionPayload {
  inspectionId?: number | string;
  inspectionDate?: string;
  kilometrage?: number | string;
  isApproved?: boolean;
  observation?: string;
  user_id?: number | string;
  vehicle_id?: number | string;
  images?: BackendInspectionImagePayload[];
}

interface MappedRouteDTO {
  id: number;
  nombre: string;
  descripcion: string;
  status: string;
  userId: number | null;
}

interface MappedUserDTO {
  id: number;
  nombre: string;
  cargo: string;
  tipo: TrabajadorData['tipo'];
  username: string;
}

interface MappedEvidenceWaste {
  id: number;
  weight: number;
  wasteTypeId: number | null;
}

interface MappedInspection {
  inspectionId: number;
  inspectionDate: string;
  kilometrage: number;
  isApproved: boolean;
  observation: string;
  userId: number | null;
  vehicleId: number | null;
  images: BackendInspectionImagePayload[];
}

interface ServicesQueryOptions {
  date?: string;
  statuses?: string[];
}

interface RouteDailyMetrics {
  completedCount: number;
  pendingCount: number;
  canceledCount: number;
  rescheduledCount: number;
  servicesCount: number;
}

export class Datos {
  // One-to-one relation: each conductor has at most one route, and each route at most one conductor.
  private static readonly ASIGNACIONES: Map<number, number> = new Map();
  private static readonly USERS_ENDPOINT = '/users';

  private static readonly MENU: OpcionMenu[] = [
    {id: 1, labelKey: 'menu.button1', screen: 'Rutas'},
    {id: 2, labelKey: 'menu.button2', screen: 'Vehiculos'},
    {id: 3, labelKey: 'menu.button3', screen: 'Trabajadores'},
  ];

  private static readonly RUTA_ACCIONES: AccionRuta[] = [
    {id: 1, labelKey: 'rutas.showEvidence', messageKey: 'rutas.showEvidenceMessage'},
    {id: 2, labelKey: 'rutas.truckStatus', messageKey: 'rutas.truckStatusMessage'},
    {id: 3, labelKey: 'rutas.canceledDestinations', messageKey: 'rutas.canceledDestinationsMessage'},
  ];

  private static readonly VEHICULOS: VehiculoCatalogoData[] = [
    {id: 1, placa: 'ABC-123', marca: 'Toyota', modelo: 'Hilux', anio: 2019, estado: 'activo', kilometraje: 45230},
    {id: 2, placa: 'DEF-456', marca: 'Ford', modelo: 'Ranger', anio: 2020, estado: 'activo', kilometraje: 38750},
    {id: 3, placa: 'GHI-789', marca: 'Chevrolet', modelo: 'S10', anio: 2018, estado: 'mantenimiento', kilometraje: 62100},
    {id: 4, placa: 'JKL-012', marca: 'Nissan', modelo: 'Frontier', anio: 2021, estado: 'activo', kilometraje: 21400},
    {id: 5, placa: 'MNO-345', marca: 'Mitsubishi', modelo: 'L200', anio: 2017, estado: 'inactivo', kilometraje: 89600},
    {id: 6, placa: 'PQR-678', marca: 'Toyota', modelo: 'Land Cruiser', anio: 2022, estado: 'activo', kilometraje: 12300},
    {id: 7, placa: 'STU-901', marca: 'Ford', modelo: 'F-150', anio: 2019, estado: 'mantenimiento', kilometraje: 54800},
    {id: 8, placa: 'VWX-234', marca: 'Isuzu', modelo: 'D-Max', anio: 2020, estado: 'activo', kilometraje: 33900},
    {id: 9, placa: 'YZA-567', marca: 'Hyundai', modelo: 'Santa Cruz', anio: 2021, estado: 'activo', kilometraje: 28700},
    {id: 10, placa: 'BCD-890', marca: 'Mazda', modelo: 'BT-50', anio: 2018, estado: 'mantenimiento', kilometraje: 67750},
    {id: 11, placa: 'EFG-123', marca: 'Volkswagen', modelo: 'Amarok', anio: 2019, estado: 'activo', kilometraje: 49980},
    {id: 12, placa: 'HIJ-456', marca: 'RAM', modelo: '1500', anio: 2022, estado: 'activo', kilometraje: 18120},
    {id: 13, placa: 'KLM-789', marca: 'Great Wall', modelo: 'Wingle 7', anio: 2020, estado: 'inactivo', kilometraje: 74300},
    {id: 14, placa: 'NOP-012', marca: 'JAC', modelo: 'T8', anio: 2021, estado: 'activo', kilometraje: 31240},
    {id: 15, placa: 'QRS-345', marca: 'Peugeot', modelo: 'Landtrek', anio: 2023, estado: 'activo', kilometraje: 9400},
  ];

  private static readonly VEHICULO_ESTADOS: VehiculoEstadoData[] = [
    {vehiculoId: 1, deficiencias: ['Luz trasera derecha intermitente', 'Desgaste en llanta delantera izquierda'], comentarios: ['Programar cambio de foco esta semana', 'Rotacion de llantas recomendada']},
    {vehiculoId: 2, deficiencias: ['Freno de mano con recorrido largo'], comentarios: ['Ajustar cable en proximo mantenimiento preventivo']},
    {vehiculoId: 3, deficiencias: ['Fuga menor de aceite en tapa de valvulas', 'Golpeteo en suspension delantera'], comentarios: ['No asignar rutas largas hasta revision mecanica']},
    {vehiculoId: 4, deficiencias: [], comentarios: ['Unidad operativa sin observaciones criticas']},
    {vehiculoId: 5, deficiencias: ['Bateria con voltaje inestable', 'Aire acondicionado sin enfriar'], comentarios: ['Mantener fuera de servicio hasta reemplazo de bateria']},
    {vehiculoId: 6, deficiencias: ['Sensor de reversa intermitente'], comentarios: ['Verificar cableado del sensor posterior']},
    {vehiculoId: 7, deficiencias: ['Pastillas de freno al 20%', 'Parabrisas con fisura lateral'], comentarios: ['Cambio de pastillas urgente antes del fin de semana']},
    {vehiculoId: 8, deficiencias: [], comentarios: ['Estado general bueno', 'Requiere lavado de chasis']},
    {vehiculoId: 9, deficiencias: ['Puerta copiloto no cierra suavemente'], comentarios: ['Lubricar bisagras y revisar pestillo']},
    {vehiculoId: 10, deficiencias: ['Ruido en banda auxiliar'], comentarios: ['Revisar tension de banda en proxima parada']},
    {vehiculoId: 11, deficiencias: ['Luz de check engine encendida'], comentarios: ['Pendiente escaneo OBD para diagnostico']},
    {vehiculoId: 12, deficiencias: [], comentarios: ['Vehiculo nuevo, sin incidencias registradas']},
    {vehiculoId: 13, deficiencias: ['Corrosion en terminales de bateria', 'Desalineacion leve'], comentarios: ['Corregir alineacion antes de reactivar unidad']},
    {vehiculoId: 14, deficiencias: ['Neumatico trasero derecho con baja presion frecuente'], comentarios: ['Revisar posible pinchazo lento']},
    {vehiculoId: 15, deficiencias: [], comentarios: ['Ultima inspeccion aprobada', 'Lista para operacion diaria']},
  ];

  private static readonly RUTAS: RutaData[] = [
    {id: 1, nombre: 'Ruta 1', conductor: 'Carlos Pérez', vehiculoAsignado: 'ABC-123', completado: 12, destinosCompletados: 1, ultimoDestino: 'Mercado Central', destinosPendientes: 6, destinosCancelados: 1},
    {id: 2, nombre: 'Ruta 2', conductor: 'Ana López', vehiculoAsignado: '', completado: 25, destinosCompletados: 2, ultimoDestino: 'Av. Terminal Norte', destinosPendientes: 5, destinosCancelados: 0},
    {id: 3, nombre: 'Ruta 3', conductor: 'Luis García', vehiculoAsignado: '', completado: 34, destinosCompletados: 3, ultimoDestino: 'Sector San Martín', destinosPendientes: 4, destinosCancelados: 1},
    {id: 4, nombre: 'Ruta 4', conductor: 'María Torres', vehiculoAsignado: '', completado: 41, destinosCompletados: 4, ultimoDestino: 'Parque Industrial', destinosPendientes: 4, destinosCancelados: 0},
    {id: 5, nombre: 'Ruta 5', conductor: 'Jorge Díaz', vehiculoAsignado: '', completado: 50, destinosCompletados: 5, ultimoDestino: 'Urbanización Los Olivos', destinosPendientes: 3, destinosCancelados: 1},
    {id: 6, nombre: 'Ruta 6', conductor: 'Sofía Ramírez', vehiculoAsignado: '', completado: 58, destinosCompletados: 6, ultimoDestino: 'Balneario Huanchaco', destinosPendientes: 3, destinosCancelados: 0},
    {id: 7, nombre: 'Ruta 7', conductor: 'Pedro Castillo', vehiculoAsignado: '', completado: 63, destinosCompletados: 6, ultimoDestino: 'Plaza Pueblo Libre', destinosPendientes: 3, destinosCancelados: 1},
    {id: 8, nombre: 'Ruta 8', conductor: 'Lucía Herrera', vehiculoAsignado: '', completado: 69, destinosCompletados: 7, ultimoDestino: 'Mercado Santa Anita', destinosPendientes: 2, destinosCancelados: 0},
    {id: 9, nombre: 'Ruta 9', conductor: 'Diego Flores', vehiculoAsignado: '', completado: 74, destinosCompletados: 7, ultimoDestino: 'Malecón Barranco', destinosPendientes: 2, destinosCancelados: 1},
    {id: 10, nombre: 'Ruta 10', conductor: 'Valentina Cruz', vehiculoAsignado: '', completado: 81, destinosCompletados: 8, ultimoDestino: 'Parque Miraflores', destinosPendientes: 2, destinosCancelados: 0},
    {id: 11, nombre: 'Ruta 11', conductor: 'Miguel Rojas', vehiculoAsignado: '', completado: 87, destinosCompletados: 9, ultimoDestino: 'Comas Sector 3', destinosPendientes: 1, destinosCancelados: 1},
    {id: 12, nombre: 'Ruta 12', conductor: 'Camila Vega', vehiculoAsignado: '', completado: 93, destinosCompletados: 9, ultimoDestino: 'Chorrillos Costero', destinosPendientes: 1, destinosCancelados: 0},
    {id: 13, nombre: 'Ruta 13', conductor: 'Andrés Molina', vehiculoAsignado: '', completado: 95, destinosCompletados: 10, ultimoDestino: 'La Molina Residencial', destinosPendientes: 1, destinosCancelados: 0},
    {id: 14, nombre: 'Ruta 14', conductor: 'Renata Silva', vehiculoAsignado: '', completado: 97, destinosCompletados: 10, ultimoDestino: 'Ate Industrial', destinosPendientes: 1, destinosCancelados: 1},
    {id: 15, nombre: 'Ruta 15', conductor: 'Bruno Navarro', vehiculoAsignado: '', completado: 100, destinosCompletados: 10, ultimoDestino: 'Callao Centro', destinosPendientes: 0, destinosCancelados: 0},
  ];

  private static getConductorAsignadoNombreByRutaId(rutaId: number): string {
    const assignedByWorker = Datos.getFallbackAssignedByWorkerId();
    for (const [trabajadorId, assignedRouteId] of assignedByWorker.entries()) {
      if (assignedRouteId === rutaId) {
        const conductor = Datos.TRABAJADORES.find(item => item.id === trabajadorId);
        return conductor?.nombre ?? '';
      }
    }
    return '';
  }

  private static mapRutaConConductorAsignado(ruta: RutaData): RutaData {
    const conductorAsignado = Datos.getConductorAsignadoNombreByRutaId(ruta.id);
    return {
      ...ruta,
      conductor: conductorAsignado || ruta.conductor,
    };
  }

  private static getFallbackAssignedByWorkerId(): Map<number, number> {
    const byWorkerId = new Map<number, number>();

    Datos.RUTAS.forEach(ruta => {
      const conductorNombre = ruta.conductor.trim().toLowerCase();
      if (!conductorNombre) {
        return;
      }

      const conductor = Datos.TRABAJADORES.find(
        item => item.tipo === 'conductor' && item.nombre.trim().toLowerCase() === conductorNombre,
      );

      if (conductor) {
        byWorkerId.set(conductor.id, ruta.id);
      }
    });

    Datos.ASIGNACIONES.forEach((rutaId, trabajadorId) => {
      byWorkerId.set(trabajadorId, rutaId);
    });

    return byWorkerId;
  }

  private static getRutaAsignadaNombreByVehiculoId(vehiculoId: number): string {
    const vehiculo = Datos.VEHICULOS.find(item => item.id === vehiculoId);
    if (!vehiculo) {
      return '';
    }

    const ruta = Datos.RUTAS.find(item => item.vehiculoAsignado === vehiculo.placa);
    return ruta?.nombre ?? '';
  }

  private static toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private static normalizeVehiculoEstado(raw: unknown): VehiculoData['estado'] {
    const normalized = String(raw ?? '').toLowerCase();
    if (normalized === 'mantenimiento' || normalized === 'maintenance') {
      return 'mantenimiento';
    }
    if (normalized === 'inactive' || normalized === 'inactivo') {
      return 'inactivo';
    }
    return 'activo';
  }

  private static normalizeRoleToTipo(role: string | undefined): TrabajadorData['tipo'] {
    const value = (role ?? '').toLowerCase();
    if (
      value.includes('admin') ||
      value.includes('super') ||
      value.includes('manager') ||
      value.includes('gerente') ||
      value.includes('coordinador') ||
      value.includes('supervisor')
    ) {
      return 'administrativo';
    }

    return 'conductor';
  }

  private static mapInspection(raw: BackendInspectionPayload): MappedInspection | null {
    const inspectionId = Datos.toNumber(raw.inspectionId);
    const kilometrage = Datos.toNumber(raw.kilometrage);
    if (!inspectionId || kilometrage === null) {
      return null;
    }

    return {
      inspectionId,
      inspectionDate: raw.inspectionDate ?? '',
      kilometrage,
      isApproved: Boolean(raw.isApproved),
      observation: raw.observation ?? '',
      userId: Datos.toNumber(raw.user_id),
      vehicleId: Datos.toNumber(raw.vehicle_id),
      images: raw.images ?? [],
    };
  }

  private static getLatestInspection(inspections: MappedInspection[]): MappedInspection | null {
    if (inspections.length === 0) {
      return null;
    }

    return [...inspections].sort(Datos.compareInspectionsByRecency)[0];
  }

  private static compareInspectionsByRecency(a: MappedInspection, b: MappedInspection): number {
    const first = Date.parse(a.inspectionDate || '');
    const second = Date.parse(b.inspectionDate || '');
    const firstValid = Number.isFinite(first);
    const secondValid = Number.isFinite(second);

    if (firstValid && secondValid && second !== first) {
      return second - first;
    }

    if (firstValid !== secondValid) {
      return secondValid ? 1 : -1;
    }

    // Fallback when date is missing/equal: larger inspectionId is considered more recent.
    return b.inspectionId - a.inspectionId;
  }

  private static mapBackendVehiculo(raw: BackendVehiculoPayload): VehiculoData | null {
    const id = Datos.toNumber(raw.vehicleId);
    const anio = Datos.toNumber(raw.year);
    const placa = raw.licensePlate;
    const marca = raw.brand;
    const modelo = raw.model;

    if (!id || !anio || !placa || !marca || !modelo) {
      return null;
    }

    return {
      id,
      placa,
      marca,
      modelo,
      anio,
      estado: Datos.normalizeVehiculoEstado(raw.status),
      kilometraje: 0,
      rutaAsignada: '',
    };
  }

  private static mapBackendUser(raw: BackendUserPayload): MappedUserDTO | null {
    const id = Datos.toNumber(raw.userId);
    if (!id) {
      return null;
    }

    const fullName = [raw.firstName, raw.paternalLastName, raw.maternalLastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      id,
      nombre: fullName || raw.username || `Usuario ${id}`,
      cargo: raw.role || 'Usuario',
      tipo: Datos.normalizeRoleToTipo(raw.role),
      username: raw.username || '',
    };
  }

  private static mapBackendRoute(raw: BackendRoutePayload): MappedRouteDTO | null {
    const id = Datos.toNumber(raw.routeId);
    if (!id || !raw.routeName) {
      return null;
    }

    return {
      id,
      nombre: raw.routeName,
      descripcion: raw.description ?? '',
      status: raw.status ?? '',
      userId: Datos.toNumber(raw.userId ?? raw.user_id),
    };
  }

  private static mapBackendRouteServicesCount(raw: BackendRouteServicesCountPayload): {routeId: number; routeName: string; servicesCount: number} | null {
    const routeId = Datos.toNumber(raw.routeId);
    if (!routeId) {
      return null;
    }

    return {
      routeId,
      routeName: raw.routeName ?? '',
      servicesCount: Datos.toNumber(raw.servicesCount) ?? 0,
    };
  }

  private static mapBackendRouteStatistics(raw: BackendRouteStatisticsPayload): {routeId: number; metrics: RouteDailyMetrics} | null {
    const routeId = Datos.toNumber(raw.routeId);
    if (!routeId) {
      return null;
    }

    return {
      routeId,
      metrics: {
        completedCount: Datos.toNumber(raw.completedCount) ?? 0,
        pendingCount: Datos.toNumber(raw.pendingCount) ?? 0,
        canceledCount: Datos.toNumber(raw.canceledCount) ?? 0,
        rescheduledCount: Datos.toNumber(raw.rescheduledCount) ?? 0,
        servicesCount: Datos.toNumber(raw.servicesCount) ?? 0,
      },
    };
  }

  private static mapRouteToUI(route: MappedRouteDTO, usersById: Record<number, MappedUserDTO>): RutaData {
    const conductor = route.userId ? usersById[route.userId] : null;

    return {
      id: route.id,
      nombre: route.nombre,
      conductor: conductor?.nombre ?? '',
      vehiculoAsignado: '',
      completado: 0,
      destinosCompletados: 0,
      ultimoDestino: route.descripcion || '-',
      destinosPendientes: 0,
      destinosCancelados: 0,
    };
  }

  private static normalizeServiceLifecycleStatus(raw: BackendServicePayload): ServiceLifecycleStatus {
    const status = String(raw.status ?? '').toLowerCase();
    const skippedTokens = ['skip', 'skipped', 'saltad', 'omit', 'no atendido', 'no_atendido', 'r', 'retras', 'postpon', 'reprogram'];
    if (skippedTokens.some(token => status.includes(token))) {
      return 'skipped';
    }

    const canceledByFlag = Boolean(raw.canceled ?? raw.isCanceled);

    if (canceledByFlag || status.includes('cancel')) {
      return 'canceled';
    }

    const completedTokens = ['c', 'completed', 'completado', 'done', 'finished', 'finalizado', 'atendido', 'closed'];
    if (completedTokens.some(token => status === token || status.includes(token))) {
      return 'completed';
    }

    return 'pending';
  }

  private static normalizeDateToIsoDay(value: string | undefined): string | null {
    if (!value) {
      return null;
    }

    const asIsoPrefix = value.trim().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(asIsoPrefix)) {
      return asIsoPrefix;
    }

    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed)) {
      return null;
    }

    const date = new Date(parsed);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private static getServiceIsoDate(raw: BackendServicePayload): string | null {
    return Datos.normalizeDateToIsoDay(raw.serviceDate ?? raw.service_date ?? raw.scheduledDate ?? raw.createdAt);
  }

  private static buildMediaUrlCandidates(rawUrl: string): string[] {
    const cleaned = rawUrl.trim().replace(/\\/g, '/');
    if (!cleaned) {
      return [];
    }

    if (/^https?:\/\//i.test(cleaned) || /^data:/i.test(cleaned)) {
      return [cleaned];
    }

    if (cleaned.startsWith('//')) {
      return [`https:${cleaned}`];
    }

    const normalizedPath = cleaned.replace(/^\.\//, '');
    const pathWithSlash = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    const baseCandidates = getApiBaseUrlCandidates();

    const candidates = baseCandidates.flatMap(base => {
      const normalizedBase = base.replace(/\/+$/, '');
      const hostBase = normalizedBase.replace(/\/api$/i, '');
      return [
        `${hostBase}${pathWithSlash}`,
        `${normalizedBase}${pathWithSlash}`,
      ];
    });

    return [...new Set(candidates)];
  }

  private static resolveMediaUrl(rawUrl: string | undefined): string | undefined {
    if (!rawUrl) {
      return undefined;
    }

    const [firstCandidate] = Datos.buildMediaUrlCandidates(rawUrl);
    return firstCandidate;
  }

  private static filterServicesByDate(services: BackendServicePayload[], date: string): BackendServicePayload[] {
    const targetDate = Datos.normalizeDateToIsoDay(date);
    if (!targetDate) {
      return services;
    }

    const withDate = services.filter(item => Boolean(Datos.getServiceIsoDate(item)));
    if (withDate.length === 0) {
      return services;
    }

    return withDate.filter(item => Datos.getServiceIsoDate(item) === targetDate);
  }

  private static getTodayIsoDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private static mapBackendServiceToRutaServicio(raw: BackendServicePayload, fallbackRutaId: number): RutaServicioData | null {
    const id = Datos.toNumber(raw.serviceId);
    const rutaId = Datos.toNumber(raw.routeId ?? raw.route_id) ?? fallbackRutaId;

    if (!id || !rutaId) {
      return null;
    }

    return {
      id,
      rutaId,
      destino: (raw.destination ?? raw.address ?? `Servicio ${id}`).trim(),
      estado: Datos.normalizeServiceLifecycleStatus(raw),
      comentario: (raw.comment ?? raw.observation ?? '').trim(),
      fechaServicio: Datos.getServiceIsoDate(raw) ?? undefined,
    };
  }

  private static buildRouteMetricsFromServices(
    services: BackendServicePayload[],
    fallbackLastDestination: string,
  ): Pick<RutaData, 'completado' | 'destinosCompletados' | 'destinosPendientes' | 'destinosCancelados' | 'ultimoDestino'> {
    let destinosCompletados = 0;
    let destinosPendientes = 0;
    let destinosCancelados = 0;
    let ultimoDestino = fallbackLastDestination || '-';

    services.forEach(item => {
      const serviceStatus = Datos.normalizeServiceLifecycleStatus(item);
      const destinationLabel = (item.destination ?? item.address ?? '').trim();

      if (destinationLabel) {
        ultimoDestino = destinationLabel;
      }

      if (serviceStatus === 'completed') {
        destinosCompletados += 1;
        return;
      }

      if (serviceStatus === 'canceled' || serviceStatus === 'skipped') {
        destinosCancelados += 1;
      }

      destinosPendientes += 1;
    });

    const totalServicios = services.length;
    const completado = totalServicios > 0 ? Math.round((destinosCompletados / totalServicios) * 100) : 0;

    return {
      completado,
      destinosCompletados,
      destinosPendientes,
      destinosCancelados,
      ultimoDestino,
    };
  }

  private static buildRouteMetricsFromDailyData(
    route: RutaData,
    servicesCount: number | null,
    metrics: RouteDailyMetrics | null,
    fallbackLastDestination: string,
  ): Pick<RutaData, 'completado' | 'destinosCompletados' | 'destinosPendientes' | 'destinosCancelados' | 'ultimoDestino'> {
    const completedCount = metrics?.completedCount ?? route.destinosCompletados;
    const pendingCount = metrics?.pendingCount ?? route.destinosPendientes;
    const canceledCount = metrics?.canceledCount ?? 0;
    const rescheduledCount = metrics?.rescheduledCount ?? 0;
    const totalCount = servicesCount ?? metrics?.servicesCount ?? completedCount + pendingCount + canceledCount + rescheduledCount;
    const pendingTotal = pendingCount + canceledCount + rescheduledCount;

    return {
      completado: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      destinosCompletados: completedCount,
      destinosPendientes: pendingTotal,
      destinosCancelados: canceledCount + rescheduledCount,
      ultimoDestino: fallbackLastDestination || '-',
    };
  }

  private static async getRouteServicesCountByDateDesdeBackend(date: string): Promise<Record<number, {routeName: string; servicesCount: number}> | null> {
    try {
      const response = await api.get('/routes/services-count', {
        params: {date},
        withCredentials: true,
      });

      const items = Datos.extractArrayPayload<BackendRouteServicesCountPayload>(response.data);
      if (!items) {
        return null;
      }

      return items
        .map(item => Datos.mapBackendRouteServicesCount(item))
        .filter((item): item is {routeId: number; routeName: string; servicesCount: number} => item !== null)
        .reduce((acc, item) => {
          acc[item.routeId] = {
            routeName: item.routeName,
            servicesCount: item.servicesCount,
          };
          return acc;
        }, {} as Record<number, {routeName: string; servicesCount: number}>);
    } catch {
      return null;
    }
  }

  private static async getRouteStatisticsByDateDesdeBackend(date: string, routeId?: number): Promise<Record<number, RouteDailyMetrics> | null> {
    try {
      const response = await api.get('/routes/statistics', {
        params: {
          date,
          ...(typeof routeId === 'number' ? {routeId} : {}),
        },
        withCredentials: true,
      });

      const items = Datos.extractArrayPayload<BackendRouteStatisticsPayload>(response.data);
      const singleItem = Datos.extractObjectPayload<BackendRouteStatisticsPayload>(response.data);
      const rawItems = items && items.length > 0 ? items : singleItem ? [singleItem] : [];

      if (rawItems.length === 0) {
        return null;
      }

      return rawItems
        .map(item => Datos.mapBackendRouteStatistics(item))
        .filter((item): item is {routeId: number; metrics: RouteDailyMetrics} => item !== null)
        .reduce((acc, item) => {
          acc[item.routeId] = item.metrics;
          return acc;
        }, {} as Record<number, RouteDailyMetrics>);
    } catch {
      return null;
    }
  }

  private static async getServiciosPorRutaDesdeBackend(
    rutaId: number,
    options?: ServicesQueryOptions,
  ): Promise<BackendServicePayload[] | null> {
    const statuses = options?.statuses ?? ['completed', 'pending', 'canceled', 'skipped', 'saltado'];
    const date = options?.date ?? Datos.getTodayIsoDate();

    try {
      const routeResponse = await api.get(`/routes/${rutaId}/services`, {
        params: {
          date,
          statuses: statuses.join(','),
        },
        withCredentials: true,
      });

      const routeItems = Datos.extractArrayPayload<BackendServicePayload>(routeResponse.data);
      if (routeItems && routeItems.length > 0) {
        return Datos.filterServicesByDate(routeItems, date);
      }
    } catch {
      // Fallback to search endpoint when the route-specific endpoint is unavailable.
    }

    try {
      const searchResponse = await api.get('/services/search', {
        params: {
          routeId: rutaId,
          serviceDate: date,
          statuses: statuses.join(','),
        },
        withCredentials: true,
      });

      const searchItems = Datos.extractArrayPayload<BackendServicePayload>(searchResponse.data);
      if (searchItems && searchItems.length > 0) {
        return Datos.filterServicesByDate(searchItems, date);
      }
    } catch {
      // Fallback to legacy route endpoint to preserve compatibility.
    }

    try {
      const response = await api.get(`/services/route/${rutaId}`, {
        withCredentials: true,
      });

      const fallbackItems = Datos.extractArrayPayload<BackendServicePayload>(response.data);
      if (!fallbackItems) {
        return null;
      }
      return Datos.filterServicesByDate(fallbackItems, date);
    } catch {
      return null;
    }
  }

  private static async enrichRouteWithServiceMetrics(
    route: RutaData,
    servicesCountByRoute?: Record<number, {routeName: string; servicesCount: number}> | null,
    statisticsByRoute?: Record<number, RouteDailyMetrics> | null,
  ): Promise<RutaData> {
    const serviceCount = servicesCountByRoute?.[route.id]?.servicesCount ?? statisticsByRoute?.[route.id]?.servicesCount ?? null;
    const dailyMetrics = statisticsByRoute?.[route.id] ?? null;

    if (serviceCount !== null || dailyMetrics) {
      return {
        ...route,
        ...Datos.buildRouteMetricsFromDailyData(route, serviceCount, dailyMetrics, route.ultimoDestino),
      };
    }

    const services = await Datos.getServiciosPorRutaDesdeBackend(route.id);
    if (!services || services.length === 0) {
      return route;
    }

    return {
      ...route,
      ...Datos.buildRouteMetricsFromServices(services, route.ultimoDestino),
    };
  }

  private static mapUserToTrabajador(user: MappedUserDTO): TrabajadorData {
    return {
      id: user.id,
      nombre: user.nombre,
      cargo: user.cargo,
      tipo: user.tipo,
    };
  }

  private static buildUsersById(users: MappedUserDTO[]): Record<number, MappedUserDTO> {
    return users.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<number, MappedUserDTO>);
  }

  private static extractArrayPayload<T>(payload: unknown): T[] | null {
    if (Array.isArray(payload)) {
      return payload as T[];
    }

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const objectPayload = payload as Record<string, unknown>;
    const wrapped = objectPayload.data ?? objectPayload.items ?? objectPayload.result;
    if (Array.isArray(wrapped)) {
      return wrapped as T[];
    }

    return null;
  }

  private static extractObjectPayload<T>(payload: unknown): T | null {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const objectPayload = payload as Record<string, unknown>;
      const wrapped = objectPayload.data ?? objectPayload.item ?? objectPayload.result;
      if (wrapped && typeof wrapped === 'object' && !Array.isArray(wrapped)) {
        return wrapped as T;
      }
      return payload as T;
    }
    return null;
  }

  private static async getUsuariosDesdeBackend(): Promise<MappedUserDTO[] | null> {
    try {
      const response = await api.get(Datos.USERS_ENDPOINT, {withCredentials: true});
      const items = Datos.extractArrayPayload<BackendUserPayload>(response.data);
      if (!items) {
        return null;
      }

      return items
        .map(item => Datos.mapBackendUser(item))
        .filter((item): item is MappedUserDTO => item !== null);
    } catch {
      return null;
    }
  }

  private static async getUsuarioDesdeBackend(id: number): Promise<MappedUserDTO | null> {
    try {
      const response = await api.get(`${Datos.USERS_ENDPOINT}/${id}`, {withCredentials: true});
      const item = Datos.extractObjectPayload<BackendUserPayload>(response.data);
      if (!item) {
        return null;
      }
      return Datos.mapBackendUser(item);
    } catch {
      return null;
    }
  }

  private static async getRutasDesdeBackend(): Promise<MappedRouteDTO[] | null> {
    try {
      const response = await api.get('/routes', {withCredentials: true});
      const items = Datos.extractArrayPayload<BackendRoutePayload>(response.data);
      if (!items) {
        return null;
      }

      return items
        .map(item => Datos.mapBackendRoute(item))
        .filter((item): item is MappedRouteDTO => item !== null);
    } catch {
      return null;
    }
  }

  private static async getRutaDesdeBackend(id: number): Promise<MappedRouteDTO | null> {
    try {
      const response = await api.get(`/routes/${id}`, {withCredentials: true});
      const item = Datos.extractObjectPayload<BackendRoutePayload>(response.data);
      if (!item) {
        return null;
      }
      return Datos.mapBackendRoute(item);
    } catch {
      return null;
    }
  }

  private static async getInspeccionesDesdeBackend(): Promise<MappedInspection[] | null> {
    try {
      const response = await api.get('/inspections', {withCredentials: true});
      const items = Datos.extractArrayPayload<BackendInspectionPayload>(response.data);
      if (!items) {
        return null;
      }

      return items
        .map(item => Datos.mapInspection(item))
        .filter((item): item is MappedInspection => item !== null);
    } catch {
      return null;
    }
  }

  private static async getInspeccionesPorFechaDesdeBackend(date: string): Promise<MappedInspection[] | null> {
    try {
      const response = await api.get('/inspections', {
        params: {date},
        withCredentials: true,
      });

      const items = Datos.extractArrayPayload<BackendInspectionPayload>(response.data);
      if (!items) {
        return null;
      }

      return items
        .map(item => Datos.mapInspection(item))
        .filter((item): item is MappedInspection => item !== null);
    } catch {
      return null;
    }
  }

  private static async getInspeccionDetalleDesdeBackend(inspectionId: number): Promise<MappedInspection | null> {
    try {
      const response = await api.get(`/inspections/${inspectionId}`, {withCredentials: true});
      const item = Datos.extractObjectPayload<BackendInspectionPayload>(response.data);
      if (!item) {
        return null;
      }

      return Datos.mapInspection(item);
    } catch {
      return null;
    }
  }

  private static async getInspeccionesPorVehiculoDesdeBackend(vehicleId: number): Promise<MappedInspection[] | null> {
    try {
      const response = await api.get(`/inspections/vehicle/${vehicleId}`, {withCredentials: true});
      const items = Datos.extractArrayPayload<BackendInspectionPayload>(response.data);
      if (!items) {
        return null;
      }

      return items
        .map(item => Datos.mapInspection(item))
        .filter((item): item is MappedInspection => item !== null);
    } catch {
      return null;
    }
  }

  private static async getInspeccionesPorUsuarioDesdeBackend(userId: number): Promise<MappedInspection[] | null> {
    try {
      const response = await api.get(`/inspections/user/${userId}`, {withCredentials: true});
      const items = Datos.extractArrayPayload<BackendInspectionPayload>(response.data);
      if (!items) {
        return null;
      }

      return items
        .map(item => Datos.mapInspection(item))
        .filter((item): item is MappedInspection => item !== null);
    } catch {
      return null;
    }
  }

  private static async findAssignedRouteForUserBackend(userId: number): Promise<MappedRouteDTO | null> {
    const allRoutes = await Datos.getRutasDesdeBackend();
    if (!allRoutes) {
      return null;
    }

    return allRoutes.find(route => route.userId === userId) ?? null;
  }

  private static async assignRouteToUserOnBackend(route: MappedRouteDTO, userId: number | null): Promise<boolean> {
    const assigneeId = userId ?? 0;

    try {
      await api.patch(`/routes/${route.id}/assign-user/${assigneeId}`, undefined, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  static async createVehicle(payload: BackendVehiculoPayload): Promise<boolean> {
    try {
      await api.post('/vehicles', payload, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  static async updateVehicle(id: number, payload: BackendVehiculoPayload): Promise<boolean> {
    try {
      await api.put(`/vehicles/${id}`, payload, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  static async deleteVehicle(id: number): Promise<boolean> {
    try {
      await api.delete(`/vehicles/${id}`, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  static async createRoute(payload: BackendRoutePayload): Promise<boolean> {
    try {
      await api.post('/routes', payload, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  static async updateRoute(id: number, payload: BackendRoutePayload): Promise<boolean> {
    try {
      await api.put(`/routes/${id}`, payload, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  static async deleteRoute(id: number): Promise<boolean> {
    try {
      await api.delete(`/routes/${id}`, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  static async createUser(payload: BackendUserPayload): Promise<boolean> {
    try {
      await api.post(Datos.USERS_ENDPOINT, payload, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  static async updateUser(id: number, payload: BackendUserPayload): Promise<boolean> {
    try {
      await api.put(`${Datos.USERS_ENDPOINT}/${id}`, payload, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  static async deleteUser(id: number): Promise<boolean> {
    try {
      await api.delete(`${Datos.USERS_ENDPOINT}/${id}`, {withCredentials: true});
      return true;
    } catch {
      return false;
    }
  }

  private static async getEvidenceByRutaDesdeBackend(rutaId: number): Promise<BackendEvidencePayload | null> {
    try {
      const response = await api.get('/evidence', {
        withCredentials: true,
      });

      const many = Datos.extractArrayPayload<BackendEvidencePayload>(response.data);
      if (many && many.length > 0) {
        const byRoute = many.find(item => {
          const evidenceRouteId = Datos.toNumber(item.routeId ?? item.route_id);
          const evidenceServiceId = Datos.toNumber(item.serviceId);
          return evidenceRouteId === rutaId || evidenceServiceId === rutaId;
        });

        return byRoute ?? many[0];
      }

      const single = Datos.extractObjectPayload<BackendEvidencePayload>(response.data);
      return single ?? null;
    } catch {
      return null;
    }
  }

  private static async getEvidenceByServiceDesdeBackend(serviceId: number): Promise<BackendEvidencePayload | null> {
    try {
      const response = await api.get(`/evidence/service/${serviceId}`, {
        withCredentials: true,
      });

      const many = Datos.extractArrayPayload<BackendEvidencePayload>(response.data);
      if (many && many.length > 0) {
        return many[0];
      }

      const single = Datos.extractObjectPayload<BackendEvidencePayload>(response.data);
      return single ?? null;
    } catch {
      return null;
    }
  }

  private static async buildEvidenciaDataFromBackend(
    rutaId: number,
    evidenceId: number,
    evidencePayload?: BackendEvidencePayload | null,
  ): Promise<EvidenciaData> {
    const payloadImages = [
      ...(evidencePayload?.images ?? []),
      ...(evidencePayload?.pre_images ?? []),
      ...(evidencePayload?.post_images ?? []),
      ...(evidencePayload?.skipped_service_images ?? []),
    ];

    const [images, waste] = await Promise.all([
      payloadImages.length > 0
        ? Promise.resolve(payloadImages)
        : Datos.getImagesByEvidenceFromBackend(evidenceId),
      Datos.getEvidenceWasteByEvidenceFromBackend(evidenceId),
    ]);

    const estadoAlLlegar: ImagenEvidencia[] = [];
    const estadoAlSalir: ImagenEvidencia[] = [];
    let firmaEncargado: ImagenEvidencia | null = null;

    (images ?? []).forEach((img, idx) => {
      const id = Datos.toNumber(img.imageId) ?? idx + 1;
      const rawType = img.imageType ?? img.type;
      const type = String(rawType ?? '').toLowerCase();
      const rawUrl = img.imageUrl ?? img.url ?? img.fileUrl ?? img.file_url ?? img.path;
      const resolvedUrl = Datos.resolveMediaUrl(rawUrl?.trim());
      const descripcion =
        img.description?.trim() ||
        img.comment?.trim() ||
        img.observation?.trim() ||
        rawUrl ||
        rawType ||
        `Imagen ${id}`;
      const imageData = {
        id,
        descripcion,
        url: resolvedUrl,
      };

      if (type.includes('firma') || type.includes('sign')) {
        if (!firmaEncargado) {
          firmaEncargado = imageData;
        }
        return;
      }

      if (type.includes('salir') || type.includes('leave')) {
        estadoAlSalir.push(imageData);
        return;
      }

      estadoAlLlegar.push(imageData);
    });

    if (!firmaEncargado) {
      const signatureUrl = Datos.resolveMediaUrl(evidencePayload?.signature_url?.trim());
      firmaEncargado = signatureUrl
        ? {id: -1, descripcion: 'Firma registrada', url: signatureUrl}
        : {id: -1, descripcion: 'Sin firma registrada'};
    }

    const comentarioPartes = (waste ?? []).map(item => {
      const typeLabel = item.wasteTypeId ? `Tipo ${item.wasteTypeId}` : 'Tipo no especificado';
      return `${typeLabel}: ${item.weight} kg`;
    });

    if (evidencePayload?.skipped_service_description || evidencePayload?.skipped_service_reported_at) {
      comentarioPartes.unshift(
        [evidencePayload.skipped_service_description, evidencePayload.skipped_service_reported_at]
          .filter(Boolean)
          .join(' · '),
      );
    }

    return {
      rutaId,
      comentario: comentarioPartes.length > 0 ? comentarioPartes.join(' | ') : `Evidencia ${evidenceId}`,
      estadoAlLlegar: estadoAlLlegar.length > 0 ? estadoAlLlegar : [{id: -2, descripcion: 'Sin imágenes de llegada'}],
      estadoAlSalir: estadoAlSalir.length > 0 ? estadoAlSalir : [{id: -3, descripcion: 'Sin imágenes de salida'}],
      firmaEncargado,
    };
  }

  private static mapBackendServiceToDestinoCancelado(
    raw: BackendServicePayload,
    fallbackRutaId: number,
  ): DestinoCanceladoData | null {
    const id = Datos.toNumber(raw.serviceId);
    const rutaId = Datos.toNumber(raw.routeId ?? raw.route_id) ?? fallbackRutaId;

    if (!id || !rutaId) {
      return null;
    }

    const serviceStatus = Datos.normalizeServiceLifecycleStatus(raw);
    if (serviceStatus !== 'skipped' && serviceStatus !== 'canceled') {
      return null;
    }

    const comentario = (raw.comment ?? raw.observation ?? raw.skipped_service_description ?? '').trim();

    return {
      id,
      rutaId,
      destino: raw.destination ?? raw.address ?? `Servicio ${id}`,
      comentario:
        comentario || 'Servicio saltado durante el recorrido; pendiente de atencion.',
    };
  }

  private static async getDestinosCanceladosDesdeBackend(rutaId: number): Promise<DestinoCanceladoData[] | null> {
    try {
      const response = await api.get(`/services/route/${rutaId}`, {
        withCredentials: true,
      });

      const items = Datos.extractArrayPayload<BackendServicePayload>(response.data);
      if (!items) {
        return null;
      }

      return items
        .map(item => Datos.mapBackendServiceToDestinoCancelado(item, rutaId))
        .filter((item): item is DestinoCanceladoData => item !== null)
        .filter(item => item.rutaId === rutaId);
    } catch {
      return null;
    }
  }

  private static async getImagesByEvidenceFromBackend(evidenceId: number): Promise<BackendImagePayload[] | null> {
    const tryExtractImages = (payload: unknown): BackendImagePayload[] | null => {
      const direct = Datos.extractArrayPayload<BackendImagePayload>(payload);
      if (direct && direct.length > 0) {
        return direct;
      }

      const wrapped = Datos.extractObjectPayload<Record<string, unknown>>(payload);
      if (!wrapped) {
        return null;
      }

      const nestedImages = wrapped.images;
      if (Array.isArray(nestedImages) && nestedImages.length > 0) {
        return nestedImages as BackendImagePayload[];
      }

      const nestedData = wrapped.data;
      if (Array.isArray(nestedData) && nestedData.length > 0) {
        return nestedData as BackendImagePayload[];
      }

      return null;
    };

    const endpoints = [
      `/images/evidence/${evidenceId}`,
      `/evidence/${evidenceId}/images`,
      `/evidence/images/${evidenceId}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, {withCredentials: true});
        const images = tryExtractImages(response.data);
        if (images && images.length > 0) {
          return images;
        }
      } catch {
        // Continue with next endpoint candidate.
      }
    }

    try {
      const response = await api.get('/images', {
        params: {evidenceId},
        withCredentials: true,
      });
      const images = tryExtractImages(response.data);
      if (images && images.length > 0) {
        return images;
      }
    } catch {
      return null;
    }

    return null;
  }

  private static async getEvidenceWasteByEvidenceFromBackend(evidenceId: number): Promise<MappedEvidenceWaste[] | null> {
    try {
      const response = await api.get(`/evidence-waste/evidence/${evidenceId}`, {withCredentials: true});
      const items = Datos.extractArrayPayload<BackendEvidenceWastePayload>(response.data);
      if (!items) {
        return null;
      }

      return items
        .map(item => {
          const id = Datos.toNumber(item.evidenceWasteId);
          const weight = Datos.toNumber(item.weight);
          if (!id || weight === null) {
            return null;
          }
          return {
            id,
            weight,
            wasteTypeId: Datos.toNumber(item.wasteTypeId),
          } as MappedEvidenceWaste;
        })
        .filter((item): item is MappedEvidenceWaste => item !== null);
    } catch {
      return null;
    }
  }

  private static async getVehiculosDesdeBackend(): Promise<VehiculoData[] | null> {
    try {
      const [vehiclesResponse, inspections] = await Promise.all([
        api.get('/vehicles', {withCredentials: true}),
        Datos.getInspeccionesDesdeBackend(),
      ]);

      const items = Datos.extractArrayPayload<BackendVehiculoPayload>(vehiclesResponse.data);
      if (!items) {
        return null;
      }

      const inspectionsByVehicle: Record<number, MappedInspection[]> = {};
      (inspections ?? []).forEach(inspection => {
        if (!inspection.vehicleId) {
          return;
        }
        if (!inspectionsByVehicle[inspection.vehicleId]) {
          inspectionsByVehicle[inspection.vehicleId] = [];
        }
        inspectionsByVehicle[inspection.vehicleId].push(inspection);
      });

      return items
        .map(item => Datos.mapBackendVehiculo(item))
        .filter((item): item is VehiculoData => item !== null)
        .map(vehicle => {
          const latest = Datos.getLatestInspection(inspectionsByVehicle[vehicle.id] ?? []);
          return {
            ...vehicle,
            kilometraje: latest?.kilometrage ?? 0,
          };
        });
    } catch {
      return null;
    }
  }

  private static async getVehiculoDesdeBackend(id: number): Promise<VehiculoData | null> {
    try {
      const [vehicleResponse, inspections] = await Promise.all([
        api.get(`/vehicles/${id}`, {withCredentials: true}),
        Datos.getInspeccionesPorVehiculoDesdeBackend(id),
      ]);

      const item = Datos.extractObjectPayload<BackendVehiculoPayload>(vehicleResponse.data);
      if (!item) {
        return null;
      }

      const mapped = Datos.mapBackendVehiculo(item);
      if (!mapped) {
        return null;
      }

      const latest = Datos.getLatestInspection(inspections ?? []);

      return {
        ...mapped,
        kilometraje: latest?.kilometrage ?? 0,
      };
    } catch {
      return null;
    }
  }

  private static async getVehiculoEstadoDesdeBackend(id: number): Promise<VehiculoEstadoData | null> {
    try {
      const today = Datos.getTodayIsoDate();
      const todayInspections = await Datos.getInspeccionesPorFechaDesdeBackend(today);
      const inspectionCandidate = (todayInspections ?? [])
        .filter(item => item.vehicleId === id)
        .sort(Datos.compareInspectionsByRecency)[0]
        ?? (await Datos.getInspeccionesPorVehiculoDesdeBackend(id) ?? []).sort(Datos.compareInspectionsByRecency)[0];

      if (!inspectionCandidate) {
        return null;
      }

      const latest = await Datos.getInspeccionDetalleDesdeBackend(inspectionCandidate.inspectionId);
      const effectiveInspection = latest ?? inspectionCandidate;

      if (!effectiveInspection || effectiveInspection.isApproved) {
        return {
          vehiculoId: id,
          deficiencias: [],
          comentarios: [],
        };
      }

      const observation = effectiveInspection.observation.trim();
      const deficiencias = observation ? [observation] : [];
      const comentarios = effectiveInspection.images
        .map(item => (item.description ?? '').trim())
        .filter(Boolean);

      if (comentarios.length === 0 && observation) {
        comentarios.push(observation);
      }

      return {
        vehiculoId: id,
        deficiencias,
        comentarios,
      };
    } catch {
      return null;
    }
  }

  static async autenticar(usuario: string, contrasena: string, persistence?: boolean): Promise<SesionUsuario> {
    const payload = {
      username: usuario.trim(),
      password: contrasena,
      ...(typeof persistence === 'boolean' ? {persistence} : {}),
    };

    const baseUrlCandidates = getApiBaseUrlCandidates();
    let lastNetworkError: ApiError | null = null;

    for (const baseUrl of baseUrlCandidates) {
      setApiBaseUrl(baseUrl);
      try {
        const response = await api.post<BackendAuthErrorPayload>(
          '/auth/login',
          payload,
          {
            withCredentials: true,
          },
        );

        const responseData = response.data;

        if (responseData?.status === 'error' || responseData?.error?.code) {
          const apiError: ApiError = {
            kind: responseData.error?.code === 'INVALID_CREDENTIALS' ? 'unauthenticated' : 'unknown',
            message: responseData.error?.details || responseData.message || 'No se pudo iniciar sesión',
          };

          throw apiError;
        }

        // The backend uses HttpOnly session cookie, so we keep a local auth marker
        // to preserve current app flow with minimal structural changes.
        return {token: 'session-cookie', username: usuario};
      } catch (rawError) {
        const apiError = rawError as ApiError;
        const isNetworkError = !apiError.status;

        if (isNetworkError) {
          lastNetworkError = apiError;
          continue;
        }

        throw apiError;
      }
    }

    throw (
      lastNetworkError ?? {
        kind: 'unknown',
        message: 'No se pudo iniciar sesión',
      }
    );
  }

  static async validarSesionActiva(): Promise<boolean> {
    return false;
  }

  static async getMenuItems(): Promise<OpcionMenu[]> {
    return Datos.MENU.map(item => ({...item}));
  }

  static async getRutaAcciones(): Promise<AccionRuta[]> {
    return Datos.RUTA_ACCIONES.map(accion => ({...accion}));
  }

  static async getRutas(): Promise<RutaData[]> {
    const [routes, users] = await Promise.all([
      Datos.getRutasDesdeBackend(),
      Datos.getUsuariosDesdeBackend(),
    ]);

    if (routes && routes.length > 0) {
      const usersById = Datos.buildUsersById(users ?? []);
      const today = Datos.getTodayIsoDate();
      const [servicesCountByRoute, statisticsByRoute] = await Promise.all([
        Datos.getRouteServicesCountByDateDesdeBackend(today),
        Datos.getRouteStatisticsByDateDesdeBackend(today),
      ]);

      const mappedRoutes = routes.map(route =>
        Datos.mapRouteToUI(
          {
            ...route,
            userId: route.userId ?? null,
          },
          usersById,
        ),
      );

      return Promise.all(mappedRoutes.map(route => Datos.enrichRouteWithServiceMetrics(route, servicesCountByRoute, statisticsByRoute)));
    }

    return Datos.RUTAS.map(ruta => {
      const mapped = Datos.mapRutaConConductorAsignado(ruta);
      const pendientesTotales = mapped.destinosPendientes + mapped.destinosCancelados;
      return {
        ...mapped,
        destinosPendientes: pendientesTotales,
        destinosCancelados: 0,
      };
    });
  }

  static async getRutaById(id: number): Promise<RutaData | null> {
    const [route, users] = await Promise.all([
      Datos.getRutaDesdeBackend(id),
      Datos.getUsuariosDesdeBackend(),
    ]);

    if (route) {
      const usersById = Datos.buildUsersById(users ?? []);
      const mapped = Datos.mapRouteToUI(route, usersById);
      const today = Datos.getTodayIsoDate();
      const [servicesCountByRoute, statisticsByRoute] = await Promise.all([
        Datos.getRouteServicesCountByDateDesdeBackend(today),
        Datos.getRouteStatisticsByDateDesdeBackend(today, id),
      ]);

      return Datos.enrichRouteWithServiceMetrics(mapped, servicesCountByRoute, statisticsByRoute);
    }

    const ruta = Datos.RUTAS.find(item => item.id === id);
    if (!ruta) {
      return null;
    }

    const mapped = Datos.mapRutaConConductorAsignado(ruta);
    return {
      ...mapped,
      destinosPendientes: mapped.destinosPendientes + mapped.destinosCancelados,
      destinosCancelados: 0,
    };
  }

  private static readonly EVIDENCIAS: EvidenciaData[] = [
    {
      rutaId: 1,
      comentario: 'La recolección inició con retraso por congestión en el acceso al mercado. Se completó el vaciado de un contenedor principal.',
      estadoAlLlegar: [{id: 1, descripcion: 'Contenedor principal antes del vaciado'}, {id: 2, descripcion: 'Frente del vehículo al inicio del turno'}],
      estadoAlSalir: [{id: 1, descripcion: 'Contenedor vaciado y área asegurada'}, {id: 2, descripcion: 'Zona barrida tras la recolección'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del encargado del punto de acopio'},
    },
    {
      rutaId: 2,
      comentario: 'Sin incidencias. Se completó la recolección de residuos domiciliarios según el recorrido programado.',
      estadoAlLlegar: [{id: 1, descripcion: 'Tolva vacía antes de iniciar la ruta'}],
      estadoAlSalir: [{id: 1, descripcion: 'Punto de recolección liberado'}, {id: 2, descripcion: 'Área sin residuos dispersos'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del supervisor de zona'},
    },
    {
      rutaId: 3,
      comentario: 'Dos puntos quedaron para una segunda pasada porque los contenedores aún no habían sido colocados en la vía autorizada.',
      estadoAlLlegar: [{id: 1, descripcion: 'Contenedores sin acceso libre al arribo'}, {id: 2, descripcion: 'Estado del vehículo al comenzar el tramo'}],
      estadoAlSalir: [{id: 1, descripcion: 'Registro del punto pendiente para segunda visita'}, {id: 2, descripcion: 'Observación de acceso restringido adjunta'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del inspector de sector'},
    },
    {
      rutaId: 4,
      comentario: 'Ruta cumplida al 100%. Recolección industrial sin observaciones ni derrames.',
      estadoAlLlegar: [{id: 1, descripcion: 'Contenedores industriales antes del vaciado'}, {id: 2, descripcion: 'Compuerta del vehículo asegurada'}],
      estadoAlSalir: [{id: 1, descripcion: 'Contenedores vacíos'}, {id: 2, descripcion: 'Patio limpio al finalizar el servicio'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del encargado de planta'},
    },
    {
      rutaId: 5,
      comentario: 'Un punto de recolección fue cancelado porque la ubicación registrada no coincidía con el contenedor asignado.',
      estadoAlLlegar: [{id: 1, descripcion: 'Punto revisado sin contenedor visible'}],
      estadoAlSalir: [{id: 1, descripcion: 'Incidencia registrada en la ruta'}, {id: 2, descripcion: 'Evidencia fotográfica del punto vacío'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del supervisor de operación'},
    },
    {
      rutaId: 6,
      comentario: 'La lluvia redujo la velocidad de recorrido en la zona norte, pero se mantuvo la recolección de residuos húmedos.',
      estadoAlLlegar: [{id: 1, descripcion: 'Tolva y tapas verificadas por lluvia'}, {id: 2, descripcion: 'Estado inicial de la vía'}],
      estadoAlSalir: [{id: 1, descripcion: 'Recolección completada bajo lluvia'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del coordinador de zona norte'},
    },
    {
      rutaId: 7,
      comentario: 'La unidad presentó una falla menor en el sistema hidráulico; la recolección se reanudó con 40 minutos de retraso.',
      estadoAlLlegar: [{id: 1, descripcion: 'Vehículo antes de la revisión mecánica'}, {id: 2, descripcion: 'Sistema de compactación asegurado'}],
      estadoAlSalir: [{id: 1, descripcion: 'Ruta reanudada y tramo final completado'}, {id: 2, descripcion: 'Reporte técnico adjunto'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del técnico de mantenimiento'},
    },
    {
      rutaId: 8,
      comentario: 'Ruta completada sin incidencias. Se retiraron residuos orgánicos y reciclables según lo previsto.',
      estadoAlLlegar: [{id: 1, descripcion: 'Puntos de acopio en condición operativa al inicio'}],
      estadoAlSalir: [{id: 1, descripcion: 'Recolección completada y zona despejada'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del responsable municipal'},
    },
    {
      rutaId: 9,
      comentario: 'Se detectó un contenedor fracturado durante el recorrido y se notificó al área de mantenimiento urbano.',
      estadoAlLlegar: [{id: 1, descripcion: 'Contenedor en uso al inicio'}, {id: 2, descripcion: 'Unidad operativa antes del vaciado'}],
      estadoAlSalir: [{id: 1, descripcion: 'Daño registrado en el contenedor'}, {id: 2, descripcion: 'Fotografía de la estructura afectada'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del inspector de calidad urbana'},
    },
    {
      rutaId: 10,
      comentario: 'Sin novedades. Recolección rápida en zona comercial completada antes del horario pico.',
      estadoAlLlegar: [{id: 1, descripcion: 'Equipo listo para recolección rápida'}],
      estadoAlSalir: [{id: 1, descripcion: 'Registro de recolección completada'}, {id: 2, descripcion: 'Foto del punto despejado'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del encargado comercial'},
    },
    {
      rutaId: 11,
      comentario: 'Punto ubicado en zona restringida; se coordinó el ingreso con seguridad para retirar residuos acumulados.',
      estadoAlLlegar: [{id: 1, descripcion: 'Acceso autorizado por seguridad'}, {id: 2, descripcion: 'Vehículo en ingreso controlado'}],
      estadoAlSalir: [{id: 1, descripcion: 'Residuos retirados en caseta de control'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del guardia de acceso'},
    },
    {
      rutaId: 12,
      comentario: 'Ruta con el mayor volumen de residuos del mes. El recorrido se completó sin desbordes.',
      estadoAlLlegar: [{id: 1, descripcion: 'Tolva preparada para alto volumen'}, {id: 2, descripcion: 'Compactación inicial verificada'}],
      estadoAlSalir: [{id: 1, descripcion: 'Puntos vaciados por completo'}, {id: 2, descripcion: 'Área sin residuos remanentes'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del jefe de operaciones'},
    },
    {
      rutaId: 13,
      comentario: 'La administración del condominio solicitó reprogramar el retiro de residuos para un nuevo horario y se atendió sin incidentes.',
      estadoAlLlegar: [{id: 1, descripcion: 'Ruta reprogramada lista para ejecución'}],
      estadoAlSalir: [{id: 1, descripcion: 'Recolección en nuevo horario confirmada'}, {id: 2, descripcion: 'Conformidad del encargado registrada'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del encargado del condominio'},
    },
    {
      rutaId: 14,
      comentario: 'Ruta casi finalizada. Un punto de recolección quedó pendiente para la jornada de mañana.',
      estadoAlLlegar: [{id: 1, descripcion: 'Tolva con carga parcial del día'}],
      estadoAlSalir: [{id: 1, descripcion: 'Tramos del día completados'}, {id: 2, descripcion: 'Punto pendiente documentado con fotografía'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del supervisor del turno'},
    },
    {
      rutaId: 15,
      comentario: 'Ruta completada al 100%. Excelente desempeño en la recolección y traslado final de residuos.',
      estadoAlLlegar: [{id: 1, descripcion: 'Inicio de ruta registrado'}, {id: 2, descripcion: 'Kilometraje inicial anotado'}],
      estadoAlSalir: [{id: 1, descripcion: 'Último punto de recolección completado'}, {id: 2, descripcion: 'Cierre de ruta confirmado'}],
      firmaEncargado: {id: 1, descripcion: 'Firma del encargado de base operativa'},
    },
  ];

  private static readonly DESTINOS_CANCELADOS: DestinoCanceladoData[] = [
    {id: 1, rutaId: 1, destino: 'Av. Grau 450', comentario: 'El punto quedó inaccesible por cierre temporal del mercado y no se pudo retirar el contenedor.'},
    {id: 2, rutaId: 3, destino: 'Jr. Unión 181', comentario: 'La unidad no pudo ingresar por bloqueo de vía en el horario programado.'},
    {id: 3, rutaId: 5, destino: 'Los Olivos Mz B Lt 8', comentario: 'La ubicación registrada no coincidía con el punto real de recolección.'},
    {id: 4, rutaId: 7, destino: 'Pueblo Libre 245', comentario: 'La falla mecánica retrasó el recorrido y el punto fue reprogramado para el siguiente turno.'},
    {id: 5, rutaId: 9, destino: 'Barranco 902', comentario: 'El contenedor estaba fracturado y se canceló la recolección hasta reemplazo por seguridad.'},
    {id: 6, rutaId: 11, destino: 'Comas Sector 3', comentario: 'Acceso restringido sin autorización vigente al momento de la visita.'},
    {id: 7, rutaId: 14, destino: 'Ate Zona Industrial', comentario: 'El horario autorizado para retiro de residuos había finalizado y el servicio quedó reagendado.'},
  ];

  static async getVehiculos(): Promise<VehiculoData[]> {
    const backendData = await Datos.getVehiculosDesdeBackend();
    if (backendData && backendData.length > 0) {
      return backendData;
    }

    return Datos.VEHICULOS.map(v => ({
      ...v,
      rutaAsignada: Datos.getRutaAsignadaNombreByVehiculoId(v.id),
    }));
  }

  static async getVehiculoById(id: number): Promise<VehiculoData | null> {
    const backendData = await Datos.getVehiculoDesdeBackend(id);
    if (backendData) {
      return backendData;
    }

    const vehiculo = Datos.VEHICULOS.find(item => item.id === id);
    return vehiculo
      ? {
          ...vehiculo,
          rutaAsignada: Datos.getRutaAsignadaNombreByVehiculoId(vehiculo.id),
        }
      : null;
  }

  static async getVehiculoAsignadoPorRutaId(rutaId: number): Promise<VehiculoData | null> {
    const route = await Datos.getRutaDesdeBackend(rutaId);
    if (route?.userId) {
      const inspections = await Datos.getInspeccionesPorUsuarioDesdeBackend(route.userId);
      const latestWithVehicle = (inspections ?? [])
        .filter(item => typeof item.vehicleId === 'number')
        .sort((a, b) => {
          const first = Date.parse(a.inspectionDate || '');
          const second = Date.parse(b.inspectionDate || '');
          return (Number.isFinite(second) ? second : 0) - (Number.isFinite(first) ? first : 0);
        })[0];

      if (latestWithVehicle?.vehicleId) {
        const vehicle = await Datos.getVehiculoById(latestWithVehicle.vehicleId);
        if (vehicle) {
          return {
            ...vehicle,
            rutaAsignada: route.nombre,
          };
        }
      }
    }

    const localRoute = Datos.RUTAS.find(item => item.id === rutaId);
    if (!localRoute?.vehiculoAsignado) {
      return null;
    }

    const localVehicle = Datos.VEHICULOS.find(item => item.placa === localRoute.vehiculoAsignado);
    if (!localVehicle) {
      return null;
    }

    const vehicle = await Datos.getVehiculoById(localVehicle.id);
    if (!vehicle) {
      return null;
    }

    return {
      ...vehicle,
      rutaAsignada: localRoute.nombre,
    };
  }

  static async getVehiculoEstadoById(id: number): Promise<VehiculoEstadoData | null> {
    const backendData = await Datos.getVehiculoEstadoDesdeBackend(id);
    if (backendData) {
      return backendData;
    }

    const estado = Datos.VEHICULO_ESTADOS.find(item => item.vehiculoId === id);
    if (!estado) {
      return null;
    }
    return {
      vehiculoId: estado.vehiculoId,
      deficiencias: [...estado.deficiencias],
      comentarios: [...estado.comentarios],
    };
  }

  private static readonly TRABAJADORES: TrabajadorData[] = [
    {id: 1,  nombre: 'Carlos Pérez',        cargo: 'Conductor',          tipo: 'conductor'},
    {id: 2,  nombre: 'Ana López',            cargo: 'Conductora',         tipo: 'conductor'},
    {id: 3,  nombre: 'Luis García',          cargo: 'Conductor',          tipo: 'conductor'},
    {id: 4,  nombre: 'María Torres',         cargo: 'Conductora',         tipo: 'conductor'},
    {id: 5,  nombre: 'Jorge Díaz',           cargo: 'Conductor',          tipo: 'conductor'},
    {id: 6,  nombre: 'Sofía Ramírez',        cargo: 'Conductora',         tipo: 'conductor'},
    {id: 7,  nombre: 'Pedro Castillo',       cargo: 'Conductor',          tipo: 'conductor'},
    {id: 8,  nombre: 'Lucía Herrera',        cargo: 'Conductora',         tipo: 'conductor'},
    {id: 9,  nombre: 'Diego Flores',         cargo: 'Conductor',          tipo: 'conductor'},
    {id: 10, nombre: 'Valentina Cruz',       cargo: 'Conductora',         tipo: 'conductor'},
    {id: 11, nombre: 'Miguel Rojas',         cargo: 'Conductor',          tipo: 'conductor'},
    {id: 12, nombre: 'Camila Vega',          cargo: 'Conductora',         tipo: 'conductor'},
    {id: 13, nombre: 'Andrés Molina',        cargo: 'Conductor',          tipo: 'conductor'},
    {id: 14, nombre: 'Renata Silva',         cargo: 'Conductora',         tipo: 'conductor'},
    {id: 15, nombre: 'Bruno Navarro',        cargo: 'Conductor',          tipo: 'conductor'},
    {id: 16, nombre: 'Fernando Gómez',       cargo: 'Gerente de Rutas',   tipo: 'administrativo'},
    {id: 17, nombre: 'Gabriela Quispe',      cargo: 'Asistente Admin',    tipo: 'administrativo'},
    {id: 18, nombre: 'Roberto Sánchez',      cargo: 'Supervisor',         tipo: 'administrativo'},
    {id: 19, nombre: 'Isabela Martínez',     cargo: 'Coordinadora',       tipo: 'administrativo'},
    {id: 20, nombre: 'Javier López',         cargo: 'Asistente Admin',    tipo: 'administrativo'},
    {id: 21, nombre: 'Marcela Vargas',       cargo: 'Gerente de Flota',   tipo: 'administrativo'},
    {id: 22, nombre: 'Ricardo Fuentes',      cargo: 'Coordinador Logístico', tipo: 'administrativo'},
    {id: 23, nombre: 'Patricia Núñez',       cargo: 'Asistente de Oficina', tipo: 'administrativo'},
  ];

  static async getTrabajadores(): Promise<TrabajadorData[]> {
    const users = await Datos.getUsuariosDesdeBackend();
    if (users && users.length > 0) {
      return users.map(Datos.mapUserToTrabajador);
    }

    return Datos.TRABAJADORES.map(t => ({...t}));
  }

  static async getTrabajadorById(id: number): Promise<TrabajadorData | null> {
    const user = await Datos.getUsuarioDesdeBackend(id);
    if (user) {
      return Datos.mapUserToTrabajador(user);
    }

    const trabajador = Datos.TRABAJADORES.find(item => item.id === id);
    return trabajador ? {...trabajador} : null;
  }

  static async getConductoresSinRuta(): Promise<TrabajadorData[]> {
    const [users, routes] = await Promise.all([
      Datos.getUsuariosDesdeBackend(),
      Datos.getRutasDesdeBackend(),
    ]);

    if (users && routes) {
      const assignedUserIds = new Set<number>(
        routes
          .map(route => route.userId)
          .filter((userId): userId is number => typeof userId === 'number'),
      );

      return users
        .filter(user => user.tipo === 'conductor' && !assignedUserIds.has(user.id))
        .map(Datos.mapUserToTrabajador);
    }

    const conductoresTomados = new Set<number>(Datos.getFallbackAssignedByWorkerId().keys());
    return Datos.TRABAJADORES
      .filter(item => item.tipo === 'conductor' && !conductoresTomados.has(item.id))
      .map(item => ({...item}));
  }

  static async getConductoresParaRuta(rutaId: number): Promise<TrabajadorData[]> {
    const [users, routes] = await Promise.all([
      Datos.getUsuariosDesdeBackend(),
      Datos.getRutasDesdeBackend(),
    ]);

    if (users && routes) {
      const assignedByUser = new Map<number, number>();
      routes.forEach(route => {
        if (typeof route.userId === 'number') {
          assignedByUser.set(route.userId, route.id);
        }
      });

      return users
        .filter(user => user.tipo === 'conductor')
        .filter(user => {
          const assignedRouteId = assignedByUser.get(user.id);
          return !assignedRouteId || assignedRouteId === rutaId;
        })
        .map(Datos.mapUserToTrabajador);
    }

    const assignedByUser = Datos.getFallbackAssignedByWorkerId();

    return Datos.TRABAJADORES
      .filter(item => item.tipo === 'conductor')
      .filter(item => {
        const assignedRouteId = assignedByUser.get(item.id);
        return !assignedRouteId || assignedRouteId === rutaId;
      })
      .map(item => ({...item}));
  }

  static async getConductorAsignadoPorRutaId(rutaId: number): Promise<TrabajadorData | null> {
    const [route, users] = await Promise.all([
      Datos.getRutaDesdeBackend(rutaId),
      Datos.getUsuariosDesdeBackend(),
    ]);

    if (route && users && route.userId) {
      const user = users.find(item => item.id === route.userId);
      if (user && user.tipo === 'conductor') {
        return {
          id: user.id,
          nombre: user.nombre,
          cargo: user.cargo,
          tipo: user.tipo,
        };
      }
    }

    const assignedByWorker = Datos.getFallbackAssignedByWorkerId();
    for (const [trabajadorId, assignedRouteId] of assignedByWorker.entries()) {
      if (assignedRouteId === rutaId) {
        const conductor = Datos.TRABAJADORES.find(item => item.id === trabajadorId && item.tipo === 'conductor');
        return conductor ? {...conductor} : null;
      }
    }
    return null;
  }

  static async asignarRutaAConductor(trabajadorId: number, rutaId: number): Promise<AsignacionRutaResult> {
    const [route, users] = await Promise.all([
      Datos.getRutaDesdeBackend(rutaId),
      Datos.getUsuariosDesdeBackend(),
    ]);

    if (route && users) {
      const trabajador = users.find(item => item.id === trabajadorId);
      if (!trabajador || trabajador.tipo !== 'conductor') {
        return {ok: false, reason: 'invalid-worker'};
      }

      const previousRoute = await Datos.findAssignedRouteForUserBackend(trabajadorId);
      if (previousRoute && previousRoute.id !== rutaId) {
        const released = await Datos.assignRouteToUserOnBackend(previousRoute, null);
        if (!released) {
          return {ok: false, reason: 'already-assigned'};
        }
      }

      const assigned = await Datos.assignRouteToUserOnBackend(route, trabajadorId);
      if (assigned) {
        return {ok: true};
      }

      return {ok: false, reason: 'invalid-route'};
    }

    const trabajador = Datos.TRABAJADORES.find(item => item.id === trabajadorId);
    if (!trabajador || trabajador.tipo !== 'conductor') {
      return {ok: false, reason: 'invalid-worker'};
    }

    const ruta = Datos.RUTAS.find(item => item.id === rutaId);
    if (!ruta) {
      return {ok: false, reason: 'invalid-route'};
    }

    const assignedByWorker = Datos.getFallbackAssignedByWorkerId();
    const rutaActual = assignedByWorker.get(trabajadorId);
    if (rutaActual && rutaActual !== rutaId) {
      return {ok: false, reason: 'already-assigned'};
    }

    for (const [conductorId, assignedRouteId] of assignedByWorker.entries()) {
      if (assignedRouteId === rutaId && conductorId !== trabajadorId) {
        return {ok: false, reason: 'route-taken'};
      }
    }

    Datos.ASIGNACIONES.set(trabajadorId, rutaId);
    return {ok: true};
  }

  static async desasignarRuta(trabajadorId: number): Promise<boolean> {
    const route = await Datos.findAssignedRouteForUserBackend(trabajadorId);
    if (route) {
      const released = await Datos.assignRouteToUserOnBackend(route, null);
      if (released) {
        return true;
      }

      // If backend assignment update fails, keep local state operable.
      Datos.ASIGNACIONES.delete(trabajadorId);
      return true;
    }

    return Datos.ASIGNACIONES.delete(trabajadorId);
  }

  static async asignarConductorARuta(trabajadorId: number, rutaId: number): Promise<AsignacionRutaResult> {
    const result = await Datos.asignarRutaAConductor(trabajadorId, rutaId);
    if (result.ok) {
      return result;
    }

    if (result.reason !== 'already-assigned') {
      return result;
    }

    const current = await Datos.findAssignedRouteForUserBackend(trabajadorId);
    if (!current) {
      return result;
    }

    const removed = await Datos.desasignarRuta(trabajadorId);
    if (!removed) {
      return {ok: false, reason: 'already-assigned'};
    }

    return Datos.asignarRutaAConductor(trabajadorId, rutaId);
  }

  static async getRutaAsignada(trabajadorId: number): Promise<RutaData | null> {
    const route = await Datos.findAssignedRouteForUserBackend(trabajadorId);
    const users = route ? await Datos.getUsuariosDesdeBackend() : null;

    if (route && users) {
      const usersById = Datos.buildUsersById(users);
      return Datos.mapRouteToUI(route, usersById);
    }

    const rutaId = Datos.getFallbackAssignedByWorkerId().get(trabajadorId);
    if (!rutaId) {
      return null;
    }
    const ruta = Datos.RUTAS.find(item => item.id === rutaId);
    return ruta ? Datos.mapRutaConConductorAsignado(ruta) : null;
  }

  static async getRutasDisponiblesParaConductor(trabajadorId: number): Promise<RutaData[]> {
    const [routes, users] = await Promise.all([
      Datos.getRutasDesdeBackend(),
      Datos.getUsuariosDesdeBackend(),
    ]);

    if (routes && users) {
      const usersById = Datos.buildUsersById(users);

      return routes
        .filter(route => !route.userId || route.userId === trabajadorId)
        .map(route => Datos.mapRouteToUI(route, usersById));
    }

    const assignedByWorker = Datos.getFallbackAssignedByWorkerId();
    const rutaAsignada = assignedByWorker.get(trabajadorId);
    const rutasTomadas = new Set<number>(assignedByWorker.values());
    if (rutaAsignada) {
      rutasTomadas.delete(rutaAsignada);
    }
    return Datos.RUTAS.filter(ruta => !rutasTomadas.has(ruta.id)).map(ruta => Datos.mapRutaConConductorAsignado(ruta));
  }

  static async getRutasAsignadasPorConductores(trabajadorIds: number[]): Promise<Record<number, string>> {
    if (trabajadorIds.length === 0) {
      return {};
    }

    const uniqueIds = new Set(trabajadorIds);
    const routes = await Datos.getRutasDesdeBackend();
    if (routes) {
      const assigned: Record<number, string> = {};
      routes.forEach(route => {
        if (typeof route.userId === 'number' && uniqueIds.has(route.userId)) {
          assigned[route.userId] = route.nombre;
        }
      });
      return assigned;
    }

    const localAssigned: Record<number, string> = {};
    const assignedByWorker = Datos.getFallbackAssignedByWorkerId();
    assignedByWorker.forEach((routeId, trabajadorId) => {
      if (!uniqueIds.has(trabajadorId)) {
        return;
      }

      const ruta = Datos.RUTAS.find(item => item.id === routeId);
      if (ruta) {
        localAssigned[trabajadorId] = ruta.nombre;
      }
    });

    return localAssigned;
  }

  static async getEvidenciasByRutaId(rutaId: number): Promise<EvidenciaData | null> {
    const evidence = await Datos.getEvidenceByRutaDesdeBackend(rutaId);
    const evidenceId = Datos.toNumber(evidence?.evidenceId);

    if (evidenceId) {
      return Datos.buildEvidenciaDataFromBackend(rutaId, evidenceId, evidence);
    }

    const ev = Datos.EVIDENCIAS.find(item => item.rutaId === rutaId);
    if (!ev) {
      return null;
    }
    return {
      rutaId: ev.rutaId,
      comentario: ev.comentario,
      estadoAlLlegar: ev.estadoAlLlegar.map(img => ({...img})),
      estadoAlSalir: ev.estadoAlSalir.map(img => ({...img})),
      firmaEncargado: {...ev.firmaEncargado},
    };
  }

  static async getServiciosConEstadoByRutaId(
    rutaId: number,
    date?: string,
    statuses: string[] = ['completed', 'pending', 'canceled', 'skipped', 'saltado'],
  ): Promise<RutaServicioData[]> {
    const services = await Datos.getServiciosPorRutaDesdeBackend(rutaId, {date, statuses});
    if (services && services.length > 0) {
      return services
        .map(item => Datos.mapBackendServiceToRutaServicio(item, rutaId))
        .filter((item): item is RutaServicioData => item !== null)
        .filter(item => item.rutaId === rutaId);
    }

    return [];
  }

  static async getEvidenciasByServiceId(serviceId: number, rutaId: number): Promise<EvidenciaData | null> {
    const evidence = await Datos.getEvidenceByServiceDesdeBackend(serviceId);
    const evidenceId = Datos.toNumber(evidence?.evidenceId);

    if (evidenceId) {
      return Datos.buildEvidenciaDataFromBackend(rutaId, evidenceId, evidence);
    }

    return null;
  }

  static async getDestinosCanceladosByRutaId(rutaId: number): Promise<DestinoCanceladoData[]> {
    const backendData = await Datos.getDestinosCanceladosDesdeBackend(rutaId);
    if (backendData && backendData.length > 0) {
      return backendData;
    }

    const skippedServices = await Datos.getServiciosConEstadoByRutaId(
      rutaId,
      Datos.getTodayIsoDate(),
      ['canceled', 'skipped', 'saltado'],
    );

    const mappedSkipped = skippedServices.map(service => ({
      id: service.id,
      rutaId,
      destino: service.destino,
      comentario: service.comentario || 'Servicio saltado durante el recorrido; pendiente de atencion.',
    }));

    if (mappedSkipped.length > 0) {
      return mappedSkipped;
    }

    return Datos.DESTINOS_CANCELADOS
      .filter(item => item.rutaId === rutaId)
      .map(item => ({
        ...item,
        comentario: item.comentario || 'Servicio saltado durante el recorrido; pendiente de atencion.',
      }));
  }
}
