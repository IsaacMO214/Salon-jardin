import { useState } from "react";
import { Clock } from "lucide-react";
import { Paquete, Show, ServicioAdicional, Menu } from "../types";

interface PaquetesProps {
  paquetesSociales: Paquete[];
  paquetesInfantiles: Paquete[];
  shows: Show[];
  serviciosAdicionales: ServicioAdicional[];
  menus: Menu[];
  telefonos: string[];
}

export default function Paquetes({
  paquetesSociales,
  paquetesInfantiles,
  shows,
  serviciosAdicionales,
  menus,
  telefonos,
}: PaquetesProps) {
  const [activeTab, setActiveTab] = useState<'sociales' | 'infantiles'>('sociales');
  const [infantilSubTab, setInfantilSubTab] = useState<'salon' | 'salon_alimentos'>('salon');

  const mainPhone = telefonos[0] || "55 3607 3700";

  const filteredInfantiles = paquetesInfantiles.filter((pkg) => {
    const isSalonOnly = pkg.tipoServicio === 'salon' || (!pkg.tipoServicio && (!pkg.menus || pkg.menus.length === 0));
    if (infantilSubTab === 'salon') return isSalonOnly;
    return !isSalonOnly;
  });

  const activePackages = activeTab === 'sociales' ? paquetesSociales : filteredInfantiles;

  // Helper to find Menu names referenced in packages
  const getMenuName = (menuId: string) => {
    const m = menus.find((item) => item.id === menuId);
    return m ? m.nombre : "Menú Especial";
  };

  return (
    <section id="paquetes" className="py-20 doodle-leaves-bg scroll-mt-10 border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            Nuestros Paquetes
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-slate-850">
            Planes a Tu Medida
          </h2>
          <div className="w-16 h-0.5 bg-emerald-600 mx-auto mt-3 mb-3 rounded-full" />
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Explora las opciones para eventos familiares de gala o divertidas celebraciones infantiles
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col items-center mb-12 gap-4">
          <div className="inline-flex rounded-full p-1 bg-green-50/30 border border-green-100/40 backdrop-blur-xs">
            <button
              onClick={() => setActiveTab('sociales')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'sociales'
                  ? 'bg-green-700 text-white shadow-xs font-bold'
                  : 'text-green-800/60 hover:text-green-800'
              }`}
              id="tab-packages-socials"
            >
              Eventos Sociales
            </button>
            <button
              onClick={() => setActiveTab('infantiles')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'infantiles'
                  ? 'bg-green-700 text-white shadow-xs font-bold'
                  : 'text-green-800/60 hover:text-green-800'
              }`}
              id="tab-packages-children"
            >
              Eventos Infantiles
            </button>
          </div>

          {/* Sub-tabs for Eventos Infantiles */}
          {activeTab === 'infantiles' && (
            <div className="inline-flex justify-center rounded-2xl p-1 bg-amber-50/60 border border-amber-200/60 shadow-xs gap-1">
              <button
                onClick={() => setInfantilSubTab('salon')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  infantilSubTab === 'salon'
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-amber-100/50'
                }`}
                id="subtab-salon"
              >
                Servicio Salón
              </button>
              <button
                onClick={() => setInfantilSubTab('salon_alimentos')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  infantilSubTab === 'salon_alimentos'
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-amber-100/50'
                }`}
                id="subtab-salon-alimentos"
              >
                Servicio Salón y Alimentos
              </button>
            </div>
          )}
        </div>

        {/* Packages List */}
        <div
          className={
            activeTab === 'sociales'
              ? "grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 justify-center mb-20"
              : activeTab === 'infantiles' && infantilSubTab === 'salon_alimentos'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center mb-20"
              : "flex flex-wrap justify-center gap-8 mb-20"
          }
        >
          {activePackages.map((pkg) => {
            const isSalonOnly = pkg.tipoServicio === 'salon' || (!pkg.tipoServicio && (!pkg.menus || pkg.menus.length === 0));

            return (
              <div
                key={pkg.id}
                className={`bg-white/95 backdrop-blur-xs rounded-2xl border border-green-100/40 hover:border-green-300/60 shadow-xs hover:shadow-xs transition-all duration-350 flex flex-col justify-between overflow-hidden group ${
                  activeTab === 'sociales' || (activeTab === 'infantiles' && infantilSubTab === 'salon_alimentos')
                    ? 'w-full'
                    : 'w-full max-w-sm md:w-[350px]'
                }`}
                id={`package-card-${pkg.id}`}
              >
                <div>
                  {/* Header accent */}
                  <div className="h-2 bg-gradient-to-r from-green-600 to-emerald-500" />

                  {/* Body Info */}
                  <div className="p-6">
                    {/* Category badge for Infantiles */}
                    {activeTab === 'infantiles' && (
                      <div className="mb-2">
                        {isSalonOnly ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Servicio Salón
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Servicio Salón y Alimentos
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title and Price in same row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-light text-slate-850 font-serif leading-tight">
                        {pkg.nombre}
                      </h3>
                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-green-700 tracking-tight">${pkg.precio}</span>
                        <span className="text-[10px] uppercase font-bold text-green-700/80 ml-1">P/P</span>
                      </div>
                    </div>
                    
                    {/* Hour Badge */}
                    <div className="flex items-center gap-2 mb-6">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50/50 border border-green-100/40 text-[10px] font-bold uppercase tracking-wider text-green-800">
                        <Clock className="w-3 h-3 text-green-700" />
                        <span>{pkg.horas} Horas</span>
                      </div>
                    </div>

                    {/* Menus included section */}
                    {pkg.menus && pkg.menus.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Banquete Incluido a elegir:
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {pkg.menus.map((mId) => (
                            <span
                              key={mId}
                              className="text-[10px] font-bold bg-green-50 text-green-850 border border-green-100/30 px-2.5 py-1 rounded-full"
                            >
                              {getMenuName(mId)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Services Included */}
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Servicios Incluidos:
                      </h4>
                      <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {pkg.servicios.map((srv, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 py-0.5">
                            <span className="text-slate-400 font-bold mt-0.5 select-none">•</span>
                            <span className="leading-relaxed">{srv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>



              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
