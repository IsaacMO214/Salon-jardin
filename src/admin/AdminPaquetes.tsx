import React, { useState } from "react";
import { Plus, X, Trash2, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppData, Paquete } from "../types";
import { MASTER_SERVICIOS_SOCIALES, MASTER_SERVICIOS_INFANTILES } from "../constants/servicios";

interface AdminPaquetesProps {
  data: AppData;
  apiCall: (url: string, payload: any) => Promise<boolean>;
  showStatus: (msg: string) => void;
  onRequestConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

export default function AdminPaquetes({
  data,
  apiCall,
  showStatus,
  onRequestConfirmation
}: AdminPaquetesProps) {
  const [editingSocialPkg, setEditingSocialPkg] = useState<Paquete | null>(null);
  const [editingInfantPkg, setEditingInfantPkg] = useState<Paquete | null>(null);
  const [customSocialServ, setCustomSocialServ] = useState("");
  const [customInfantServ, setCustomInfantServ] = useState("");

  const isDuplicateSocialName = Boolean(
    editingSocialPkg &&
      editingSocialPkg.nombre.trim() !== "" &&
      data.paquetes_sociales.some(
        (p) =>
          p.id !== editingSocialPkg.id &&
          p.nombre.trim().toLowerCase() === editingSocialPkg.nombre.trim().toLowerCase()
      )
  );

  const isDuplicateInfantName = Boolean(
    editingInfantPkg &&
      editingInfantPkg.nombre.trim() !== "" &&
      data.paquetes_infantiles.some(
        (p) =>
          p.id !== editingInfantPkg.id &&
          p.nombre.trim().toLowerCase() === editingInfantPkg.nombre.trim().toLowerCase()
      )
  );

  const handleSavePaquete = async (type: 'social' | 'infantil', pkg: Paquete) => {
    if (type === 'social' && isDuplicateSocialName) {
      showStatus("Error: Este paquete social ya existe. Elige un nombre diferente.");
      return;
    }
    if (type === 'infantil' && isDuplicateInfantName) {
      showStatus("Error: Este paquete infantil ya existe. Elige un nombre diferente.");
      return;
    }
    if ((pkg.precio || 0) > 1000 || (pkg.precio || 0) < 0) {
      showStatus("Error: El precio por persona no puede exceder el límite de $1,000 MXN ni ser menor a 0.");
      return;
    }
    if (pkg.nombre && pkg.nombre.length > 60) {
      showStatus("Error: El nombre del paquete excede el límite de 60 caracteres.");
      return;
    }
    const endpoint = type === 'social' ? "/api/admin/paquetes-sociales/save" : "/api/admin/paquetes-infantiles/save";
    const ok = await apiCall(endpoint, { paquete: pkg });
    if (ok) {
      if (type === 'social') setEditingSocialPkg(null);
      else setEditingInfantPkg(null);
    }
  };

  const handleDeletePaquete = (type: 'social' | 'infantil', id: string) => {
    onRequestConfirmation("Eliminar Paquete", "¿Seguro que deseas eliminar este paquete?", async () => {
      const endpoint = type === 'social' ? `/api/admin/paquetes-sociales/delete/${id}` : `/api/admin/paquetes-infantiles/delete/${id}`;
      await apiCall(endpoint, {});
    });
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
        <h3 className="text-xl font-bold text-zinc-100">Gestionar Paquetes Sociales e Infantiles</h3>
      </div>

      {/* Sub-section Social Packages */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-widest">Paquetes Sociales</h4>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">{data.paquetes_sociales.length}</span>
          </div>
          <button
            onClick={() => setEditingSocialPkg({ id: "soc-pkg-" + Date.now(), nombre: "", precio: 400, horas: 6, servicios: [...MASTER_SERVICIOS_SOCIALES], menus: [] })}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Paquete Social
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {data.paquetes_sociales.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 transition-colors flex justify-between items-center gap-3">
              <div>
                <p className="font-semibold text-xs text-zinc-100">{p.nombre}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">${p.precio} p/p • {p.horas} hrs</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingSocialPkg(p)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Editar paquete social"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDeletePaquete('social', p.id)} className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer" title="Eliminar paquete social"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-section Infant Packages */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-widest">Paquetes Infantiles</h4>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">{data.paquetes_infantiles.length}</span>
          </div>
          <button onClick={() => setEditingInfantPkg({ id: "inf-pkg-" + Date.now(), nombre: "", precio: 250, horas: 6, tipoServicio: "salon", servicios: [...MASTER_SERVICIOS_INFANTILES], menus: [] })} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Agregar Paquete Infantil
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {data.paquetes_infantiles.map((p) => { const isSalon = p.tipoServicio === 'salon' || (!p.tipoServicio && (!p.menus || p.menus.length === 0)); return (
            <div key={p.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 transition-colors flex justify-between items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-xs text-zinc-100">{p.nombre}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${isSalon ? "bg-blue-950/80 text-blue-300 border-blue-500/30" : "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"}`}>{isSalon ? "Servicio Salón" : "Servicio Salón y Alimentos"}</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">${p.precio} p/p • {p.horas} hrs</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingInfantPkg(p)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Editar paquete infantil"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDeletePaquete('infantil', p.id)} className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer" title="Eliminar paquete infantil"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ); })}
        </div>
      </div>

      {/* MODAL EDITING SOCIAL PACKAGE */}
      {editingSocialPkg && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-700">
              <span className="font-bold text-base text-zinc-100">
                {data.paquetes_sociales.some((p) => p.id === editingSocialPkg.id) ? "Editar Paquete Social" : "Agregar Nuevo Paquete Social"}
              </span>
              <button type="button" onClick={() => setEditingSocialPkg(null)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-zinc-300 mb-1">Nombre del paquete</label>
                <input
                  type="text"
                  value={editingSocialPkg.nombre}
                  onChange={(e) => setEditingSocialPkg({ ...editingSocialPkg, nombre: e.target.value })}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none transition-colors ${
                    isDuplicateSocialName
                      ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500"
                  }`}
                />
                <AnimatePresence>
                  {(editingSocialPkg.nombre || '').length > 60 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> El nombre no puede exceder los 60 caracteres.
                    </motion.p>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {isDuplicateSocialName && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> Este paquete ya existe
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-300 mb-1">Precio por Persona ($ MXN)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max="1000"
                  value={editingSocialPkg.precio}
                  onChange={(e) => setEditingSocialPkg({ ...editingSocialPkg, precio: parseInt(e.target.value) || 0 })}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                    (editingSocialPkg.precio || 0) > 1000 || (editingSocialPkg.precio || 0) < 0
                      ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500"
                  }`}
                />
                <AnimatePresence>
                  {((editingSocialPkg.precio || 0) > 1000 || (editingSocialPkg.precio || 0) < 0) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> Error: El precio excede el límite máximo permitido de $1,000 MXN.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-300 mb-1">Horas de servicio</label>
                <select
                  value={editingSocialPkg.horas || 6}
                  onChange={(e) => setEditingSocialPkg({ ...editingSocialPkg, horas: parseInt(e.target.value) || 6 })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={6}>6 Horas</option>
                  <option value={7}>7 Horas</option>
                  <option value={8}>8 Horas</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Tipo de Banquete Incluido a elegir</label>
                <div className="max-h-28 overflow-y-auto border border-zinc-700 rounded-lg p-2 bg-zinc-900 space-y-1.5">
                  {data.menus.map((m) => (
                    <label key={m.id} className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-200 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={editingSocialPkg.menus?.includes(m.id)} onChange={(e) => { const currentMenus = editingSocialPkg.menus || []; const newMenus = e.target.checked ? [...currentMenus, m.id] : currentMenus.filter(id => id !== m.id); setEditingSocialPkg({ ...editingSocialPkg, menus: newMenus }); }} className="rounded text-emerald-500 focus:ring-emerald-500" />
                      <span>{m.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">Servicios Incluidos ({editingSocialPkg.servicios.length} seleccionados)</label>
                <div className="flex gap-2 text-[10px]">
                  <button type="button" onClick={() => { const combined = Array.from(new Set([...MASTER_SERVICIOS_SOCIALES, ...editingSocialPkg.servicios])); setEditingSocialPkg({ ...editingSocialPkg, servicios: combined }); }} className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md font-bold text-zinc-300 transition-colors cursor-pointer">Marcar todos</button>
                  <button type="button" onClick={() => setEditingSocialPkg({ ...editingSocialPkg, servicios: [] })} className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md font-bold text-zinc-300 transition-colors cursor-pointer">Desmarcar todos</button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto border border-zinc-700 rounded-xl p-3 bg-zinc-950/80 space-y-1.5 mb-3">
                {MASTER_SERVICIOS_SOCIALES.map((servicio, idx) => { const checked = editingSocialPkg.servicios.includes(servicio); return (<label key={idx} className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${checked ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200 font-medium" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60"}`}><input type="checkbox" checked={checked} onChange={(e) => { const newServicios = e.target.checked ? [...editingSocialPkg.servicios, servicio] : editingSocialPkg.servicios.filter((s) => s !== servicio); setEditingSocialPkg({ ...editingSocialPkg, servicios: newServicios }); }} className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500" /><span className="leading-snug">{servicio}</span></label>); })}
                {editingSocialPkg.servicios.filter((s) => !MASTER_SERVICIOS_SOCIALES.includes(s)).map((customS, cIdx) => (<div key={cIdx} className="flex items-center justify-between p-2 rounded-lg border border-amber-500/40 bg-amber-950/40 text-xs text-amber-200"><span className="leading-snug font-medium">★ {customS}</span><button type="button" onClick={() => { setEditingSocialPkg({ ...editingSocialPkg, servicios: editingSocialPkg.servicios.filter((s) => s !== customS) }); }} className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer" title="Eliminar servicio personalizado"><X className="w-3.5 h-3.5" /></button></div>))}
              </div>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input type="text" placeholder="¿Agregar otro servicio personalizado a la lista?" value={customSocialServ} onChange={(e) => setCustomSocialServ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (customSocialServ.trim()) { if (customSocialServ.trim().length > 25) { showStatus("Error: El servicio personalizado excede el límite de 25 caracteres."); return; } setEditingSocialPkg({ ...editingSocialPkg, servicios: [...editingSocialPkg.servicios, customSocialServ.trim()] }); setCustomSocialServ(""); } } }} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500" />
                  <AnimatePresence>
                    {customSocialServ.trim().length > 25 && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        <span>⚠️</span> El servicio no puede exceder los 25 caracteres.
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <button type="button" onClick={() => { if (customSocialServ.trim()) { if (customSocialServ.trim().length > 25) { showStatus("Error: El servicio personalizado excede el límite de 25 caracteres."); return; } setEditingSocialPkg({ ...editingSocialPkg, servicios: [...editingSocialPkg.servicios, customSocialServ.trim()] }); setCustomSocialServ(""); } }} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-200 cursor-pointer transition-colors">+ Agregar</button>
                </div>
              </div>
            </div>

            <div className="text-right flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingSocialPkg(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer">Cancelar</button>
              <button
                type="button"
                disabled={isDuplicateSocialName || (editingSocialPkg.precio || 0) > 1000 || (editingSocialPkg.precio || 0) < 0 || (editingSocialPkg.nombre || '').length > 60}
                onClick={() => handleSavePaquete('social', editingSocialPkg)}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${
                  isDuplicateSocialName || (editingSocialPkg.precio || 0) > 1000 || (editingSocialPkg.precio || 0) < 0 || (editingSocialPkg.nombre || '').length > 60
                    ? "bg-zinc-700 text-zinc-400 border border-zinc-600 opacity-60 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 cursor-pointer"
                }`}
              >
                Guardar Paquete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITING INFANT PACKAGE */}
      {editingInfantPkg && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-700">
              <span className="font-bold text-base text-zinc-100">
                {data.paquetes_infantiles.some((p) => p.id === editingInfantPkg.id) ? "Editar Paquete Infantil" : "Agregar Nuevo Paquete Infantil"}
              </span>
              <button type="button" onClick={() => setEditingInfantPkg(null)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-zinc-300 mb-1">Nombre del paquete</label>
                <input
                  type="text"
                  value={editingInfantPkg.nombre}
                  onChange={(e) => setEditingInfantPkg({ ...editingInfantPkg, nombre: e.target.value })}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none transition-colors ${
                    isDuplicateInfantName
                      ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500"
                  }`}
                />
                <AnimatePresence>
                  {(editingInfantPkg.nombre || '').length > 60 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> El nombre no puede exceder los 60 caracteres.
                    </motion.p>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {isDuplicateInfantName && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> Este paquete ya existe
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-300 mb-1">Precio por Persona ($ MXN)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max="1000"
                  value={editingInfantPkg.precio}
                  onChange={(e) => setEditingInfantPkg({ ...editingInfantPkg, precio: parseInt(e.target.value) || 0 })}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                    (editingInfantPkg.precio || 0) > 1000 || (editingInfantPkg.precio || 0) < 0
                      ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500"
                  }`}
                />
                <AnimatePresence>
                  {((editingInfantPkg.precio || 0) > 1000 || (editingInfantPkg.precio || 0) < 0) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> Error: El precio excede el límite máximo permitido de $1,000 MXN.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-300 mb-1">Horas de servicio</label>
                <select
                  value={editingInfantPkg.horas || 6}
                  onChange={(e) => setEditingInfantPkg({ ...editingInfantPkg, horas: parseInt(e.target.value) || 6 })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={6}>6 Horas</option>
                  <option value={7}>7 Horas</option>
                  <option value={8}>8 Horas</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Categoría / Tipo</label>
                <select value={editingInfantPkg.tipoServicio || (editingInfantPkg.menus && editingInfantPkg.menus.length > 0 ? "salon_alimentos" : "salon")} onChange={(e) => setEditingInfantPkg({ ...editingInfantPkg, tipoServicio: e.target.value as 'salon' | 'salon_alimentos' })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500">
                  <option value="salon">Servicio Salón</option>
                  <option value="salon_alimentos">Servicio Salón y Alimentos</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Tipo de Banquete Incluido a elegir</label>
                <div className="max-h-28 overflow-y-auto border border-zinc-700 rounded-lg p-2 bg-zinc-900 space-y-1.5">
                  {data.menus.map((m) => (<label key={m.id} className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-200 cursor-pointer hover:text-white"><input type="checkbox" checked={editingInfantPkg.menus?.includes(m.id)} onChange={(e) => { const currentMenus = editingInfantPkg.menus || []; const newMenus = e.target.checked ? [...currentMenus, m.id] : currentMenus.filter(id => id !== m.id); setEditingInfantPkg({ ...editingInfantPkg, menus: newMenus }); }} className="rounded text-emerald-500 focus:ring-emerald-500" /><span>{m.nombre}</span></label>))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">Servicios Incluidos ({editingInfantPkg.servicios.length} seleccionados)</label>
                <div className="flex gap-2 text-[10px]">
                  <button type="button" onClick={() => { const combined = Array.from(new Set([...MASTER_SERVICIOS_INFANTILES, ...editingInfantPkg.servicios])); setEditingInfantPkg({ ...editingInfantPkg, servicios: combined }); }} className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md font-bold text-zinc-300 transition-colors cursor-pointer">Marcar todos</button>
                  <button type="button" onClick={() => setEditingInfantPkg({ ...editingInfantPkg, servicios: [] })} className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md font-bold text-zinc-300 transition-colors cursor-pointer">Desmarcar todos</button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto border border-zinc-700 rounded-xl p-3 bg-zinc-950/80 space-y-1.5 mb-3">
                {MASTER_SERVICIOS_INFANTILES.map((servicio, idx) => { const checked = editingInfantPkg.servicios.includes(servicio); return (<label key={idx} className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${checked ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200 font-medium" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60"}`}><input type="checkbox" checked={checked} onChange={(e) => { const newServicios = e.target.checked ? [...editingInfantPkg.servicios, servicio] : editingInfantPkg.servicios.filter((s) => s !== servicio); setEditingInfantPkg({ ...editingInfantPkg, servicios: newServicios }); }} className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500" /><span className="leading-snug">{servicio}</span></label>); })}
                {editingInfantPkg.servicios.filter((s) => !MASTER_SERVICIOS_INFANTILES.includes(s)).map((customS, cIdx) => (<div key={cIdx} className="flex items-center justify-between p-2 rounded-lg border border-amber-500/40 bg-amber-950/40 text-xs text-amber-200"><span className="leading-snug font-medium">★ {customS}</span><button type="button" onClick={() => { setEditingInfantPkg({ ...editingInfantPkg, servicios: editingInfantPkg.servicios.filter((s) => s !== customS) }); }} className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer" title="Eliminar servicio personalizado"><X className="w-3.5 h-3.5" /></button></div>))}
              </div>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input type="text" placeholder="¿Agregar otro servicio personalizado a la lista?" value={customInfantServ} onChange={(e) => setCustomInfantServ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (customInfantServ.trim()) { if (customInfantServ.trim().length > 25) { showStatus("Error: El servicio personalizado excede el límite de 25 caracteres."); return; } setEditingInfantPkg({ ...editingInfantPkg, servicios: [...editingInfantPkg.servicios, customInfantServ.trim()] }); setCustomInfantServ(""); } } }} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500" />
                  <AnimatePresence>
                    {customInfantServ.trim().length > 25 && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        <span>⚠️</span> El servicio no puede exceder los 25 caracteres.
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <button type="button" onClick={() => { if (customInfantServ.trim()) { if (customInfantServ.trim().length > 25) { showStatus("Error: El servicio personalizado excede el límite de 25 caracteres."); return; } setEditingInfantPkg({ ...editingInfantPkg, servicios: [...editingInfantPkg.servicios, customInfantServ.trim()] }); setCustomInfantServ(""); } }} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-200 cursor-pointer transition-colors">+ Agregar</button>
                </div>
              </div>
            </div>

            <div className="text-right flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingInfantPkg(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer">Cancelar</button>
              <button
                type="button"
                disabled={isDuplicateInfantName || (editingInfantPkg.precio || 0) > 1000 || (editingInfantPkg.precio || 0) < 0 || (editingInfantPkg.nombre || '').length > 60}
                onClick={() => handleSavePaquete('infantil', editingInfantPkg)}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${
                  isDuplicateInfantName || (editingInfantPkg.precio || 0) > 1000 || (editingInfantPkg.precio || 0) < 0 || (editingInfantPkg.nombre || '').length > 60
                    ? "bg-zinc-700 text-zinc-400 border border-zinc-600 opacity-60 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 cursor-pointer"
                }`}
              >
                Guardar Paquete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
