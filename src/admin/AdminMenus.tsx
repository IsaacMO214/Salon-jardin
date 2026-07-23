import React, { useState } from "react";
import { Plus, X, Trash2, Edit2, ChefHat, Sparkles, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppData, Menu } from "../types";
import MediaUploader from "../components/ui/MediaUploader";
import MenuCoursesEditor from "./components/MenuCoursesEditor";
import CategorizedListEditor from "./components/CategorizedListEditor";
import StructuredListEditor from "./components/StructuredListEditor";

interface AdminMenusProps {
  data: AppData;
  token: string;
  apiCall: (url: string, payload: any) => Promise<boolean>;
  showStatus: (msg: string) => void;
  onRequestConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

type CreationStep = 'idle' | 'select' | 'form';

export default function AdminMenus({
  data,
  token,
  apiCall,
  showStatus,
  onRequestConfirmation
}: AdminMenusProps) {
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [creationStep, setCreationStep] = useState<CreationStep>('idle');

  const isDuplicateMenuName = Boolean(
    editingMenu &&
      editingMenu.nombre.trim() !== "" &&
      data.menus.some(
        (m) =>
          m.id !== editingMenu.id &&
          m.nombre.trim().toLowerCase() === editingMenu.nombre.trim().toLowerCase()
      )
  );

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;
    if (isDuplicateMenuName) {
      showStatus("Error: Este menú ya existe. Elige un nombre diferente.");
      return;
    }
    if (editingMenu.nombre && editingMenu.nombre.length > 30) {
      showStatus("Error: El nombre del menú excede el límite de 30 caracteres.");
      return;
    }

    const cleanedItems = editingMenu.items.filter(i => i.trim() !== "");
    const ok = await apiCall("/api/admin/menus/save", { menu: { ...editingMenu, items: cleanedItems } });

    if (ok) {
      setEditingMenu(null);
      setCreationStep('idle');
    }
  };

  const handleDeleteMenu = (id: string) => {
    onRequestConfirmation("Eliminar Banquete/Menú", "¿Seguro que deseas eliminar este menú?", async () => {
      await apiCall(`/api/admin/menus/delete/${id}`, {});
    });
  };

  const startNewMenu = () => {
    setCreationStep('select');
  };

  const selectTiempoMenu = () => {
    setEditingMenu({
      id: "menu-" + Date.now(),
      nombre: "",
      tipo: "tiempo",
      numTiempos: 2,
      items: [],
      salseados: [],
      fotos: []
    });
    setCreationStep('form');
  };

  const selectTradicionalMenu = (conCategorias: boolean) => {
    setEditingMenu({
      id: "menu-" + Date.now(),
      nombre: "",
      tipo: "tradicional",
      conCategorias,
      items: [],
      salseados: [],
      fotos: []
    });
    setCreationStep('form');
  };

  const cancelCreation = () => {
    setEditingMenu(null);
    setCreationStep('idle');
  };

  const hasSalseados = editingMenu?.tipo === 'tiempo' &&
    (editingMenu.items || []).some(i => i.includes("[Salseado]"));

