import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  Utensils,
  Flame,
  ChefHat,
  Award,
  CheckCircle2,
  Salad,
  Info
} from "lucide-react";
import { Menu } from "../types";

interface MenusProps {
  menus: Menu[];
}

// Categorization helper
type CategoryFilter = 'tiempos' | 'taquiza' | 'infantil';

function getMenuCategory(menu: Menu): CategoryFilter {
  const tipo = (menu.tipo || '').toLowerCase();
  const id = menu.id.toLowerCase();

  if (tipo === 'tiempo' || tipo === 'tiempo2' || tipo === 'tiempo3' || id.includes('tiempo')) {
    return 'tiempos';
  }
  if (tipo === 'tradicional' && menu.conCategorias) {
    return 'taquiza';
  }
  if (tipo === 'taquiza' || id.includes('taquiza') || id.includes('parrillada')) {
    return 'taquiza';
  }
  if (tipo === 'tradicional' || tipo === 'infantil' || tipo === 'buffet' || id.includes('infantil') || id.includes('buffet')) {
    return 'infantil';
  }
  return 'tiempos';
}

function parseMenuItemCourses(itemStr: string) {
  if (!itemStr.includes("[1er Tiempo]") && !itemStr.includes("[2do Tiempo]")) {
    return null;
  }

  let title = "";
  let body = itemStr;
  const matchOp = itemStr.match(/^(Opción\s*\d+:?)/i);
  if (matchOp) {
    title = matchOp[1].replace(":", "").trim();
    body = itemStr.substring(matchOp[0].length).trim();
  }

  let tieneSalseado = false;
  const courses: { label: string; content: string }[] = [];
  const parts = body.split(/\s*-\s*\[/);

  parts.forEach((part) => {
    let raw = part.trim();
    if (!raw.startsWith("[")) {
      raw = "[" + raw;
    }
    const matchTag = raw.match(/^\[(.*?)\]\s*(.*)$/);
    if (matchTag) {
      const tag = matchTag[1].trim().toLowerCase();
      if (tag.includes("salsead")) {
        tieneSalseado = true;
      } else {
        courses.push({
          label: matchTag[1].trim(),
          content: matchTag[2].trim()
        });
      }
    } else if (raw.toLowerCase().includes("salsead")) {
      tieneSalseado = true;
    }
  });

  return { title, courses, tieneSalseado };
}

export default function Menus({ menus }: MenusProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('tiempos');
  const [galleryIndexes, setGalleryIndexes] = useState<{ [key: string]: number }>({});
  const [selectedOptionByMenu, setSelectedOptionByMenu] = useState<{ [key: string]: number }>({});

  const handleNextPhoto = (menuId: string, totalPhotos: number) => {
    setGalleryIndexes((prev) => ({
      ...prev,
      [menuId]: ((prev[menuId] || 0) + 1) % totalPhotos,
    }));
  };

  const handlePrevPhoto = (menuId: string, totalPhotos: number) => {
    setGalleryIndexes((prev) => ({
      ...prev,
      [menuId]: ((prev[menuId] || 0) - 1 + totalPhotos) % totalPhotos,
    }));
  };

  // Filter menus based on selected category
  const filteredMenus = menus.filter((menu) => {
    const cat = getMenuCategory(menu);
    return cat === activeCategory;
  });

  // Category Counts
  const counts = {
    tiempos: menus.filter(m => getMenuCategory(m) === 'tiempos').length,
    taquiza: menus.filter(m => getMenuCategory(m) === 'taquiza').length,
    infantil: menus.filter(m => getMenuCategory(m) === 'infantil').length,
  };

  return (
    <section id="menus" className="py-24 doodle-leaves-bg scroll-mt-10 border-b border-slate-150 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fantasy-purple-100/80 text-fantasy-purple-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <ChefHat className="w-3.5 h-3.5" />
            Nuestra Propuesta Gastronómica
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fantasy-purple-900">
            Menús y Banquetes de Alta Calidad
          </h2>
          <div className="w-16 h-0.5 bg-fantasy-purple-500 mx-auto mt-3 mb-3 rounded-full" />
          <p className="text-sm sm:text-base text-slate-700 max-w-lg mx-auto leading-relaxed font-normal">
            Platillos elaborados el mismo día de tu evento con insumos 100% frescos y el sazón casero gourmet que nos distingue
          </p>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center p-1.5 bg-fantasy-purple-900/5 backdrop-blur-md rounded-2xl border border-fantasy-purple-100 shadow-xs gap-1.5 max-w-full">
            <button
              onClick={() => setActiveCategory('tiempos')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'tiempos'
                  ? 'bg-fantasy-pink-500 text-white shadow-sm font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-fantasy-purple-50/60'
              }`}
              id="cat-tab-tiempos"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Menús de Tiempos</span>
              <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === 'tiempos' ? 'bg-fantasy-pink-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {counts.tiempos}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('taquiza')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'taquiza'
                  ? 'bg-fantasy-pink-500 text-white shadow-sm font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-fantasy-purple-50/60'
              }`}
              id="cat-tab-taquiza"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Taquiza y Parrillada</span>
              <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === 'taquiza' ? 'bg-fantasy-pink-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {counts.taquiza}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('infantil')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'infantil'
                  ? 'bg-fantasy-pink-500 text-white shadow-sm font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-fantasy-purple-50/60'
              }`}
              id="cat-tab-infantil"
            >
              <Sparkles className="w-3.5 h-3.5 text-fantasy-pink-400" />
              <span>Menús Infantiles y Buffet</span>
              <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === 'infantil' ? 'bg-fantasy-pink-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {counts.infantil}
              </span>
            </button>
          </div>
        </div>

        {/* Menus Layout */}
        <div className="space-y-12">
          {activeCategory === 'taquiza' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-fantasy-purple-50/90 border border-fantasy-purple-200/80 shadow-2xs flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 rounded-xl bg-fantasy-purple-100/80 border border-fantasy-purple-200/60 shrink-0">
                <Flame className="w-5 h-5 text-fantasy-purple-700" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-fantasy-purple-900 block leading-snug">
                  No hagas fila, ¡te servimos en tu mesa!
                </span>
                <p className="text-sm sm:text-base text-fantasy-purple-800 mt-1 leading-relaxed font-normal">
                  Todas nuestras taquizas y parrilladas se sirven en un plato que nuestro equipo te lleva directamente hasta tu mesa. Tú solo disfruta.
                </p>
              </div>
            </div>
          )}
          {filteredMenus.map((menu) => {
            const displayFotos = menu.fotos ? menu.fotos.slice(0, 3) : [];
            const currentPhotoIdx = galleryIndexes[menu.id] || 0;
            const safePhotoIdx = currentPhotoIdx < displayFotos.length ? currentPhotoIdx : 0;
            const hasPhotos = displayFotos.length > 0;
            const category = getMenuCategory(menu);

            // Separate items that are multi-course options vs plain items
            const parsedCoursesList = menu.items
              .map((item) => parseMenuItemCourses(item))
              .filter(Boolean) as { title: string; courses: { label: string; content: string }[]; tieneSalseado: boolean }[];

            const isMultiCourseMenu = parsedCoursesList.length > 0;
            const selectedOptIdx = selectedOptionByMenu[menu.id] ?? 0;

            return (
              <div
                key={menu.id}
                className="bg-white/95 backdrop-blur-xs rounded-3xl border border-fantasy-purple-100/60 hover:border-fantasy-purple-300/80 overflow-hidden transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-sm hover:shadow-md"
                id={`menu-card-${menu.id}`}
              >
                {/* Menu Own Gallery Column */}
                <div className="lg:col-span-4 relative bg-slate-900 min-h-72 lg:min-h-full flex flex-col justify-between overflow-hidden group/gallery">
                  {hasPhotos ? (
                    <>
                      {displayFotos[safePhotoIdx].match(/\.(mp4|webm|ogg|mov)$/i) ? (
                        <video
                          src={displayFotos[safePhotoIdx]}
                          className="w-full h-full object-cover absolute inset-0 group-hover/gallery:scale-105 transition-transform duration-500"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={displayFotos[safePhotoIdx]}
                          alt={`${menu.nombre} fotografía`}
                          className="w-full h-full object-cover absolute inset-0 group-hover/gallery:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
                      
                      {/* Nav Buttons */}
                      {displayFotos.length > 1 && (
                        <>
                          <button
                            onClick={() => handlePrevPhoto(menu.id, displayFotos.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition-all cursor-pointer z-10 hover:scale-110"
                            aria-label="Anterior foto"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleNextPhoto(menu.id, displayFotos.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition-all cursor-pointer z-10 hover:scale-110"
                            aria-label="Siguiente foto"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Photo Count Tag */}
                      <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 z-10 border border-white/10 shadow-sm">
                        <ImageIcon className="w-3.5 h-3.5 text-fantasy-pink-400" />
                        <span>Galería ({safePhotoIdx + 1}/{displayFotos.length})</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400 bg-slate-900">
                      <Utensils className="w-12 h-12 mb-2 text-slate-600" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Banquete Exclusivo</span>
                    </div>
                  )}


                </div>

                {/* Menu Info Content Column */}
                <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-fantasy-purple-50 text-fantasy-purple-700 p-3 rounded-2xl border border-fantasy-purple-100 shadow-2xs">
                          <Utensils className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-fantasy-purple-900">
                            {menu.nombre}
                          </h3>
                          <p className="text-sm text-slate-700 font-sans mt-0.5">
                            {isMultiCourseMenu
                              ? `${parsedCoursesList.length} Opciones disponibles — ${menu.tipo === 'tiempo' ? `${menu.numTiempos || 2} Tiempos` : ''}`
                              : category === 'taquiza'
                              ? "Selección variada de guisados tradicionales e insumos ilimitados"
                              : "Incluye guarniciones y preparación fresca al instante"}
                          </p>
                        </div>
                      </div>

                      {/* Freshness guarantee badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fantasy-purple-50 text-fantasy-purple-800 text-[11px] font-semibold border border-fantasy-purple-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-fantasy-purple-600" />
                        <span>Ingredientes 100% Frescos</span>
                      </div>
                    </div>

                    {/* --- MULTI-COURSE MENUS (2 & 3 Tiempos) --- */}
                    {isMultiCourseMenu ? (
                      <div>
                        {/* Interactive Option Tabs Bar */}
                        <div className="mb-6">
                          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                            Selecciona una opción para explorar sus tiempos:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {parsedCoursesList.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  setSelectedOptionByMenu((prev) => ({
                                    ...prev,
                                    [menu.id]: idx,
                                  }))
                                }
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  selectedOptIdx === idx
                                    ? 'bg-fantasy-pink-500 text-white shadow-sm font-bold'
                                    : 'bg-white text-slate-600 hover:bg-fantasy-purple-50 hover:text-fantasy-purple-700 border border-slate-200 hover:border-fantasy-purple-200'
                                }`}
                              >
                                {opt.title || `Opción ${idx + 1}`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Active Selected Option Content */}
                        {parsedCoursesList[selectedOptIdx] && (
                          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-fantasy-purple-100 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                              <span className="font-bold text-fantasy-purple-900 text-sm sm:text-base">
                                {parsedCoursesList[selectedOptIdx].title || `Opción ${selectedOptIdx + 1}`}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-fantasy-purple-100 text-fantasy-purple-800">
                                {parsedCoursesList[selectedOptIdx].courses.length} Tiempos / Platos
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {parsedCoursesList[selectedOptIdx].courses.map((c, cIdx) => {
                                const namePart = c.content.split("(")[0].trim();
                                const hasDesc = c.content.includes("(");
                                const descPart = hasDesc
                                  ? c.content.substring(c.content.indexOf("(") + 1, c.content.lastIndexOf(")")).trim()
                                  : "";

                                return (
                                  <div
                                    key={cIdx}
                                    className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col justify-between hover:border-fantasy-purple-300 transition-colors"
                                  >
                                    <div>
                                      <span className="inline-block px-2 py-0.5 rounded-md bg-fantasy-purple-50 text-fantasy-purple-800 font-extrabold text-[10px] uppercase tracking-wider mb-2">
                                        {c.label}
                                      </span>
                                      <h4 className="text-slate-850 font-bold text-xs sm:text-sm leading-snug">
                                        {namePart}
                                      </h4>
                                      {hasDesc && descPart && (
                                        <p className="text-slate-700 text-xs sm:text-sm mt-1.5 leading-relaxed font-normal">
                                          {descPart}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Salseados disponibles display only when this option has salseado */}
                            {parsedCoursesList[selectedOptIdx].tieneSalseado && (
                              <div className="mt-4 pt-3.5 border-t border-slate-200/80 text-slate-600 text-xs font-medium flex flex-wrap items-center gap-2">
                                <span className="font-bold text-fantasy-purple-800 uppercase text-[10px] tracking-wider">
                                  Salseados disponibles:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(menu.salseados && menu.salseados.length > 0 ? menu.salseados : ["BBQ", "Nuez", "Champiñón", "Chipotle", "3 Chiles"]).map((s, sIdx) => (
                                    <span key={sIdx} className="px-2.5 py-0.5 rounded-full bg-fantasy-purple-50 text-fantasy-purple-800 text-[11px] font-semibold border border-fantasy-purple-200/60">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : category === 'taquiza' ? (
                      <>
                        {/* --- TAQUIZA / PARRILLADA CATEGORIZED GRID --- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {menu.items.map((item, index) => {
                            const parts = item.split(":");
                            const header = parts[0].trim();
                            const listStr = parts.slice(1).join(":").trim();
                            const dishes = listStr
                              ? listStr.split(",").map((d) => d.trim().replace(/\.$/, "")).filter(Boolean)
                              : [item];

                            let accentBg = "bg-fantasy-purple-50/70 border-fantasy-purple-200/80 text-fantasy-purple-900";
                            let headerBadge = "bg-fantasy-purple-700 text-white";
                            let dotColor = "bg-fantasy-purple-600";
                            let isNote = header.toLowerCase().startsWith("nota");

                            if (header.toLowerCase().includes("pollo")) {
                              accentBg = "bg-amber-50/70 border-amber-200/80 text-amber-950";
                              headerBadge = "bg-amber-700 text-white";
                              dotColor = "bg-amber-600";
                            } else if (header.toLowerCase().includes("res")) {
                              accentBg = "bg-rose-50/70 border-rose-200/80 text-rose-950";
                              headerBadge = "bg-rose-700 text-white";
                              dotColor = "bg-rose-600";
                            } else if (header.toLowerCase().includes("cerdo")) {
                              accentBg = "bg-orange-50/70 border-orange-200/80 text-orange-950";
                              headerBadge = "bg-orange-700 text-white";
                              dotColor = "bg-orange-600";
                            } else if (header.toLowerCase().includes("vegetariano")) {
                              accentBg = "bg-emerald-50/70 border-emerald-200/80 text-emerald-950";
                              headerBadge = "bg-emerald-700 text-white";
                              dotColor = "bg-emerald-600";
                            } else if (header.toLowerCase().includes("guarnicion")) {
                              accentBg = "bg-teal-50/70 border-teal-200/80 text-teal-950";
                              headerBadge = "bg-teal-700 text-white";
                              dotColor = "bg-teal-600";
                            }

                            return (
                              <div
                                key={index}
                                className={`p-4 sm:p-5 rounded-2xl border ${isNote ? 'bg-amber-50/90 border-amber-200 text-amber-900 sm:col-span-2 lg:col-span-3' : accentBg} shadow-2xs flex flex-col justify-between`}
                              >
                                <div>
                                  {isNote ? (
                                    <div className="flex items-start gap-2.5 italic text-sm">
                                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                      <span>{dishes.join(", ")}</span>
                                    </div>
                                  ) : (
                                    <>
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3 ${headerBadge}`}>
                                        {header}
                                      </span>
                                      <ul className="space-y-2">
                                        {dishes.map((dish, dIdx) => (
                                          <li key={dIdx} className="flex items-start gap-2.5 text-sm text-slate-800 font-normal leading-relaxed">
                                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 mt-1.5`} />
                                            <span>{dish}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      /* --- OTHER / INFANTIL ITEMS LIST --- */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {menu.items.map((item, index) => {
                          const isNote = item.toLowerCase().startsWith("nota:");

                          return (
                            <div
                              key={index}
                              className={
                                isNote
                                  ? "sm:col-span-2 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-sm sm:text-base text-amber-900 font-medium italic flex items-start gap-2.5 shadow-2xs"
                                  : "p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-sm sm:text-base text-slate-800 flex items-start gap-3 shadow-2xs hover:border-fantasy-purple-300 transition-colors"
                              }
                            >
                              {isNote ? (
                                <>
                                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </>
                              ) : (
                                <>
                                  <Salad className="w-4 h-4 text-fantasy-purple-600 shrink-0 mt-0.5" />
                                  <span className="font-medium text-slate-800">{item}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Salseados display legend */}
                    {!isMultiCourseMenu && menu.salseados && menu.salseados.length > 0 && (
                      <div className="mt-5 pt-3.5 border-t border-slate-150 text-slate-600 text-xs font-medium flex flex-wrap items-center gap-2">
                        <span className="font-bold text-fantasy-purple-800 uppercase text-[10px] tracking-wider">
                          Salseados disponibles:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {menu.salseados.map((s, sIdx) => (
                            <span key={sIdx} className="px-2.5 py-0.5 rounded-full bg-fantasy-purple-50 text-fantasy-purple-800 text-[11px] font-semibold border border-fantasy-purple-200/60">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer note */}
                  <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                      <Info className="w-3.5 h-3.5 text-fantasy-purple-600" />
                      Preparación higiénica y personalizada
                    </span>

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

