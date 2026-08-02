import React, { useState } from "react";
import {
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Video,
  Image as ImageIcon,
  X,
  Clock,
  MessageCircle,
  Film,
  Calendar,
  Users,
  FileText
} from "lucide-react";
import { Show, ServicioAdicional, GaleriaItem } from "../types";

interface ShowsServiciosProps {
  shows: Show[];
  serviciosAdicionales: ServicioAdicional[];
  galeria?: GaleriaItem[];
}

export default function ShowsServicios({ shows, serviciosAdicionales, galeria = [] }: ShowsServiciosProps) {
  const [opcionalesTab, setOpcionalesTab] = useState<'evento' | 'persona' | 'cotizacion'>('evento');
  
  // Shared Gallery items for Shows
  const showsGaleria = galeria.filter(g => g.categoria === 'shows');

  // Modal for shared gallery
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  const classifyService = (item: ServicioAdicional): 'evento' | 'persona' | 'cotizacion' => {
    if (item.tipoCobro) {
      if (item.tipoCobro === 'cotizacion' || item.sinPrecioFijo) return 'cotizacion';
      return item.tipoCobro;
    }
    if (item.sinPrecioFijo || !item.precio || item.precio <= 0) {
      return 'cotizacion';
    }
    const name = item.nombre.toLowerCase();
    const desc = (item.descripcion || '').toLowerCase();
    if (
      name.includes('p/p') ||
      name.includes('por persona') ||
      name.includes('p/persona') ||
      name.includes('por pers') ||
      desc.includes('p/p') ||
      desc.includes('por persona')
    ) {
      return 'persona';
    }
    return 'evento';
  };

  const serviciosPorEvento = serviciosAdicionales.filter((s) => classifyService(s) === 'evento');
  const serviciosPorPersona = serviciosAdicionales.filter((s) => classifyService(s) === 'persona');
  const serviciosCotizacion = serviciosAdicionales.filter((s) => classifyService(s) === 'cotizacion');

  const getWhatsAppLink = (showName: string) => {
    const message = encodeURIComponent(`Hola Quinta Los Rosales, me gustaría solicitar información y cotización del espectáculo "${showName}".`);
    return `https://wa.me/525536073700?text=${message}`;
  };

  const isVideoUrl = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('data:video');
  };

  return (
    <section id="shows" className="py-24 doodle-leaves-bg scroll-mt-10 border-b border-slate-150 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fantasy-purple-100/80 text-fantasy-purple-900 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-fantasy-purple-600" />
            Entretenimiento Exclusivo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fantasy-purple-900">
            Espectáculos Infantiles y Shows de Magia
          </h2>
          <div className="w-16 h-0.5 bg-fantasy-purple-500 mx-auto mt-3 mb-3 rounded-full" />
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Sorprende a tus invitados con espectáculos profesionales llenos de magia, personajes favoritos, música y momentos inolvidables
          </p>
        </div>

        {/* 2-Column Layout for Shows and Gallery */}
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          
          {/* Left Column: Shows List */}
          <div className="lg:w-1/3 flex flex-col gap-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-fantasy-purple-100/80 shadow-xs h-full max-h-[800px] flex flex-col">
              <h3 className="text-xl font-bold text-fantasy-purple-900 mb-4 shrink-0">
                Catálogo de Shows
              </h3>
              
              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {shows.map((show) => (
                  <div key={show.id} className="bg-fantasy-purple-50/40 rounded-2xl p-4 border border-fantasy-purple-100 hover:border-fantasy-purple-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-base text-fantasy-purple-900">{show.nombre}</h4>
                      <span className="shrink-0 text-[10px] font-extrabold text-fantasy-pink-600 bg-fantasy-pink-50/80 px-2 py-1 rounded-md">
                        ${show.precio ? show.precio.toLocaleString("es-MX") : "5,500"}
                      </span>
                    </div>
                    {show.duracion && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Duración: {show.duracion}</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {show.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Shared Media Gallery */}
          <div className="lg:w-2/3">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-fantasy-purple-100/80 shadow-xs h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-fantasy-purple-900">
                  Galería de Momentos Mágicos
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {showsGaleria.length} elementos
                </span>
              </div>

              {showsGaleria.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-h-[720px] overflow-y-auto custom-scrollbar pr-2">
                  {showsGaleria.map((item, idx) => {
                    const isVid = isVideoUrl(item.url);
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveMediaIndex(idx)}
                        className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-200 cursor-pointer shadow-sm hover:shadow-md hover:border-fantasy-pink-300 transition-all focus:outline-none"
                      >
                        {isVid ? (
                          <>
                            <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                            <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                              <Play className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={item.url}
                            alt="Momento Mágico"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute inset-0 bg-fantasy-purple-900/0 group-hover:bg-fantasy-purple-900/10 transition-colors pointer-events-none" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ImageIcon className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-500">Aún no hay fotos en la galería de shows</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Optional services list */}
        <div className="pt-8 border-t border-fantasy-purple-100/80">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fantasy-purple-100/80 text-fantasy-purple-900 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-fantasy-purple-600" />
              Complementa Tu Evento
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-fantasy-purple-900">
              Servicios Opcionales
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Personaliza la experiencia de tu fiesta con nuestros adicionales organizados por tipo de contratación
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-4xl mx-auto">
            <button
              onClick={() => setOpcionalesTab('evento')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                opcionalesTab === 'evento'
                  ? 'bg-fantasy-pink-500 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-fantasy-purple-50 border border-slate-200/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-fantasy-purple-400" />
              Por Evento ({serviciosPorEvento.length})
            </button>
            <button
              onClick={() => setOpcionalesTab('persona')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                opcionalesTab === 'persona'
                  ? 'bg-fantasy-pink-500 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-fantasy-purple-50 border border-slate-200/80'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-fantasy-purple-400" />
              Por Persona ({serviciosPorPersona.length})
            </button>
            <button
              onClick={() => setOpcionalesTab('cotizacion')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                opcionalesTab === 'cotizacion'
                  ? 'bg-fantasy-pink-500 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-fantasy-purple-50 border border-slate-200/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-fantasy-purple-400" />
              Cotización ({serviciosCotizacion.length})
            </button>
          </div>

          <div className="space-y-12 max-w-6xl mx-auto">
            {/* Category 1: Por Evento */}
            {opcionalesTab === 'evento' && serviciosPorEvento.length > 0 && (
              <div className="bg-fantasy-purple-50/30 rounded-3xl p-6 border border-fantasy-purple-100/80">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-fantasy-purple-200/60">
                  <div className="bg-fantasy-purple-100 text-fantasy-purple-800 p-2 rounded-xl">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-fantasy-purple-900">Por Evento</h4>
                    <p className="text-xs text-slate-500">Tarifa fija por la contratación del servicio completo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviciosPorEvento.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-fantasy-purple-100 hover:border-fantasy-purple-400/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-fantasy-purple-600 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                        <h5 className="font-bold text-xs sm:text-sm text-fantasy-purple-900 leading-snug transition-colors">
                          {item.nombre}
                        </h5>
                      </div>

                      {item.descripcion && (
                        <p className="text-xs text-slate-500 mb-3 pl-4 leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}

                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between pl-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Por Evento
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-fantasy-pink-600">
                          ${item.precio.toLocaleString("es-MX")} MXN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category 2: Por Persona */}
            {opcionalesTab === 'persona' && serviciosPorPersona.length > 0 && (
              <div className="bg-fantasy-purple-50/30 rounded-3xl p-6 border border-fantasy-purple-100/80">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-fantasy-purple-200/60">
                  <div className="bg-fantasy-purple-100 text-fantasy-purple-800 p-2 rounded-xl">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-fantasy-purple-900">Por Persona</h4>
                    <p className="text-xs text-slate-500">Costo calculado individualmente por cada invitado</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviciosPorPersona.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-fantasy-purple-100 hover:border-fantasy-purple-400/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-fantasy-purple-600 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                        <h5 className="font-bold text-xs sm:text-sm text-fantasy-purple-900 leading-snug transition-colors">
                          {item.nombre}
                        </h5>
                      </div>

                      {item.descripcion && (
                        <p className="text-xs text-slate-500 mb-3 pl-4 leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}

                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between pl-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Por Persona
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-fantasy-pink-600">
                          ${item.precio.toLocaleString("es-MX")} MXN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category 3: Cotización */}
            {opcionalesTab === 'cotizacion' && serviciosCotizacion.length > 0 && (
              <div className="bg-fantasy-purple-50/30 rounded-3xl p-6 border border-fantasy-purple-100/80">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-fantasy-purple-200/60">
                  <div className="bg-fantasy-purple-100 text-fantasy-purple-800 p-2 rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-fantasy-purple-900">Cotización</h4>
                    <p className="text-xs text-slate-500">Servicios personalizados a la medida según tus necesidades</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviciosCotizacion.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-fantasy-purple-100 hover:border-fantasy-purple-400/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-fantasy-purple-600 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                        <h5 className="font-bold text-xs sm:text-sm text-fantasy-purple-900 leading-snug transition-colors">
                          {item.nombre}
                        </h5>
                      </div>

                      {item.descripcion && (
                        <p className="text-xs text-slate-500 mb-3 pl-4 leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}

                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between pl-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Cotización
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-fantasy-pink-600 bg-fantasy-pink-50 px-2.5 py-1 rounded-full border border-fantasy-pink-200/80">
                          A cotizar
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- LIGHTBOX / MEDIA GALLERY MODAL --- */}
      {activeMediaIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setActiveMediaIndex(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative text-white my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={() => setActiveMediaIndex(null)}
                className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white backdrop-blur-sm transition-colors cursor-pointer"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-0">
              <div className="relative aspect-video sm:aspect-[16/10] w-full bg-black flex items-center justify-center group">
                {(() => {
                  const selectedMedia = showsGaleria[activeMediaIndex].url;
                  const isVideo = isVideoUrl(selectedMedia);
                  return isVideo ? (
                    <video
                      src={selectedMedia}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={selectedMedia}
                      alt="Momento Mágico"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  );
                })()}

                {/* Left/Right carousel controls */}
                {showsGaleria.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaIndex((prev) => prev !== null ? (prev - 1 + showsGaleria.length) % showsGaleria.length : null);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 shadow-md transition-transform hover:scale-110 cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaIndex((prev) => prev !== null ? (prev + 1) % showsGaleria.length : null);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 shadow-md transition-transform hover:scale-110 cursor-pointer"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Gallery Progress/Counter */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 text-center">
                <span className="text-sm font-medium text-slate-400">
                    Mostrando {activeMediaIndex + 1} de {showsGaleria.length}
                </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
