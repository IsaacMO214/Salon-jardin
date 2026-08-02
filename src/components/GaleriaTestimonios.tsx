import { useState } from "react";
import { Play, Star, X, Image as ImageIcon, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { GaleriaItem, Testimonio } from "../types";
import { AnimatePresence, motion } from "motion/react";

interface GaleriaTestimoniosProps {
  galeria: GaleriaItem[];
  testimonios: Testimonio[];
}

export default function GaleriaTestimonios({ galeria, testimonios }: GaleriaTestimoniosProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("salon");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Filter logic: Map categories cleanly so no items are lost
  const filteredGaleria = galeria.filter(item => 
    item.categoria === selectedCategory || 
    (selectedCategory === "infantil" && item.categoria === "area-infantil") ||
    (selectedCategory === "decoracion" && (item.categoria === "boda" || item.categoria === "banquetes"))
  );

  const categories = [
    { value: "salon", label: "El Salón" },
    { value: "decoracion", label: "Decoración" },
    { value: "infantil", label: "Área Infantil" }
  ];

  const isVideoUrl = (url: string) => {
    return !!(url && (url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("data:video")));
  };

  return (
    <section id="galeria" className="py-24 doodle-leaves-bg scroll-mt-10 border-b border-slate-150 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Gallery Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fantasy-blue-100/80 text-fantasy-blue-600 text-[11px] font-bold uppercase tracking-wider mb-3">
            Galería de Momentos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fantasy-purple-900 mt-2">
            Fotos y Videos de Eventos Recientes
          </h2>
          <div className="w-16 h-0.5 bg-fantasy-blue-500 mx-auto mt-3 mb-3 rounded-full" />
        </div>

        {/* Categories Filtering */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => {
                setSelectedCategory(cat.value);
                setActiveImage(null);
              }}
              className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                selectedCategory === cat.value
                  ? "bg-fantasy-pink-500 border-fantasy-pink-500 text-white shadow-xs"
                  : "bg-white/90 border-fantasy-blue-100/40 text-fantasy-blue-700 hover:border-fantasy-blue-300/60 hover:text-fantasy-blue-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Content - Dynamic Layout: Full Grid when empty, Side by Side when selected */}
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-24 transition-all duration-500">
          
          {/* LEFT SIDE: Media Player / Viewer (col-span-5) - Only visible when activeImage is set */}
          <AnimatePresence>
            {activeImage && (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9, x: -40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -40 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
                className="lg:col-span-5 sticky top-24 z-20"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative group">
                  {(() => {
                    const activeUrl = activeImage;
                    const activeItem = filteredGaleria.find(i => i.url === activeUrl) || filteredGaleria[0];
                    const isVid = activeUrl ? isVideoUrl(activeUrl) : false;

                    return (
                      <div className="relative w-full">
                        {/* Header bar / close button */}
                        <div className="absolute top-4 right-4 z-20 flex justify-end items-center pointer-events-none">
                          <button
                            onClick={() => setActiveImage(null)}
                            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full pointer-events-auto backdrop-blur-md transition-colors cursor-pointer shadow-md"
                            title="Cerrar y ver galería completa"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Media container */}
                        <div className="w-full aspect-square bg-black flex items-center justify-center relative overflow-hidden">
                          {isVid ? (
                            <video
                              key={activeUrl}
                              src={activeUrl}
                              controls
                              autoPlay
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <>
                              <img
                                key={activeUrl}
                                src={activeUrl}
                                alt={activeItem?.descripcion || "Galería Jardín Fantasy"}
                                className="w-full h-full object-contain z-10 relative transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <div 
                                className="absolute inset-0 bg-cover bg-center opacity-25 blur-xl scale-125 pointer-events-none"
                                style={{ backgroundImage: `url(${activeUrl})` }}
                              />
                            </>
                          )}
                        </div>

                        {/* Footer caption & Navigation Controls */}
                        <div className="p-5 bg-slate-900 border-t border-slate-800 text-white flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-200 truncate">
                              {activeItem?.descripcion || (isVid ? "Video de Instalaciones" : "Fotografía de Evento")}
                            </p>
                            <p className="text-[10px] text-fantasy-blue-400 font-semibold uppercase tracking-wider mt-0.5">
                              Categoría: {activeItem?.categoria || selectedCategory}
                            </p>
                          </div>

                          {filteredGaleria.length > 1 && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  const currentIndex = filteredGaleria.findIndex(i => i.url === activeUrl);
                                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredGaleria.length - 1;
                                  setActiveImage(filteredGaleria[prevIndex].url);
                                }}
                                className="p-2 bg-slate-800 hover:bg-fantasy-blue-600 text-slate-200 hover:text-white rounded-xl transition-colors cursor-pointer"
                                title="Anterior"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const currentIndex = filteredGaleria.findIndex(i => i.url === activeUrl);
                                  const nextIndex = currentIndex < filteredGaleria.length - 1 ? currentIndex + 1 : 0;
                                  setActiveImage(filteredGaleria[nextIndex].url);
                                }}
                                className="p-2 bg-slate-800 hover:bg-fantasy-blue-600 text-slate-200 hover:text-white rounded-xl transition-colors cursor-pointer"
                                title="Siguiente"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RIGHT/MAIN SIDE: Gallery Grid of Photos & Videos (dynamically takes 12 cols when empty, 7 cols when selected) */}
          <motion.div 
            layout 
            transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
            className={`${activeImage ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Mostrando {filteredGaleria.length} {filteredGaleria.length === 1 ? "Elemento" : "Elementos"}
              </span>
              <span className="text-[11px] text-fantasy-blue-600 font-semibold">
                {activeImage ? "Haz clic para cambiar de archivo ↗" : "Selecciona una foto o video para abrir el reproductor visual ↗"}
              </span>
            </div>

            {filteredGaleria.length === 0 ? (
              <div className="bg-white/80 border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                <p className="text-xs font-semibold">No se encontraron archivos en esta categoría.</p>
              </div>
            ) : (
              <motion.div 
                layout 
                className={
                  activeImage 
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4" 
                    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
                }
              >
                {filteredGaleria.map((img) => {
                  const isVid = isVideoUrl(img.url);
                  const isSelected = activeImage === img.url;

                  return (
                    <motion.div
                      layout
                      transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
                      key={img.id}
                      className="w-full"
                    >
                      <button
                        onClick={() => setActiveImage(isSelected ? null : img.url)}
                        className={`w-full aspect-square relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border group text-left block ${
                          isSelected
                            ? "ring-4 ring-fantasy-blue-500 ring-offset-2 border-fantasy-blue-500 shadow-xl scale-[1.02] z-10"
                            : "border-slate-200/80 hover:border-fantasy-blue-400/80 hover:shadow-lg hover:scale-[1.03] bg-slate-900"
                        }`}
                      >
                        {isVid ? (
                          <>
                            <video
                              src={img.url}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className={`p-2.5 rounded-full transition-transform duration-300 group-hover:scale-110 shadow-lg ${
                                isSelected ? "bg-fantasy-blue-500 text-white" : "bg-white/90 text-slate-900 group-hover:bg-fantasy-blue-600 group-hover:text-white"
                              }`}>
                                <Play className="w-4 h-4 fill-current" />
                              </div>
                            </div>
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-fantasy-blue-600/90 text-white text-[9px] font-extrabold uppercase rounded shadow-xs">
                              Video
                            </span>
                          </>
                        ) : (
                          <>
                            <img
                              src={img.url}
                              alt="Galería"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </>
                        )}

                        {/* Active indicator dot */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-3 h-3 bg-fantasy-blue-500 border-2 border-white rounded-full shadow-md animate-pulse" />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

        </motion.div>

        {/* Testimonials Heading */}
        <div id="testimonios" className="text-center max-w-3xl mx-auto mb-16 scroll-mt-24">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fantasy-purple-100/80 text-fantasy-purple-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            Testimonios de Clientes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fantasy-purple-900 mt-2">
            Opiniones de Video Reales
          </h2>
          <div className="w-16 h-0.5 bg-fantasy-purple-500 mx-auto mt-3 mb-3 rounded-full" />
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Mira la alegría y emoción de los anfitriones y sus familias en Jardín Fantasy
          </p>
        </div>

        {/* Testimonios Content - Dynamic Layout */}
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start transition-all duration-500">

          {/* LEFT SIDE: Video Player */}
          <AnimatePresence>
            {activeVideo && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, x: -40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -40, width: 0, overflow: 'hidden' }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
                className="lg:col-span-5 sticky top-24 z-20 mx-auto w-full max-w-[320px]"
              >
                <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative group">
                  <div className="relative w-full">
                    {/* Close button */}
                    <div className="absolute top-4 right-4 z-20 flex justify-end items-center pointer-events-none">
                      <button
                        onClick={() => setActiveVideo(null)}
                        className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full pointer-events-auto backdrop-blur-md transition-colors cursor-pointer shadow-md"
                        title="Cerrar video"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-20 flex justify-start items-center pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <Video className="w-3 h-3" />
                        Testimonios
                      </span>
                    </div>

                    {/* Video */}
                    <div className="w-full aspect-[9/16] bg-black flex items-center justify-center relative overflow-hidden">
                      <video
                        key={activeVideo}
                        src={activeVideo}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        controlsList="nodownload"
                        preload="metadata"
                      />
                    </div>

                    {/* Footer / Panel Informativo */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 text-white flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-200 truncate">
                          Testimonio de Cliente
                        </p>
                        <p className="text-[10px] text-fantasy-purple-400 font-semibold uppercase tracking-wider mt-0.5">
                          Categoría: Testimonios
                        </p>
                      </div>

                      {testimonios.length > 1 && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              const currentIndex = testimonios.findIndex(i => i.videoUrl === activeVideo);
                              const prevIndex = currentIndex > 0 ? currentIndex - 1 : testimonios.length - 1;
                              setActiveVideo(testimonios[prevIndex].videoUrl);
                            }}
                            className="p-2.5 bg-slate-800 hover:bg-fantasy-purple-600 text-slate-200 hover:text-white rounded-xl transition-colors cursor-pointer"
                            title="Anterior"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const currentIndex = testimonios.findIndex(i => i.videoUrl === activeVideo);
                              const nextIndex = currentIndex < testimonios.length - 1 ? currentIndex + 1 : 0;
                              setActiveVideo(testimonios[nextIndex].videoUrl);
                            }}
                            className="p-2.5 bg-slate-800 hover:bg-fantasy-purple-600 text-slate-200 hover:text-white rounded-xl transition-colors cursor-pointer"
                            title="Siguiente"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RIGHT SIDE: Testimonios Grid */}
          <motion.div
            layout
            transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
            className={`${activeVideo ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {testimonios.length} {testimonios.length === 1 ? "Testimonio" : "Testimonios"}
              </span>
              <span className="text-[11px] text-fantasy-purple-600 font-semibold">
                {activeVideo ? "Haz clic en otro video para cambiar ↗" : "Selecciona un video para reproducirlo ↗"}
              </span>
            </div>

            <div 
              className={`overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 ${
                activeVideo 
                  ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" 
                  : "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4"
              }`}
              style={{ maxHeight: "380px" }}
            >
              {testimonios.map((test) => {
                const isActive = activeVideo === test.videoUrl;
                return (
                  <div
                    key={test.id}
                    className={`w-full aspect-square rounded-2xl overflow-hidden relative group cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "ring-4 ring-fantasy-purple-500 ring-offset-2 scale-[0.98] z-10 shadow-lg"
                        : "hover:scale-[1.03] hover:shadow-xl ring-1 ring-slate-200"
                    }`}
                    onClick={() => setActiveVideo(isActive ? null : test.videoUrl)}
                  >
                    <video
                      src={test.videoUrl}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className={`p-2 sm:p-3 rounded-full transition-all duration-300 shadow-md ${
                        isActive
                          ? "bg-fantasy-purple-600 text-white scale-110"
                          : "bg-white/95 text-slate-800 group-hover:scale-110 group-hover:bg-fantasy-purple-600 group-hover:text-white"
                      }`}>
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-fantasy-purple-500 border-2 border-white rounded-full shadow-md animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