  const handleItemsChange = (newItems: string[]) => {
    if (!editingMenu) return;
    const updated = { ...editingMenu, items: newItems };
    if (editingMenu.tipo === 'tiempo') {
      const hasAnySalseado = newItems.some(i => i.includes("[Salseado]"));
      updated.salseados = hasAnySalseado ? ["BBQ", "Nuez", "Champiñón", "Chipotle", "3 Chiles"] : [];
    } else {
      updated.salseados = [];
    }
    setEditingMenu(updated);
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xl font-bold text-zinc-100">Gestionar Menús y Platillos</h3>
          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">{data.menus.length}</span>
        </div>
        <button onClick={startNewMenu} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
          <Plus className="w-4 h-4" /> Agregar Menú
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {data.menus.map((m) => (
          <div key={m.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 transition-colors flex justify-between items-center gap-3">
            <div>
              <p className="font-bold text-sm text-zinc-100">{m.nombre}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {m.tipo === 'tiempo' ? `${m.numTiempos || 2} Tiempos` : 'Tradicional'}
                {m.conCategorias ? ' con Categorías' : ''}
                {' • '}Platillos/Opciones: {m.items.length}
                {' • '}Galería propia: {m.fotos?.length || 0} fotos
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditingMenu(m); setCreationStep('form'); }} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDeleteMenu(m.id)} className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* SELECT MENU TYPE MODAL */}
      {creationStep === 'select' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-700">
              <span className="font-bold text-base text-zinc-100">Selecciona el tipo de menú</span>
              <button type="button" onClick={cancelCreation} className="text-zinc-400 hover:text-zinc-200 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={selectTiempoMenu}
                className="bg-zinc-800/80 border border-zinc-700 hover:border-emerald-500/50 p-5 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/30 rounded-xl group-hover:bg-emerald-900/70 transition-colors">
                    <Layers className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-100 block">Menú por Tiempos</span>
                    <span className="text-[11px] text-zinc-400">Banquete estructurado en 2 a 5 tiempos</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Crea un menú con 2 a 5 tiempos más guarnición. Cada opción incluye platillos organizados por tiempo. Ideal para celebraciones formales.
                </p>
                <div className="mt-3 flex gap-2">
                  {[2, 3, 4, 5].map(n => (
                    <span key={n} className="text-[11px] px-2 py-0.5 bg-zinc-700/60 text-zinc-300 rounded font-semibold">{n} Tiempos</span>
                  ))}
                </div>
              </button>
              <button
                type="button"
                onClick={() => selectTradicionalMenu(false)}
                className="bg-zinc-800/80 border border-zinc-700 hover:border-emerald-500/50 p-5 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-amber-950/70 border border-amber-500/30 rounded-xl group-hover:bg-amber-900/70 transition-colors">
                    <ChefHat className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-100 block">Menú Tradicional</span>
                    <span className="text-[11px] text-zinc-400">Lista simple o con categorías</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Crea un menú con una lista de platillos. Puedes activar categorías si deseas agruparlos por tipo (ej. Pollo, Res, Guarniciones).
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[11px] px-2 py-0.5 bg-zinc-700/60 text-zinc-300 rounded font-semibold">Sin categorías</span>
                  <span className="text-[11px] px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-500/30 rounded font-semibold">Con categorías</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDITING MENU FORM MODAL */}
      {creationStep === 'form' && editingMenu && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-700">
              <span className="font-bold text-base text-zinc-100">
                {data.menus.some(m => m.id === editingMenu.id) ? "Editar Menú" : "Agregar Nuevo Menú"}
              </span>
              <button type="button" onClick={cancelCreation} className="text-zinc-400 hover:text-zinc-200 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="font-bold text-xs text-zinc-300">
                  {editingMenu.tipo === 'tiempo'
                    ? `Menú por Tiempos (${editingMenu.numTiempos || 2} Tiempos)`
                    : `Menú Tradicional${editingMenu.conCategorias ? ' con Categorías' : ''}`}
                </span>
              </div>

              {/* Tipo selector for new menus */}
              {editingMenu.id.startsWith("menu-") && (
                <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => { setEditingMenu(null); setCreationStep('select'); }}
                    className="text-[11px] px-2.5 py-1 bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cambiar tipo de menú
                  </button>
                  {editingMenu.tipo === 'tiempo' && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[11px] text-zinc-500 font-semibold">Tiempos:</span>
                      <select
                        value={editingMenu.numTiempos || 2}
                        onChange={(e) => {
                          const newNum = parseInt(e.target.value);
                          setEditingMenu({
                            ...editingMenu,
                            numTiempos: newNum,
                            items: []
                          });
                        }}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {[2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n} Tiempos</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {editingMenu.tipo === 'tradicional' && (
                    <div className="flex items-center gap-2 ml-2">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingMenu.conCategorias || false}
                          onChange={(e) => {
                            setEditingMenu({
                              ...editingMenu,
                              conCategorias: e.target.checked,
                              items: []
                            });
                          }}
                          className="w-3.5 h-3.5 text-emerald-500 rounded border-zinc-600 focus:ring-emerald-500 bg-zinc-900 cursor-pointer"
                        />
                        <span className="text-[11px] text-zinc-300 font-semibold">Incluir categorías</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">Nombre del Banquete / Menú</label>
                <input
                  type="text"
                  required
                  value={editingMenu.nombre}
                  onChange={(e) => setEditingMenu({ ...editingMenu, nombre: e.target.value })}
                  placeholder="Ej. Comida a 3 tiempos, Taquiza o Parrillada, Menú Infantil Tradicional, Buffet Infantil..."
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-colors ${
                    isDuplicateMenuName
                      ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500"
                  }`}
                />
                <AnimatePresence>
                  {(editingMenu.nombre || '').length > 30 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> El nombre no puede exceder los 30 caracteres.
                    </motion.p>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {isDuplicateMenuName && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> Este menú ya existe
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Fotos de la Galería del Menú (Subida directa)</label>
                {(editingMenu.fotos || []).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {editingMenu.fotos.map((foto, idx) => (
                      <div key={idx} className="relative group border border-zinc-700 rounded-xl overflow-hidden h-24 bg-zinc-950 flex items-center justify-center">
                        <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button type="button" onClick={() => { onRequestConfirmation("Eliminar archivo", "¿Seguro que deseas eliminar este archivo?", () => { setEditingMenu({ ...editingMenu, fotos: editingMenu.fotos.filter((_, i) => i !== idx) }); }); }} className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md shadow-md transition-opacity cursor-pointer" title="Eliminar foto"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <MediaUploader onUploadSuccess={(url) => { setEditingMenu({ ...editingMenu, fotos: [...(editingMenu.fotos || []), url] }); showStatus("¡Foto subida y agregada con éxito!"); }} accept="image/*,video/*" mode="dropzone" label="Subir nueva foto para este menú" token={token} />
              </div>

              {editingMenu.tipo === 'tiempo' ? (
                <MenuCoursesEditor
                  items={editingMenu.items}
                  numTiempos={editingMenu.numTiempos || 2}
                  onRequestConfirmation={onRequestConfirmation}
                  onChange={handleItemsChange}
                />
              ) : editingMenu.conCategorias ? (
                <CategorizedListEditor
                  items={editingMenu.items}
                  maxCategories={10}
                  maxOptionsPerCat={15}
                  title="Categorías y Platillos"
                  subtitle="Divide tu menú por tipo (ej. Pollo, Res, Guarniciones) y añade los platillos correspondientes."
                  categoryLabel="Categoría"
                  optionLabel="Platillo"
                  notePlaceholder="Ej. Incluye guarniciones y acompañamientos."
                  onRequestConfirmation={onRequestConfirmation}
                  onChange={handleItemsChange}
                />
              ) : (
                <StructuredListEditor
                  items={editingMenu.items}
                  maxLimit={12}
                  title="Platillos del Menú Tradicional"
                  subtitle="Gestiona individualmente cada platillo del menú."
                  itemLabel="Platillo"
                  notePlaceholder="Ej. Todos los platillos incluyen guarnición."
                  onRequestConfirmation={onRequestConfirmation}
                  onChange={handleItemsChange}
                />
              )}

              {/* Salseado Configuration for tiempo menus */}
              {editingMenu.tipo === 'tiempo' && hasSalseados && (
                <div className="bg-zinc-800/80 border border-zinc-700/80 p-3.5 rounded-xl text-xs text-zinc-300">
                  <span className="font-bold text-emerald-400 block mb-0.5">Salseado por Opción</span>
                  <span className="text-[11px] text-zinc-400 block leading-relaxed">
                    En los menús por tiempos, la casilla de Salseado se activa individualmente en cada opción. Las opciones marcadas mostrarán en la página principal la leyenda:
                    <span className="italic font-semibold text-emerald-400 block mt-1">"Salseado a elegir: BBQ, Nuez, Champiñón, Chipotle o 3 Chiles"</span>
                  </span>
                </div>
              )}

              <div className="text-right pt-4 flex justify-end gap-2 border-t border-zinc-800">
                <button type="button" onClick={cancelCreation} className="px-4 py-2 border border-zinc-700 bg-zinc-800 hover:bg-zinc-755 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer">Cancelar</button>
                <button
                  type="submit"
                  disabled={isDuplicateMenuName || (editingMenu.nombre || '').length > 30}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-md ${
                    isDuplicateMenuName || (editingMenu.nombre || '').length > 30
                      ? "bg-zinc-700 text-zinc-400 border border-zinc-600 opacity-60 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 cursor-pointer"
                  }`}
                >
                  Guardar Menú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
