import { useState, useRef, useMemo } from "react";
import {
  Heart, Crown, GraduationCap, Droplet, Gift, Sparkles, BookOpen,
  Cake, PartyPopper, Music, Users, Briefcase, Camera, Utensils, Wine, Star,
  X, ChevronLeft, ChevronRight, Image as ImageIcon, ShieldCheck, Play
} from "lucide-react";
import { Evento } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface EventosProps {
  eventos: Evento[];
  eventosGaleria: string[];
}

interface MediaItem {
  url: string;
  isVideo: boolean;
}

export default function Eventos({ eventos, eventosGaleria }: EventosProps) {
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const mediaViewerRef = useRef<HTMLDivElement>(null);
  const eventsRowRef = useRef<HTMLDivElement>(null);
  const galleryRowRef = useRef<HTMLDivElement>(null);

  // Build media items from the shared events gallery
  const allMedia = useMemo<MediaItem[]>(() => {
    return (eventosGaleria || [])
      .filter((url) => url && url.trim() !== "")
      .map((url) => ({
        url,
        isVideo: /\.(mp4|webm|ogg|mov)$/i.test(url),
      }));
  }, [eventosGaleria]);

  // Helper to get Lucide Icon by name string
  const renderEventIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "Heart": return <Heart className={className} />;
      case "Crown": return <Crown className={className} />;
      case "GraduationCap": return <GraduationCap className={className} />;
      case "Droplet": return <Droplet className={className} />;
      case "Gift": return <Gift className={className} />;
      case "Sparkles": return <Sparkles className={className} />;
      case "BookOpen": return <BookOpen className={className} />;
      case "Cake": return <Cake className={className} />;
      case "PartyPopper": return <PartyPopper className={className} />;
      case "Music": return <Music className={className} />;
      case "Users": return <Users className={className} />;
      case "Briefcase": return <Briefcase className={className} />;
      case "Camera": return <Camera className={className} />;
      case "Utensils": return <Utensils className={className} />;
      case "Wine": return <Wine className={className} />;
      case "Star": return <Star className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const handleSelectEvent = (event: Evento) => {
    if (selectedEvent?.id === event.id) {
      setSelectedEvent(null);
    } else {
      setSelectedEvent(event);
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  const handleSelectMedia = (media: MediaItem) => {
    if (selectedMedia?.url === media.url) {
      setSelectedMedia(null);
    } else {
      setSelectedMedia(media);
      setTimeout(() => {
        mediaViewerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  // Navigate gallery thumbnails with scroll
  const scrollGallery = (direction: "left" | "right") => {
    if (!galleryRowRef.current) return;
    const scrollAmount = 280;
    galleryRowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Navigate events row with scroll  
  const scrollEvents = (direction: "left" | "right") => {
    if (!eventsRowRef.current) return;
    const scrollAmount = 240;
    eventsRowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section id="eventos" className="py-16 doodle-leaves-bg scroll-mt-10 border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fantasy-purple-100/80 text-fantasy-purple-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            Lo que ofrecemos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fantasy-purple-900 mt-2">
            Nuestros Eventos
          </h2>
          
          {/* Small booking badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-fantasy-pink-500/25 bg-fantasy-pink-500/10 text-xs font-semibold text-fantasy-pink-800 mt-4 shadow-3xs hover:bg-fantasy-pink-500/15 transition-all">
            <ShieldCheck className="w-4 h-4 text-fantasy-pink-600 shrink-0" />
            <span>Aparta con solo $2,500 MXN</span>
          </div>

          <div className="w-16 h-0.5 bg-fantasy-purple-500 mx-auto mt-4 mb-3 rounded-full" />
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mt-1">
            Selecciona un evento para ver su descripción
          </p>
        </div>

        {/* ═══════════════════════════════════════════
            ZONA 1 — Grid de Eventos (2 filas)
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {eventos.map((evt) => {
            const isSelected = selectedEvent?.id === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => handleSelectEvent(evt)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-full border transition-all duration-300 cursor-pointer focus:outline-none whitespace-nowrap ${
                  isSelected
                    ? "bg-fantasy-pink-500 border-fantasy-pink-500 text-white shadow-md shadow-fantasy-pink-500/25 scale-[1.03]"
                    : "bg-white border-slate-200 hover:border-fantasy-purple-300 hover:bg-fantasy-purple-50/40 text-slate-700 hover:text-fantasy-purple-700 shadow-xs"
                }`}
                id={`event-chip-${evt.id}`}
              >
                <span className={`transition-colors ${
                  isSelected ? "text-white/90" : "text-fantasy-purple-500"
                }`}>
                  {renderEventIcon(evt.icono, "w-4 h-4")}
                </span>
                <span className={`font-semibold text-[11px] uppercase tracking-wider ${
                  isSelected ? "text-white" : ""
                }`}>
                  {evt.nombre}
                </span>
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════
            ZONA 2 — Panel Desplegable (solo descripción)
            ═══════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {selectedEvent && (
            <motion.div
              ref={detailRef}
              key={selectedEvent.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden w-full"
            >
              <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 mb-6 shadow-xs relative">
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 p-2 rounded-full border border-slate-100 transition-colors cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-fantasy-purple-50 text-fantasy-purple-600 p-2.5 rounded-xl">
                    {renderEventIcon(selectedEvent.icono, "w-5 h-5")}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-fantasy-purple-700 uppercase tracking-widest leading-none block mb-1">
                      Especialistas en
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-none">
                      {selectedEvent.nombre}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-light mb-4 max-w-3xl">
                  {selectedEvent.descripcion}
                </p>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-[10px] font-bold text-fantasy-purple-700 hover:text-fantasy-purple-900 uppercase tracking-wider cursor-pointer"
                  >
                    Ocultar detalles
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════
            ZONA 3 — Galería General Unificada
            ═══════════════════════════════════════════════ */}
        {allMedia.length > 0 && (
          <div className="mt-2">
            {/* Gallery header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-fantasy-purple-50 text-fantasy-purple-600 p-2 rounded-lg">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Galería de Eventos
                </h3>
                <p className="text-[10px] text-slate-500">
                  {allMedia.length} {allMedia.length === 1 ? "archivo" : "archivos"} · Selecciona para ampliar
                </p>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${selectedMedia ? 'lg:grid-cols-12 gap-6' : 'gap-4'} transition-all duration-500`}>
              
              {/* Media Viewer (Left Side) */}
              <AnimatePresence>
                {selectedMedia && (
                  <motion.div
                    ref={mediaViewerRef}
                    key="media-viewer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, width: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="lg:col-span-7 w-full order-1"
                  >
                    <div className="bg-slate-950 rounded-2xl relative overflow-hidden shadow-lg border border-slate-800">
                      {/* Close button */}
                      <button
                        onClick={() => setSelectedMedia(null)}
                        className="absolute top-3 right-3 bg-white/15 hover:bg-white/25 text-white p-2 rounded-full transition-colors cursor-pointer z-20 backdrop-blur-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Gallery label badge */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                          <ImageIcon className="w-3 h-3" />
                          Galería de Eventos
                        </span>
                      </div>

                      {/* Navigation buttons */}
                      {allMedia.length > 1 && (
                        <>
                          <button
                            onClick={() => {
                              const currentIdx = allMedia.findIndex(m => m.url === selectedMedia.url);
                              const prevIdx = (currentIdx - 1 + allMedia.length) % allMedia.length;
                              setSelectedMedia(allMedia[prevIdx]);
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white p-2.5 rounded-full transition-all cursor-pointer z-20 backdrop-blur-sm"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const currentIdx = allMedia.findIndex(m => m.url === selectedMedia.url);
                              const nextIdx = (currentIdx + 1) % allMedia.length;
                              setSelectedMedia(allMedia[nextIdx]);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white p-2.5 rounded-full transition-all cursor-pointer z-20 backdrop-blur-sm"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Content */}
                      <div className="relative w-full aspect-[4/3] max-h-[400px]">
                        {selectedMedia.isVideo ? (
                          <video
                            key={selectedMedia.url}
                            src={selectedMedia.url}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                            controlsList="nodownload"
                            preload="metadata"
                          />
                        ) : (
                          <>
                            <img
                              src={selectedMedia.url}
                              alt="Galería de eventos - vista ampliada"
                              className="w-full h-full object-contain relative z-10"
                              referrerPolicy="no-referrer"
                            />
                            {/* Blurred background */}
                            <div
                              className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-125 pointer-events-none"
                              style={{ backgroundImage: `url(${selectedMedia.url})` }}
                            />
                          </>
                        )}
                      </div>

                      {/* Bottom counter */}
                      <div className="flex items-center justify-center py-2.5 bg-black/40">
                        <span className="text-[10px] text-white/70 font-medium tracking-wider">
                          {allMedia.findIndex(m => m.url === selectedMedia.url) + 1} / {allMedia.length}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Thumbnails Grid (Right Side) */}
              <div className={`${selectedMedia ? "lg:col-span-5 order-2" : "order-1"}`}>
                <div 
                  className={`grid ${selectedMedia ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'} gap-3 overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400`}
                  style={{ maxHeight: "310px" }} // Allows approx 3 rows of ~90px + gaps
                >
                  {allMedia.map((media, idx) => {
                    const isActive = selectedMedia?.url === media.url;
                    return (
                      <button
                        key={`${media.url}-${idx}`}
                        onClick={() => handleSelectMedia(media)}
                        className={`w-full aspect-[4/3] relative rounded-xl overflow-hidden cursor-pointer focus:outline-none transition-all duration-300 group ${
                          isActive
                            ? "ring-2 ring-fantasy-pink-500 ring-offset-2 scale-[0.98] shadow-lg shadow-fantasy-pink-500/20"
                            : "ring-1 ring-slate-200 hover:ring-fantasy-purple-300 hover:scale-[1.02] shadow-xs"
                        }`}
                      >
                        {media.isVideo ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                            <video
                              src={media.url}
                              className="w-full h-full object-cover opacity-70"
                              preload="metadata"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="bg-white/90 rounded-full p-2 shadow-md">
                                <Play className="w-3.5 h-3.5 text-fantasy-purple-700 fill-fantasy-purple-700" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt={`Galería de eventos - foto ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        )}

                        {/* Hover overlay */}
                        <div className={`absolute inset-0 rounded-xl transition-all duration-200 ${
                          isActive ? "ring-2 ring-inset ring-white/40" : ""
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
