export interface Valor {
  titulo: string;
  descripcion: string;
}

export interface Nosotros {
  descripcion: string;
  mision: string;
  vision: string;
  valores: Valor[];
  slogan: string;
  direccion: string;
  telefonos: string[];
}

export interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string; // Lucide icon name
}

export interface Menu {
  id: string;
  nombre: string;
  tipo: 'tiempo' | 'tradicional';
  numTiempos?: number; // 2-5 for tipo 'tiempo'
  conCategorias?: boolean; // true for tipo 'tradicional' with categories
  items: string[];
  salseados?: string[];
  fotos: string[]; // Own gallery
}

export interface Paquete {
  id: string;
  nombre: string;
  precio: number;
  horas: number;
  servicios: string[];
  menus: string[]; // references to Menu ids
  tipoServicio?: 'salon' | 'salon_alimentos';
  orden?: number;
}

export interface Show {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  fotos?: string[];
  videoUrl?: string;
  duracion?: string;
}

export interface ServicioAdicional {
  nombre: string;
  precio: number;
  descripcion?: string;
  sinPrecioFijo?: boolean;
  tipoCobro?: 'evento' | 'persona' | 'cotizacion';
}

export interface Testimonio {
  id: string;
  videoUrl: string;
}

export interface Reglamento {
  precioApartado: number;
  objetosProhibidos: string[];
  reglas: string[];
}

export interface GaleriaItem {
  id: string;
  url: string;
  categoria: string;
  descripcion: string;
}

export interface BannerInicio {
  imagenUrl?: string;
  imagenesUrl?: string[];
  slogan: string;
}

export interface RedesSociales {
  instagram: string;
  facebook: string;
  whatsapp?: string;
}

export interface AppData {
  banner?: BannerInicio;
  redesSociales?: RedesSociales;
  nosotros: Nosotros;
  eventos: Evento[];
  eventos_galeria: string[]; // Shared gallery for all events (photo/video URLs)
  menus: Menu[];
  paquetes_sociales: Paquete[];
  paquetes_infantiles: Paquete[];
  shows: Show[];
  servicios_adicionales: ServicioAdicional[];
  testimonios: Testimonio[];
  reglamento: Reglamento;
  galeria: GaleriaItem[];
  master_servicios_sociales?: string[];
  master_servicios_infantiles?: string[];
}
