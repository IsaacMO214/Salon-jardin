import React, { useState } from "react";
import { Plus, X, Trash2, Edit2, ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppData, Paquete } from "../types";

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
  const [, setForceRender] = useState(false);

  const masterSociales = data.master_servicios_sociales || [];
  const masterInfantiles = data.master_servicios_infantiles || [];

  const [editingMasterS, setEditingMasterS] = useState<{ oldVal: string, newVal: string } | null>(null);
  const [editingMasterI, setEditingMasterI] = useState<{ oldVal: string, newVal: string } | null>(null);

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
    const isSocial = type === 'social';
    const updatedPaquetes = isSocial 
      ? data.paquetes_sociales.map(p => p.id === pkg.id ? pkg : p)
      : data.paquetes_infantiles.map(p => p.id === pkg.id ? pkg : p);
      
    const ok = await apiCall("/api/admin/save-section", {
      section: isSocial ? "paquetes_sociales" : "paquetes_infantiles",
      data: updatedPaquetes,
    });
    if (ok) {
      if (isSocial) setEditingSocialPkg(null);
      else setEditingInfantPkg(null);
      showStatus(`Paquete ${isSocial ? "social" : "infantil"} guardado.`);
    }
  };

  const handleUpdateMasterService = async (type: 'social' | 'infantil', oldVal: string, newVal: string) => {
    if (!newVal.trim() || oldVal === newVal.trim()) return;
    const listName = type === 'social' ? 'master_servicios_sociales' : 'master_servicios_infantiles';
    const newList = (data[listName] || []).map(s => s === oldVal ? newVal.trim() : s);
    
    const pkgsName = type === 'social' ? 'paquetes_sociales' : 'paquetes_infantiles';
    const newPkgs = (data[pkgsName] || []).map((p: Paquete) => ({
      ...p,
      servicios: p.servicios.map(s => s === oldVal ? newVal.trim() : s)
    }));

    const ok1 = await apiCall('/api/admin/save-section', { section: listName, data: newList });
    if (ok1) {
      await apiCall('/api/admin/save-section', { section: pkgsName, data: newPkgs });
      showStatus("Servicio base actualizado para todos los paquetes.");
      if (type === 'social') setEditingMasterS(null);
      else setEditingMasterI(null);
      
      if (type === 'social' && editingSocialPkg) {
        setEditingSocialPkg({ ...editingSocialPkg, servicios: editingSocialPkg.servicios.map(s => s === oldVal ? newVal.trim() : s) });
      } else if (type === 'infantil' && editingInfantPkg) {
        setEditingInfantPkg({ ...editingInfantPkg, servicios: editingInfantPkg.servicios.map(s => s === oldVal ? newVal.trim() : s) });
      }
    }
  };

  const handleDeleteMasterService = async (type: 'social' | 'infantil', val: string) => {
    onRequestConfirmation("Eliminar Servicio Base", "¿Eliminar este servicio predeterminado de la lista?", async () => {
      const listName = type === 'social' ? 'master_servicios_sociales' : 'master_servicios_infantiles';
      const newList = (data[listName] || []).filter(s => s !== val);
      const ok = await apiCall('/api/admin/save-section', { section: listName, data: newList });
      if (ok) showStatus("Servicio eliminado de la lista base.");
    });
  };

  const handleDeletePaquete = (type: 'social' | 'infantil', id: string) => {
    onRequestConfirmation("Eliminar Paquete", "¿Seguro que deseas eliminar este paquete?", async () => {
      const endpoint = type === 'social' ? `/api/admin/paquetes-sociales/delete/${id}` : `/api/admin/paquetes-infantiles/delete/${id}`;
      await apiCall(endpoint, {});
    });
  };

  const handleMovePaquete = async (type: 'social' | 'infantil', id: string, direction: 'up' | 'down') => {
    const section = type === 'social' ? 'paquetes_sociales' : 'paquetes_infantiles';
    const list = [...data[section]];
    list.sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return;
    
    const currentItem = list[index];

    const isSalon = currentItem.tipoServicio === 'salon' || (!currentItem.tipoServicio && (!currentItem.menus || currentItem.menus.length === 0));
    const groupPredicate = (p: Paquete) => {
      const pIsSalon = p.tipoServicio === 'salon' || (!p.tipoServicio && (!p.menus || p.menus.length === 0));
      return pIsSalon === isSalon;
    };

    const groupItems = list.filter(groupPredicate);
    const groupIndex = groupItems.findIndex(p => p.id === id);
    
    if (groupIndex === -1) return;
    if (direction === 'up' && groupIndex === 0) return;
    if (direction === 'down' && groupIndex === groupItems.length - 1) return;

    const adjacentItem = groupItems[direction === 'up' ? groupIndex - 1 : groupIndex + 1];

    const listIndex = list.findIndex(p => p.id === currentItem.id);
    const adjacentListIndex = list.findIndex(p => p.id === adjacentItem.id);

    // Swap en la lista principal
    list[listIndex] = adjacentItem;
    list[adjacentListIndex] = currentItem;

    // Normalize
    list.forEach((item, i) => {
      item.orden = i;
    });

    setForceRender(r => !r); // Fuerza un re-render local para la animación instantánea

    const ok = await apiCall('/api/admin/save-section', { section, data: list });
    if (ok) {
      showStatus("Orden actualizado exitosamente.");
    }
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
            <h4 className="font-bold text-xs text-fantasy-purple-400 uppercase tracking-widest">Paquetes Sociales</h4>
            <span className="bg-fantasy-purple-950/80 text-fantasy-purple-400 border border-fantasy-purple-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">{data.paquetes_sociales.length}</span>
          </div>
          <button
            onClick={() => setEditingSocialPkg({ id: "soc-pkg-" + Date.now(), nombre: "", precio: 400, horas: 6, tipoServicio: "salon", servicios: [...masterSociales], menus: [] })}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-fantasy-purple-950/90 border border-fantasy-purple-500/50 text-fantasy-purple-300 hover:bg-fantasy-purple-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Paquete Social
          </button>
        </div>

        {/* Subgroup: Servicio Salón */}
        <div className="pt-2">
          <h5 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-3">Servicio Salón</h5>
          <div className="flex flex-col gap-3.5">
            <AnimatePresence mode="popLayout">
              {[...data.paquetes_sociales].sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .filter(p => p.tipoServicio === 'salon' || (!p.tipoServicio && (!p.menus || p.menus.length === 0)))
                .map((p, index) => { 
                  return (
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }} key={p.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 transition-colors flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-fantasy-purple-950/80 border border-fantasy-purple-500/30 flex items-center justify-center text-[10px] font-bold text-fantasy-purple-400 shrink-0" title={`Posición #${index + 1} en esta lista`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs text-zinc-100">{p.nombre}</p>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">${p.precio} p/p • {p.horas} hrs</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleMovePaquete('social', p.id, 'up')} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Subir paquete"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleMovePaquete('social', p.id, 'down')} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Bajar paquete"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingSocialPkg(p)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer ml-2" title="Editar paquete social"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeletePaquete('social', p.id)} className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer" title="Eliminar paquete social"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            )})}
            </AnimatePresence>
          </div>
        </div>

        {/* Subgroup: Servicio Salón y Alimentos */}
        <div className="pt-4">
          <h5 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-3">Servicio Salón y Alimentos</h5>
          <div className="flex flex-col gap-3.5">
            <AnimatePresence mode="popLayout">
              {[...data.paquetes_sociales].sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .filter(p => !(p.tipoServicio === 'salon' || (!p.tipoServicio && (!p.menus || p.menus.length === 0))))
                .map((p, index) => { 
                  return (
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }} key={p.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 transition-colors flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-fantasy-purple-950/80 border border-fantasy-purple-500/30 flex items-center justify-center text-[10px] font-bold text-fantasy-purple-400 shrink-0" title={`Posición #${index + 1} en esta lista`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs text-zinc-100">{p.nombre}</p>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">${p.precio} p/p • {p.horas} hrs</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleMovePaquete('social', p.id, 'up')} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Subir paquete"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleMovePaquete('social', p.id, 'down')} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Bajar paquete"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingSocialPkg(p)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer ml-2" title="Editar paquete social"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeletePaquete('social', p.id)} className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer" title="Eliminar paquete social"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            )})}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sub-section Infant Packages */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <h4 className="font-bold text-xs text-fantasy-purple-400 uppercase tracking-widest">Paquetes Infantiles</h4>
            <span className="bg-fantasy-purple-950/80 text-fantasy-purple-400 border border-fantasy-purple-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">{data.paquetes_infantiles.length}</span>
          </div>
          <button onClick={() => setEditingInfantPkg({ id: "inf-pkg-" + Date.now(), nombre: "", precio: 250, horas: 6, tipoServicio: "salon", servicios: [...masterInfantiles], menus: [] })} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-fantasy-purple-950/90 border border-fantasy-purple-500/50 text-fantasy-purple-300 hover:bg-fantasy-purple-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Agregar Paquete Infantil
          </button>
        </div>
        {/* Subgroup: Servicio Salón */}
        <div className="pt-2">
          <h5 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-3">Servicio Salón</h5>
          <div className="flex flex-col gap-3.5">
            <AnimatePresence mode="popLayout">
              {[...data.paquetes_infantiles].sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .filter(p => p.tipoServicio === 'salon' || (!p.tipoServicio && (!p.menus || p.menus.length === 0)))
                .map((p, index) => { 
                  const isSalon = true;
                  return (
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }} key={p.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 transition-colors flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-fantasy-purple-950/80 border border-fantasy-purple-500/30 flex items-center justify-center text-[10px] font-bold text-fantasy-purple-400 shrink-0" title={`Posición #${index + 1} en esta lista`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs text-zinc-100">{p.nombre}</p>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">${p.precio} p/p • {p.horas} hrs</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleMovePaquete('infantil', p.id, 'up')} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Subir paquete"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleMovePaquete('infantil', p.id, 'down')} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Bajar paquete"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingInfantPkg(p)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer ml-2" title="Editar paquete infantil"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeletePaquete('infantil', p.id)} className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer" title="Eliminar paquete infantil"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            )})}
            </AnimatePresence>
          </div>
        </div>

        {/* Subgroup: Servicio Salón y Alimentos */}
        <div className="pt-4">
          <h5 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-3">Servicio Salón y Alimentos</h5>
          <div className="flex flex-col gap-3.5">
            <AnimatePresence mode="popLayout">
              {[...data.paquetes_infantiles].sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .filter(p => !(p.tipoServicio === 'salon' || (!p.tipoServicio && (!p.menus || p.menus.length === 0))))
                .map((p, index) => { 
                  const isSalon = false;
                  return (
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }} key={p.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 transition-colors flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-fantasy-purple-950/80 border border-fantasy-purple-500/30 flex items-center justify-center text-[10px] font-bold text-fantasy-purple-400 shrink-0" title={`Posición #${index + 1} en esta lista`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs text-zinc-100">{p.nombre}</p>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">${p.precio} p/p • {p.horas} hrs</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleMovePaquete('infantil', p.id, 'up')} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Subir paquete"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleMovePaquete('infantil', p.id, 'down')} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Bajar paquete"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingInfantPkg(p)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer ml-2" title="Editar paquete infantil"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeletePaquete('infantil', p.id)} className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer" title="Eliminar paquete infantil"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            )})}
            </AnimatePresence>
          </div>
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
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-fantasy-purple-500"
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
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-fantasy-purple-500"
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
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-300 mb-1">Horas de servicio</label>
                <select
                  value={editingSocialPkg.horas || 6}
                  onChange={(e) => setEditingSocialPkg({ ...editingSocialPkg, horas: parseInt(e.target.value) || 6 })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-fantasy-purple-500 cursor-pointer"
                >
                  <option value={6}>6 Horas</option>
                  <option value={7}>7 Horas</option>
                  <option value={8}>8 Horas</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-fantasy-pink-400 uppercase tracking-wider mb-1">Categoría / Tipo</label>
                <select value={editingSocialPkg.tipoServicio || (editingSocialPkg.menus && editingSocialPkg.menus.length > 0 ? "salon_alimentos" : "salon")} onChange={(e) => setEditingSocialPkg({ ...editingSocialPkg, tipoServicio: e.target.value as 'salon' | 'salon_alimentos' })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-fantasy-purple-500">
                  <option value="salon">Servicio Salón</option>
                  <option value="salon_alimentos">Servicio Salón y Alimentos</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-fantasy-purple-400 uppercase tracking-wider mb-1">Tipo de Banquete Incluido a elegir</label>
                <div className="max-h-28 overflow-y-auto border border-zinc-700 rounded-lg p-2 bg-zinc-900 space-y-1.5">
                  {data.menus.map((m) => (
                    <label key={m.id} className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-200 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={editingSocialPkg.menus?.includes(m.id)} onChange={(e) => { const currentMenus = editingSocialPkg.menus || []; const newMenus = e.target.checked ? [...currentMenus, m.id] : currentMenus.filter(id => id !== m.id); setEditingSocialPkg({ ...editingSocialPkg, menus: newMenus }); }} className="rounded text-fantasy-purple-500 focus:ring-fantasy-purple-500" />
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
                  <button type="button" onClick={() => { const combined = Array.from(new Set([...masterSociales, ...editingSocialPkg.servicios])); setEditingSocialPkg({ ...editingSocialPkg, servicios: combined }); }} className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md font-bold text-zinc-300 transition-colors cursor-pointer">Marcar todos</button>
                  <button type="button" onClick={() => setEditingSocialPkg({ ...editingSocialPkg, servicios: [] })} className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md font-bold text-zinc-300 transition-colors cursor-pointer">Desmarcar todos</button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto border border-zinc-700 rounded-xl p-3 bg-zinc-950/80 space-y-1.5 mb-3">
                {masterSociales.map((servicio, idx) => { 
                  const checked = editingSocialPkg.servicios.includes(servicio); 
                  const isEditing = editingMasterS?.oldVal === servicio;
                  return (
                    <div key={idx} className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs transition-colors group ${checked ? "bg-fantasy-purple-950/80 border-fantasy-purple-500/40 text-fantasy-purple-200 font-medium" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60"}`}>
                      {!isEditing && (
                        <input type="checkbox" checked={checked} onChange={(e) => { const newServicios = e.target.checked ? [...editingSocialPkg.servicios, servicio] : editingSocialPkg.servicios.filter((s) => s !== servicio); setEditingSocialPkg({ ...editingSocialPkg, servicios: newServicios }); }} className="mt-0.5 rounded text-fantasy-purple-500 focus:ring-fantasy-purple-500 cursor-pointer shrink-0" />
                      )}
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                          <input type="text" value={editingMasterS.newVal} onChange={e => setEditingMasterS({...editingMasterS, newVal: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleUpdateMasterService('social', editingMasterS.oldVal, editingMasterS.newVal)} className="flex-1 bg-zinc-800 border border-fantasy-purple-500 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" autoFocus />
                          <button onClick={() => handleUpdateMasterService('social', editingMasterS.oldVal, editingMasterS.newVal)} className="text-green-400 hover:text-green-300 p-1 bg-zinc-800 rounded shadow-sm">✓</button>
                          <button onClick={() => setEditingMasterS(null)} className="text-red-400 hover:text-red-300 p-1 bg-zinc-800 rounded shadow-sm">✕</button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-start justify-between gap-2">
                          <span className="leading-snug cursor-pointer flex-1" onClick={() => { const newServicios = !checked ? [...editingSocialPkg.servicios, servicio] : editingSocialPkg.servicios.filter((s) => s !== servicio); setEditingSocialPkg({ ...editingSocialPkg, servicios: newServicios }); }}>{servicio}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => setEditingMasterS({ oldVal: servicio, newVal: servicio })} className="p-0.5 text-zinc-400 hover:text-fantasy-purple-300" title="Editar texto del servicio predeterminado"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleDeleteMasterService('social', servicio)} className="p-0.5 text-zinc-400 hover:text-red-400" title="Eliminar servicio predeterminado"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ); 
                })}
                {editingSocialPkg.servicios.filter((s) => !masterSociales.includes(s)).map((customS, cIdx) => (<div key={cIdx} className="flex items-center justify-between p-2 rounded-lg border border-fantasy-pink-500/40 bg-fantasy-pink-950/40 text-xs text-fantasy-pink-200"><span className="leading-snug font-medium">★ {customS}</span><button type="button" onClick={() => { setEditingSocialPkg({ ...editingSocialPkg, servicios: editingSocialPkg.servicios.filter((s) => s !== customS) }); }} className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer" title="Eliminar servicio personalizado"><X className="w-3.5 h-3.5" /></button></div>))}
              </div>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input type="text" placeholder="¿Agregar otro servicio personalizado a la lista?" value={customSocialServ} onChange={(e) => setCustomSocialServ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (customSocialServ.trim()) { if (customSocialServ.trim().length > 25) { showStatus("Error: El servicio personalizado excede el límite de 25 caracteres."); return; } setEditingSocialPkg({ ...editingSocialPkg, servicios: [...editingSocialPkg.servicios, customSocialServ.trim()] }); setCustomSocialServ(""); } } }} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500" />
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
                    : "bg-fantasy-pink-600 hover:bg-fantasy-pink-500 text-white shadow-md shadow-fantasy-purple-950/40 cursor-pointer"
                }`}
              > Guardar </button>
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
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-fantasy-purple-500"
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
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-fantasy-purple-500"
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-fantasy-purple-500 cursor-pointer"
                >
                  <option value={6}>6 Horas</option>
                  <option value={7}>7 Horas</option>
                  <option value={8}>8 Horas</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-fantasy-pink-400 uppercase tracking-wider mb-1">Categoría / Tipo</label>
                <select value={editingInfantPkg.tipoServicio || (editingInfantPkg.menus && editingInfantPkg.menus.length > 0 ? "salon_alimentos" : "salon")} onChange={(e) => setEditingInfantPkg({ ...editingInfantPkg, tipoServicio: e.target.value as 'salon' | 'salon_alimentos' })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-fantasy-purple-500">
                  <option value="salon">Servicio Salón</option>
                  <option value="salon_alimentos">Servicio Salón y Alimentos</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-fantasy-purple-400 uppercase tracking-wider mb-1">Tipo de Banquete Incluido a elegir</label>
                <div className="max-h-28 overflow-y-auto border border-zinc-700 rounded-lg p-2 bg-zinc-900 space-y-1.5">
                  {data.menus.map((m) => (<label key={m.id} className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-200 cursor-pointer hover:text-white"><input type="checkbox" checked={editingInfantPkg.menus?.includes(m.id)} onChange={(e) => { const currentMenus = editingInfantPkg.menus || []; const newMenus = e.target.checked ? [...currentMenus, m.id] : currentMenus.filter(id => id !== m.id); setEditingInfantPkg({ ...editingInfantPkg, menus: newMenus }); }} className="rounded text-fantasy-purple-500 focus:ring-fantasy-purple-500" /><span>{m.nombre}</span></label>))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">Servicios Incluidos ({editingInfantPkg.servicios.length} seleccionados)</label>
                <div className="flex gap-2 text-[10px]">
                  <button type="button" onClick={() => { const combined = Array.from(new Set([...masterInfantiles, ...editingInfantPkg.servicios])); setEditingInfantPkg({ ...editingInfantPkg, servicios: combined }); }} className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md font-bold text-zinc-300 transition-colors cursor-pointer">Marcar todos</button>
                  <button type="button" onClick={() => setEditingInfantPkg({ ...editingInfantPkg, servicios: [] })} className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md font-bold text-zinc-300 transition-colors cursor-pointer">Desmarcar todos</button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto border border-zinc-700 rounded-xl p-3 bg-zinc-950/80 space-y-1.5 mb-3">
                {masterInfantiles.map((servicio, idx) => { 
                  const checked = editingInfantPkg.servicios.includes(servicio); 
                  const isEditing = editingMasterI?.oldVal === servicio;
                  return (
                    <div key={idx} className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs transition-colors group ${checked ? "bg-fantasy-purple-950/80 border-fantasy-purple-500/40 text-fantasy-purple-200 font-medium" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60"}`}>
                      {!isEditing && (
                        <input type="checkbox" checked={checked} onChange={(e) => { const newServicios = e.target.checked ? [...editingInfantPkg.servicios, servicio] : editingInfantPkg.servicios.filter((s) => s !== servicio); setEditingInfantPkg({ ...editingInfantPkg, servicios: newServicios }); }} className="mt-0.5 rounded text-fantasy-purple-500 focus:ring-fantasy-purple-500 cursor-pointer shrink-0" />
                      )}
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                          <input type="text" value={editingMasterI.newVal} onChange={e => setEditingMasterI({...editingMasterI, newVal: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleUpdateMasterService('infantil', editingMasterI.oldVal, editingMasterI.newVal)} className="flex-1 bg-zinc-800 border border-fantasy-purple-500 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" autoFocus />
                          <button onClick={() => handleUpdateMasterService('infantil', editingMasterI.oldVal, editingMasterI.newVal)} className="text-green-400 hover:text-green-300 p-1 bg-zinc-800 rounded shadow-sm">✓</button>
                          <button onClick={() => setEditingMasterI(null)} className="text-red-400 hover:text-red-300 p-1 bg-zinc-800 rounded shadow-sm">✕</button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-start justify-between gap-2">
                          <span className="leading-snug cursor-pointer flex-1" onClick={() => { const newServicios = !checked ? [...editingInfantPkg.servicios, servicio] : editingInfantPkg.servicios.filter((s) => s !== servicio); setEditingInfantPkg({ ...editingInfantPkg, servicios: newServicios }); }}>{servicio}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => setEditingMasterI({ oldVal: servicio, newVal: servicio })} className="p-0.5 text-zinc-400 hover:text-fantasy-purple-300" title="Editar texto del servicio predeterminado"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleDeleteMasterService('infantil', servicio)} className="p-0.5 text-zinc-400 hover:text-red-400" title="Eliminar servicio predeterminado"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ); 
                })}
                {editingInfantPkg.servicios.filter((s) => !masterInfantiles.includes(s)).map((customS, cIdx) => (<div key={cIdx} className="flex items-center justify-between p-2 rounded-lg border border-fantasy-pink-500/40 bg-fantasy-pink-950/40 text-xs text-fantasy-pink-200"><span className="leading-snug font-medium">★ {customS}</span><button type="button" onClick={() => { setEditingInfantPkg({ ...editingInfantPkg, servicios: editingInfantPkg.servicios.filter((s) => s !== customS) }); }} className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer" title="Eliminar servicio personalizado"><X className="w-3.5 h-3.5" /></button></div>))}
              </div>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input type="text" placeholder="¿Agregar otro servicio personalizado a la lista?" value={customInfantServ} onChange={(e) => setCustomInfantServ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (customInfantServ.trim()) { if (customInfantServ.trim().length > 25) { showStatus("Error: El servicio personalizado excede el límite de 25 caracteres."); return; } setEditingInfantPkg({ ...editingInfantPkg, servicios: [...editingInfantPkg.servicios, customInfantServ.trim()] }); setCustomInfantServ(""); } } }} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500" />
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
                    : "bg-fantasy-pink-600 hover:bg-fantasy-pink-500 text-white shadow-md shadow-fantasy-purple-950/40 cursor-pointer"
                }`}
              > Guardar </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
