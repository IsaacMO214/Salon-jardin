import React from "react";
import { Sparkles, Calendar, Package, Utensils, Music, Image as ImageIcon, Video, ArrowRight } from "lucide-react";
import { AppData } from "../types";

export type AdminTabType = 'inicio' | 'banner_contacto' | 'eventos' | 'paquetes' | 'menus' | 'shows' | 'galeria' | 'testimonios' | 'admin';

interface AdminDashboardProps {
  data: AppData;
  setActiveTab: (tab: AdminTabType) => void;
}

export default function AdminDashboard({ data, setActiveTab }: AdminDashboardProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          <div className="w-14 h-14 shrink-0 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center justify-center text-emerald-300 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight">
              ¡Bienvenido al Panel Administrativo!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
              Gestiona de forma sencilla e instantánea los eventos, paquetes, menús banquetes, shows infantiles y galería de imágenes de tu salón de eventos.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats & Navigation Grid */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Resumen de Contenidos & Acceso Rápido
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card Eventos */}
          <div className="bg-zinc-800/50 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {data.eventos?.length || 0} Tipos
                </span>
              </div>
              <h5 className="font-bold text-base text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Eventos Especiales
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Administra bodas, XV años, fiestas infantiles, graduaciones y eventos corporativos.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('eventos')}
              className="w-full py-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Gestionar Eventos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Paquetes */}
          <div className="bg-zinc-800/50 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <Package className="w-5 h-5" />
                </span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {(data.paquetes_sociales?.length || 0) + (data.paquetes_infantiles?.length || 0)} Paquetes
                </span>
              </div>
              <h5 className="font-bold text-base text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Paquetes y Costos
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Edita precios, servicios incluidos, costos adicionales e imprevistos.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('paquetes')}
              className="w-full py-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Gestionar Paquetes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Menús */}
          <div className="bg-zinc-800/50 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {data.menus?.length || 0} Menús
                </span>
              </div>
              <h5 className="font-bold text-base text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Menús & Banquetes
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Configura tiempos gastronómicos, platillos, guarniciones y postres.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('menus')}
              className="w-full py-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Gestionar Menús</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Shows */}
          <div className="bg-zinc-800/50 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <Music className="w-5 h-5" />
                </span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {data.shows?.length || 0} Shows
                </span>
              </div>
              <h5 className="font-bold text-base text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Shows y Servicios
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Añade o modifica espectáculos infantiles y servicios adicionales con o sin precio fijo.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('shows')}
              className="w-full py-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Gestionar Shows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Galería */}
          <div className="bg-zinc-800/50 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {data.galeria?.length || 0} Fotos
                </span>
              </div>
              <h5 className="font-bold text-base text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Galería Fotográfica
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sube fotos de alta calidad del salón, instalaciones y ambientación.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('galeria')}
              className="w-full py-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Gestionar Galería</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Testimonios */}
          <div className="bg-zinc-800/50 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <Video className="w-5 h-5" />
                </span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {data.testimonios?.length || 0} Videos
                </span>
              </div>
              <h5 className="font-bold text-base text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Testimonios en Video
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Administra enlaces a videos de YouTube con opiniones de clientes.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('testimonios')}
              className="w-full py-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Gestionar Testimonios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Banner, Slogan & Redes */}
          <div className="bg-zinc-800/50 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Banner & Redes
                </span>
              </div>
              <h5 className="font-bold text-base text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Banner, Slogan & Redes
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Modifica el banner principal, slogan de bienvenida, redes sociales y números de teléfono.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('banner_contacto')}
              className="w-full py-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Gestionar Banner & Contacto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
