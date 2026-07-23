import { useState, useRef } from "react";
import {
  Heart, Crown, GraduationCap, Droplet, Gift, Sparkles, BookOpen,
  Cake, PartyPopper, Music, Users, Briefcase, Camera, Utensils, Wine, Star,
  X, ChevronLeft, ChevronRight, Image as ImageIcon, ShieldCheck
} from "lucide-react";
import { Evento } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface EventosProps {
  eventos: Evento[];
}

export default function Eventos({ eventos }: EventosProps) {
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const detailRef = useRef<HTMLDivElement>(null);

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
      setCurrentPhotoIdx(0);
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  const handleNextPhoto = () => {
    if (!selectedEvent) return;
    setCurrentPhotoIdx((prev) => (prev + 1) % selectedEvent.fotos.length);
  };

  const handlePrevPhoto = () => {
    if (!selectedEvent) return;
    setCurrentPhotoIdx((prev) => (prev - 1 + selectedEvent.fotos.length) % selectedEvent.fotos.length);
  };

  return (
    <section id="eventos" className="py-16 doodle-leaves-bg scroll-mt-10 border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            Lo que ofrecemos
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-green-900 mt-2">
            Nuestros Eventos
          </h2>
          
          {/* Small booking badge matching the screenshot */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/25 bg-green-500/10 text-xs font-semibold text-green-800 mt-4 shadow-3xs hover:bg-green-500/15 transition-all">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span>Aparta con solo $2,500 MXN</span>
          </div>

          <div className="w-16 h-0.5 bg-emerald-600 mx-auto mt-4 mb-3 rounded-full" />
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mt-1">
            Toca cualquier servicio para desplegar fotos y detalles
          </p>
        </div>

        {/* Responsive Grid of Event Cards - Displayed across 2 lines on desktop (lg:grid-cols-4) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-6">
          {eventos.map((evt) => {
            const isSelected = selectedEvent?.id === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => handleSelectEvent(evt)}
                className={`border rounded-xl p-5 flex flex-col items-center justify-center text-center group transition-all duration-300 shadow-xs cursor-pointer focus:outline-none ${
                  isSelected 
                    ? "bg-green-50/50 border-green-300 ring-1 ring-green-300" 
                    : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
                id={`event-card-${evt.id}`}
              >
                <div className={`p-3 rounded-full mb-3 transition-transform duration-350 ${
                  isSelected 
                    ? "bg-green-100 text-green-900 scale-105" 
                    : "text-green-700 bg-green-50 group-hover:bg-white group-hover:scale-105"
                }`}>
                  {renderEventIcon(evt.icono, "w-4 h-4")}
                </div>
                <h3 className={`font-semibold text-[11px] uppercase tracking-wider transition-colors ${
                  isSelected ? "text-green-900" : "text-slate-700 group-hover:text-green-800"
                }`}>
                  {evt.nombre}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Smooth Expandable Detail Panel */}
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
              <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 mt-4 shadow-xs relative">
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 p-2 rounded-full border border-slate-100 transition-colors cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left: Image Gallery */}
                  <div className="md:col-span-6 flex flex-col justify-center min-h-[240px] sm:min-h-[300px] relative rounded-xl overflow-hidden border border-slate-100 bg-slate-950">
                    {selectedEvent.fotos && selectedEvent.fotos.length > 0 ? (
                      <div className="relative w-full h-full min-h-[240px] sm:min-h-[300px]">
                        {selectedEvent.fotos[currentPhotoIdx]?.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={selectedEvent.fotos[currentPhotoIdx]}
                            className="w-full h-full object-cover absolute inset-0 bg-black"
                            controls
                            controlsList="nodownload"
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={selectedEvent.fotos[currentPhotoIdx]}
                            alt={`${selectedEvent.nombre} gallery`}
                            className="w-full h-full object-cover absolute inset-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Navigation Controls */}
                        {selectedEvent.fotos.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevPhoto}
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full border border-slate-100 shadow-xs transition-all cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleNextPhoto}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full border border-slate-100 shadow-xs transition-all cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            
                            {/* Dot Indicators */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-2.5 py-1 rounded-full">
                              {selectedEvent.fotos.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentPhotoIdx(idx)}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                                    idx === currentPhotoIdx ? "bg-white scale-110" : "bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                        <ImageIcon className="w-10 h-10 mb-2 text-slate-500" />
                        <span className="text-xs">No hay fotos en la galería de este evento</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Description & Info */}
                  <div className="md:col-span-6 flex flex-col justify-center py-2 pr-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-50 text-green-700 p-2.5 rounded-xl">
                        {renderEventIcon(selectedEvent.icono, "w-4 h-4")}
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-green-750 uppercase tracking-widest leading-none block mb-1">
                          Especialistas en
                        </span>
                        <h3 className="text-lg font-light text-slate-900 leading-none">
                          {selectedEvent.nombre}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-light mb-6">
                      {selectedEvent.descripcion}
                    </p>

                    <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                      <div></div>
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="text-[10px] font-bold text-green-800 hover:text-green-950 uppercase tracking-wider cursor-pointer"
                      >
                        Ocultar detalles
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>



      </div>
    </section>
  );
}
