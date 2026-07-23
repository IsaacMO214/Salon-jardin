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
import { Show, ServicioAdicional } from "../types";

interface ShowsServiciosProps {
  shows: Show[];
  serviciosAdicionales: ServicioAdicional[];
}

export default function ShowsServicios({ shows, serviciosAdicionales }: ShowsServiciosProps) {
  const [galleryIndexes, setGalleryIndexes] = useState<{ [key: string]: number }>({});
  const [opcionalesTab, setOpcionalesTab] = useState<'evento' | 'persona' | 'cotizacion'>('evento');
  
  // Modal state for active media (photo/video modal)
  const [activeMediaModal, setActiveMediaModal] = useState<{
    show: Show;
    activeTab: 'photos' | 'video';
    selectedPhotoIndex: number;
  } | null>(null);

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

  const handleNextPhoto = (showId: string, totalPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryIndexes((prev) => ({
      ...prev,
      [showId]: ((prev[showId] || 0) + 1) % totalPhotos,
    }));
  };

  const handlePrevPhoto = (showId: string, totalPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryIndexes((prev) => ({
      ...prev,
      [showId]: ((prev[showId] || 0) - 1 + totalPhotos) % totalPhotos,
    }));
  };

  const getWhatsAppLink = (showName: string) => {
    const message = encodeURIComponent(`Hola Quinta Los Rosales, me gustaría solicitar información y cotización del espectáculo "${showName}".`);
    return `https://wa.me/525536073700?text=${message}`;
  };

  return (
    <section id="shows" className="py-24 doodle-leaves-bg scroll-mt-10 border-b border-slate-150 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Entretenimiento Exclusivo
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-slate-850">
            Espectáculos Infantiles y Shows de Magia
          </h2>
          <div className="w-16 h-0.5 bg-emerald-600 mx-auto mt-3 mb-3 rounded-full" />
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Sorprende a tus invitados con espectáculos profesionales llenos de magia, personajes favoritos, música y momentos inolvidables
          </p>
        </div>

        {/* Shows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {shows.map((show) => {
            const photos = show.fotos && show.fotos.length > 0 ? show.fotos : [
              "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800"
            ];
            const currentIdx = galleryIndexes[show.id] || 0;
            const hasVideo = !!show.videoUrl;

            return (
              <div
                key={show.id}
                className="bg-white/95 backdrop-blur-xs rounded-3xl border border-emerald-100/80 hover:border-emerald-300/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Media Card Top Header */}
                <div>
                  <div className="relative bg-slate-950 h-56 overflow-hidden group/media">
                    {photos[currentIdx] && (photos[currentIdx].match(/\.(mp4|webm|ogg|mov)$/i) || photos[currentIdx].includes('data:video')) ? (
                      <video
                        src={photos[currentIdx]}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={photos[currentIdx]}
                        alt={show.nombre}
                        className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* Left & Right arrows for photo carousel */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => handlePrevPhoto(show.id, photos.length, e)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md transition-all cursor-pointer z-10 opacity-80 hover:opacity-100"
                          aria-label="Anterior foto"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleNextPhoto(show.id, photos.length, e)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md transition-all cursor-pointer z-10 opacity-80 hover:opacity-100"
                          aria-label="Siguiente foto"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Bottom Media Controls Overlay */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <button
                        onClick={() => setActiveMediaModal({ show, activeTab: 'photos', selectedPhotoIndex: currentIdx })}
                        className="bg-emerald-800/90 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer backdrop-blur-xs border border-emerald-500/30"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Ver Galería</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-serif font-bold text-lg text-slate-850 group-hover:text-emerald-800 transition-colors">
                        {show.nombre}
                      </h3>
                      <span className="shrink-0 text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                        ${show.precio ? show.precio.toLocaleString("es-MX") : "5,500"} MXN
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {show.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        {/* Optional services list */}
        <div className="pt-8 border-t border-emerald-100/80">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Complementa Tu Evento
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-slate-850">
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
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Por Evento ({serviciosPorEvento.length})
            </button>
            <button
              onClick={() => setOpcionalesTab('persona')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                opcionalesTab === 'persona'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/80'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Por Persona ({serviciosPorPersona.length})
            </button>
            <button
              onClick={() => setOpcionalesTab('cotizacion')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                opcionalesTab === 'cotizacion'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Cotización ({serviciosCotizacion.length})
            </button>
          </div>

          <div className="space-y-12 max-w-6xl mx-auto">
            {/* Category 1: Por Evento */}
            {opcionalesTab === 'evento' && serviciosPorEvento.length > 0 && (
              <div className="bg-emerald-50/30 rounded-3xl p-6 border border-emerald-100/80">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-emerald-200/60">
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-slate-850">Por Evento</h4>
                    <p className="text-xs text-slate-500">Tarifa fija por la contratación del servicio completo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviciosPorEvento.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-emerald-100 hover:border-emerald-400/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                        <h5 className="font-semibold text-xs sm:text-sm text-slate-850 leading-snug group-hover:text-emerald-900 transition-colors">
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
                        <span className="font-extrabold text-xs sm:text-sm text-emerald-800">
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
              <div className="bg-emerald-50/30 rounded-3xl p-6 border border-emerald-100/80">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-emerald-200/60">
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-slate-850">Por Persona</h4>
                    <p className="text-xs text-slate-500">Costo calculado individualmente por cada invitado</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviciosPorPersona.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-emerald-100 hover:border-emerald-400/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                        <h5 className="font-semibold text-xs sm:text-sm text-slate-850 leading-snug group-hover:text-emerald-900 transition-colors">
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
                        <span className="font-extrabold text-xs sm:text-sm text-emerald-800">
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
              <div className="bg-emerald-50/30 rounded-3xl p-6 border border-emerald-100/80">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-emerald-200/60">
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-slate-850">Cotización</h4>
                    <p className="text-xs text-slate-500">Servicios personalizados a la medida según tus necesidades</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviciosCotizacion.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-emerald-100 hover:border-emerald-400/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                        <h5 className="font-semibold text-xs sm:text-sm text-slate-850 leading-snug group-hover:text-emerald-900 transition-colors">
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
                        <span className="font-extrabold text-xs sm:text-sm text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
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
      {activeMediaModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setActiveMediaModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative text-white my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-1">
                  Galería Multimedia & Show Demo
                </span>
                <h3 className="text-lg sm:text-2xl font-serif font-bold text-white">
                  {activeMediaModal.show.nombre}
                </h3>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveMediaModal(null)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Type Switcher Tabs (if video exists) */}
            {activeMediaModal.show.videoUrl && (
              <div className="flex border-b border-slate-800 bg-slate-950/50">
                <button
                  onClick={() => setActiveMediaModal((prev) => prev && { ...prev, activeTab: 'photos' })}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    activeMediaModal.activeTab === 'photos'
                      ? 'border-b-2 border-emerald-500 text-emerald-400 bg-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Galería de Fotos ({activeMediaModal.show.fotos?.length || 1})</span>
                </button>

                <button
                  onClick={() => setActiveMediaModal((prev) => prev && { ...prev, activeTab: 'video' })}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    activeMediaModal.activeTab === 'video'
                      ? 'border-b-2 border-emerald-500 text-emerald-400 bg-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4 text-red-500" />
                  <span>Video Demo del Show</span>
                </button>
              </div>
            )}

            {/* Modal Body Content */}
            <div className="p-4 sm:p-6">
              {activeMediaModal.activeTab === 'video' && activeMediaModal.show.videoUrl ? (
                /* VIDEO PLAYER */
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800 relative">
                    {activeMediaModal.show.videoUrl.includes("youtube.com") ||
                    activeMediaModal.show.videoUrl.includes("youtu.be") ? (
                      <iframe
                        src={activeMediaModal.show.videoUrl}
                        title={`Video de ${activeMediaModal.show.nombre}`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={activeMediaModal.show.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        poster={activeMediaModal.show.fotos?.[0]}
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 text-center italic">
                    Fragmento demostrativo del show en vivo preparado para eventos familiares.
                  </p>
                </div>
              ) : (
                /* PHOTO GALLERY VIEW */
                <div className="space-y-4">
                  {/* Main Large Media Item */}
                  <div className="relative aspect-video sm:aspect-16/9 w-full rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center group">
                    {(() => {
                      const selectedMedia = activeMediaModal.show.fotos?.[activeMediaModal.selectedPhotoIndex] || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800";
                      const isVideo = selectedMedia.match(/\.(mp4|webm|ogg|mov)$/i) || selectedMedia.includes('data:video');
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
                          alt={activeMediaModal.show.nombre}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      );
                    })()}

                    {/* Left/Right carousel controls */}
                    {(activeMediaModal.show.fotos?.length || 0) > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveMediaModal((prev) => {
                              if (!prev || !prev.show.fotos) return prev;
                              const len = prev.show.fotos.length;
                              return {
                                ...prev,
                                selectedPhotoIndex: (prev.selectedPhotoIndex - 1 + len) % len,
                              };
                            })
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full border border-slate-700 shadow-md transition-transform hover:scale-110 cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() =>
                            setActiveMediaModal((prev) => {
                              if (!prev || !prev.show.fotos) return prev;
                              const len = prev.show.fotos.length;
                              return {
                                ...prev,
                                selectedPhotoIndex: (prev.selectedPhotoIndex + 1) % len,
                              };
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full border border-slate-700 shadow-md transition-transform hover:scale-110 cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {(activeMediaModal.show.fotos?.length || 0) > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {activeMediaModal.show.fotos?.map((photo, pIdx) => {
                        const isThumbVideo = photo.match(/\.(mp4|webm|ogg|mov)$/i) || photo.includes('data:video');
                        return (
                          <button
                            key={pIdx}
                            onClick={() =>
                              setActiveMediaModal((prev) => prev && { ...prev, selectedPhotoIndex: pIdx })
                            }
                            className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                              activeMediaModal.selectedPhotoIndex === pIdx
                                ? 'border-emerald-400 scale-105 shadow-md'
                                : 'border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            {isThumbVideo ? (
                              <video src={photo} className="w-full h-full object-cover" muted />
                            ) : (
                              <img
                                src={photo}
                                alt=""
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Show details */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {activeMediaModal.show.descripcion}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
