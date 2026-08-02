import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroProps {
  slogan: string;
  telefonos?: string[];
  imagenUrl?: string;
  imagenesUrl?: string[];
}

const DEFAULT_BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1600"
];

export default function Hero({ slogan, imagenUrl, imagenesUrl }: HeroProps) {
  // Determine banner images list
  const bannerList = React.useMemo(() => {
    if (imagenesUrl && imagenesUrl.length > 0) {
      return imagenesUrl;
    }
    if (imagenUrl) {
      return [imagenUrl];
    }
    return DEFAULT_BANNER_IMAGES;
  }, [imagenesUrl, imagenUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index if list changes and index is out of bounds
  useEffect(() => {
    if (currentIndex >= bannerList.length) {
      setCurrentIndex(0);
    }
  }, [bannerList, currentIndex]);

  // Auto slide every 10 seconds (10000 ms)
  useEffect(() => {
    if (bannerList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerList.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [bannerList.length, currentIndex]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerList.length) % bannerList.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerList.length);
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 py-32 sm:py-40 border-b border-slate-800 group">
      {/* Background Image Carousel with Smooth Fade */}
      <div className="absolute inset-0 z-0">
        {bannerList.map((imgUrl, index) => (
          <div
            key={`${imgUrl}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {imgUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <video
                src={imgUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={imgUrl}
                alt={`Salón Jardín Fantasy - Banner ${index + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-fantasy-purple-950/70 via-black/50 to-fantasy-purple-950/60 backdrop-blur-[1px]" />
      </div>

      {/* Navigation Buttons on Left & Right Edges */}
      {bannerList.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            aria-label="Imagen anterior"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-fantasy-purple-900/40 hover:bg-fantasy-purple-800/75 text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition-all shadow-xl hover:scale-110 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={goToNext}
            aria-label="Siguiente imagen"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-fantasy-purple-900/40 hover:bg-fantasy-purple-800/75 text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition-all shadow-xl hover:scale-110 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Content Overlay */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 sm:px-8 text-center text-white">

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight drop-shadow-sm">
          Crea Momentos Mágicos en <br />
          <span className="text-fantasy-pink-300 italic font-medium title-font">Salón Jardín Fantasy</span>
        </h1>

        {/* Slogan */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-100 font-light leading-relaxed drop-shadow-xs italic title-font">
          &ldquo;{slogan}&rdquo;
        </p>

        {/* CTA Button */}
        <div className="mt-8">
          <a
            href="#nosotros"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-fantasy-pink-500 hover:bg-fantasy-pink-600 text-white text-sm font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Conocer Más
          </a>
        </div>

        {/* Indicators Dots */}
        {bannerList.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {bannerList.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentIndex
                    ? "w-8 bg-fantasy-pink-400"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
