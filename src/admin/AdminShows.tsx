import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Edit2, Calendar, Users, FileText, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppData, Show, ServicioAdicional } from "../types";
import MediaUploader from "../components/ui/MediaUploader";

interface AdminShowsProps {
  data: AppData;
  token: string;
  apiCall: (url: string, payload: any) => Promise<boolean>;
  showStatus: (msg: string) => void;
  onRequestConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

export default function AdminShows({
  data,
  token,
  apiCall,
  showStatus,
  onRequestConfirmation
}: AdminShowsProps) {
  const [showsList, setShowsList] = useState<Show[]>([...data.shows]);
  const [additionalList, setAdditionalList] = useState([...data.servicios_adicionales]);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [editingService, setEditingService] = useState<{ index?: number; nombre: string; precio: number; descripcion?: string; sinPrecioFijo?: boolean; tipoCobro?: 'evento' | 'persona' | 'cotizacion' } | null>(null);

  const isDuplicateShowName = Boolean(
    editingShow &&
      editingShow.nombre.trim() !== "" &&
      showsList.some(
        (s) =>
          s.id !== editingShow.id &&
          s.nombre.trim().toLowerCase() === editingShow.nombre.trim().toLowerCase()
      )
  );

  const isDuplicateServiceName = Boolean(
    editingService &&
      editingService.nombre.trim() !== "" &&
      additionalList.some(
        (s, idx) =>
          idx !== editingService.index &&
          s.nombre.trim().toLowerCase() === editingService.nombre.trim().toLowerCase()
      )
  );

  useEffect(() => {
    setShowsList([...data.shows]);
    setAdditionalList([...data.servicios_adicionales]);
  }, [data.shows, data.servicios_adicionales]);

    const handleSaveShowItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShow) return;
    if (isDuplicateShowName) {
      showStatus("Error: Este show ya existe. Elige un nombre diferente.");
      return;
    }
    if ((editingShow.precio || 0) > 10000 || (editingShow.precio || 0) < 0) {
      showStatus("Error: El precio del show debe estar entre $0 y $10,000 MXN.");
      return;
    }
    if (editingShow.nombre && editingShow.nombre.length > 30) {
      showStatus("Error: El nombre excede el límite de 30 caracteres.");
      return;
    }
    if (editingShow.descripcion && editingShow.descripcion.length > 300) {
      showStatus("Error: La descripción excede el límite de 300 caracteres.");
      return;
    }

    let newShows: Show[];
    const exists = showsList.some(s => s.id === editingShow.id);
    if (exists) {
      newShows = showsList.map(s => s.id === editingShow.id ? editingShow : s);
    } else {
      newShows = [...showsList, editingShow];
    }

    setShowsList(newShows);
    const ok = await apiCall("/api/admin/save-section", { section: "shows", data: newShows });
    if (ok) {
      setEditingShow(null);
      showStatus("¡Espectáculo guardado con éxito!");
    }
  };

  const handleDeleteShow = (id: string) => {
    onRequestConfirmation("Eliminar Espectáculo Infantil", "¿Seguro que deseas eliminar este espectáculo infantil?", async () => {
      const newShows = showsList.filter(s => s.id !== id);
      setShowsList(newShows);
      const ok = await apiCall("/api/admin/save-section", { section: "shows", data: newShows });
      if (ok) {
        showStatus("¡Espectáculo eliminado con éxito!");
      }
    });
  };

    const handleSaveServiceItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    if (isDuplicateServiceName) {
      showStatus("Error: Este servicio adicional ya existe. Elige un nombre diferente.");
      return;
    }
    const checkPrecio = (editingService.tipoCobro === 'cotizacion' || editingService.sinPrecioFijo) ? 0 : (editingService.precio || 0);
    if (checkPrecio > 10000 || checkPrecio < 0) {
      showStatus("Error: El precio del servicio debe estar entre $0 y $10,000 MXN.");
      return;
    }
    if (editingService.nombre && editingService.nombre.length > 30) {
      showStatus("Error: El nombre excede el límite de 30 caracteres.");
      return;
    }
    if (editingService.descripcion && editingService.descripcion.length > 300) {
      showStatus("Error: La descripción excede el límite de 300 caracteres.");
      return;
    }

    const selectedTipo = editingService.tipoCobro || (editingService.sinPrecioFijo ? 'cotizacion' : 'evento');
    const isSinPrecio = selectedTipo === 'cotizacion' || !!editingService.sinPrecioFijo;
    const itemToSave: ServicioAdicional = {
      nombre: editingService.nombre,
      precio: isSinPrecio ? 0 : editingService.precio,
      ...(editingService.descripcion ? { descripcion: editingService.descripcion } : {}),
      sinPrecioFijo: isSinPrecio,
      tipoCobro: selectedTipo
    };

    let newServices: ServicioAdicional[];
    if (editingService.index !== undefined && editingService.index >= 0) {
      newServices = [...additionalList];
      newServices[editingService.index] = itemToSave;
    } else {
      newServices = [...additionalList, itemToSave];
    }

    setAdditionalList(newServices);
    const ok = await apiCall("/api/admin/save-section", { section: "servicios_adicionales", data: newServices });
    if (ok) {
      setEditingService(null);
      showStatus("¡Servicio adicional guardado con éxito!");
    }
  };

  const handleDeleteService = (index: number) => {
    onRequestConfirmation("Eliminar Servicio Adicional", "¿Seguro que deseas eliminar este servicio adicional?", async () => {
      const newServices = additionalList.filter((_, i) => i !== index);
      setAdditionalList(newServices);
      const ok = await apiCall("/api/admin/save-section", { section: "servicios_adicionales", data: newServices });
      if (ok) {
        showStatus("¡Servicio adicional eliminado con éxito!");
      }
    });
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-zinc-100 pb-2 border-b border-zinc-800">Gestionar Shows y Servicios Adicionales</h3>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <h4 className="font-bold text-sm sm:text-base text-zinc-100 uppercase tracking-wider">Espectáculos Infantiles</h4>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">{showsList.length}</span>
          </div>
          {!editingShow && !editingService && (
            <button type="button" onClick={() => setEditingShow({ id: "show-" + Date.now(), nombre: "", precio: 5500, duracion: "1 Hora", descripcion: "", fotos: [], videoUrl: "" })} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm self-start sm:self-auto">
              <Plus className="w-3.5 h-3.5" /> Agregar Show
            </button>
          )}
        </div>
        {showsList.length === 0 ? (<p className="text-xs text-zinc-500 italic py-4">No hay espectáculos infantiles registrados.</p>) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {showsList.map((show) => (
              <div key={show.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 transition-colors flex justify-between items-start gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <h5 className="font-bold text-sm text-zinc-100 leading-snug break-words flex-1">{show.nombre}</h5>
                    <span className="font-extrabold text-xs text-emerald-400 shrink-0 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md self-start">${show.precio.toLocaleString("es-MX")} MXN</span>
                  </div>
                  {show.descripcion && (<p className="text-xs text-zinc-400 leading-relaxed">{show.descripcion}</p>)}
                </div>
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button type="button" onClick={() => setEditingShow({ ...show })} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Editar espectáculo"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleDeleteShow(show.id)} className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer" title="Eliminar espectáculo"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Servicios Adicionales */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <h4 className="font-bold text-sm sm:text-base text-zinc-100 uppercase tracking-wider">Servicios Adicionales</h4>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">{additionalList.length}</span>
          </div>
          {!editingShow && !editingService && (
            <button type="button" onClick={() => setEditingService({ index: -1, nombre: "", precio: 0, descripcion: "", sinPrecioFijo: false, tipoCobro: 'evento' })} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm self-start sm:self-auto">
              <Plus className="w-3.5 h-3.5" /> Agregar Servicio
            </button>
          )}
        </div>
        {additionalList.length === 0 ? (<p className="text-xs text-zinc-500 italic py-4">No hay servicios adicionales registrados.</p>) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {additionalList.map((service, idx) => { const inferredTipo = service.tipoCobro || (service.sinPrecioFijo || service.precio === 0 ? 'cotizacion' : ((service.nombre.toLowerCase().includes('p/p') || service.nombre.toLowerCase().includes('persona') || (service.descripcion || '').toLowerCase().includes('p/p') || (service.descripcion || '').toLowerCase().includes('persona')) ? 'persona' : 'evento')); return (
              <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 transition-colors flex justify-between items-start gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <h5 className="font-bold text-sm text-zinc-100 leading-snug break-words flex-1">{service.nombre}</h5>
                    {service.sinPrecioFijo || service.precio === 0 ? (<span className="font-bold text-xs text-amber-300 shrink-0 bg-amber-950/70 border border-amber-500/40 px-2.5 py-1 rounded-md self-start">Sin precio fijo</span>) : (<span className="font-extrabold text-xs text-emerald-400 shrink-0 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md self-start">${service.precio.toLocaleString("es-MX")} MXN</span>)}
                  </div>
                  {service.descripcion && (<p className="text-xs text-zinc-400 leading-relaxed">{service.descripcion}</p>)}
                  <div className="pt-1">
                    {inferredTipo === 'persona' ? (<span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1"><Users className="w-3 h-3 text-emerald-400" />Por Persona</span>) : inferredTipo === 'cotizacion' ? (<span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1"><FileText className="w-3 h-3 text-amber-400" />Cotización</span>) : (<span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-400" />Por Evento</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button type="button" onClick={() => setEditingService({ index: idx, ...service, tipoCobro: inferredTipo })} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer" title="Editar servicio"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleDeleteService(idx)} className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer" title="Eliminar servicio"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ); })}
          </div>
        )}
      </div>

      {/* MODAL EDITING SHOW */}
      {editingShow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h4 className="font-bold text-base text-zinc-100">{showsList.some(s => s.id === editingShow.id) ? "Editar Espectáculo Infantil" : "Agregar Nuevo Espectáculo"}</h4>
              <button type="button" onClick={() => setEditingShow(null)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveShowItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre del Show / Espectáculo</label>
                <input
                  type="text"
                  required
                  value={editingShow.nombre}
                  onChange={(e) => setEditingShow({ ...editingShow, nombre: e.target.value })}
                  placeholder="Ej. Show de Superhéroes, Gran Show Mágico..."
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none transition-colors ${
                    isDuplicateShowName
                      ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500"
                  }`}
                />
                <AnimatePresence>
                {(editingShow.nombre || '').length > 30 && (
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
                  {isDuplicateShowName && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> Este show ya existe
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio ($ MXN)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="10000"
                  value={editingShow.precio || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, precio: parseInt(e.target.value) || 0 })}
                  placeholder="Ej. 1800"
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs font-bold transition-colors focus:outline-none ${
                    (editingShow.precio || 0) > 10000 || (editingShow.precio || 0) < 0
                      ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                      : "bg-zinc-800 border-zinc-700 text-emerald-400 placeholder-zinc-500 focus:border-emerald-500"
                  }`}
                />
                <AnimatePresence>
                  {((editingShow.precio || 0) > 10000 || (editingShow.precio || 0) < 0) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> Error: El precio excede el límite máximo permitido de $10,000 MXN.
                    </motion.p>
                  )}
                </AnimatePresence>
                
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción Breve</label>
                <textarea rows={3} value={editingShow.descripcion || ''} onChange={(e) => setEditingShow({ ...editingShow, descripcion: e.target.value })} placeholder="Ej. Incluye animación interactiva, personajes caracterizados y regalos para el festejado." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500" />
                
                <AnimatePresence>
                  {(editingShow.descripcion || '').length > 300 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> La descripción no puede exceder los 300 caracteres.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Galería</label>
                <p className="text-[11px] text-zinc-400 mb-2">Sube imágenes y videos para mostrar en la galería interactiva del show.</p>
                {(editingShow.fotos || []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(editingShow.fotos || []).map((foto, idx) => { const isVideo = foto.match(/\.(mp4|webm|ogg|mov)$/i) || foto.includes('data:video'); return (<div key={idx} className="relative group border border-zinc-700 rounded-xl overflow-hidden h-20 bg-zinc-950 flex items-center justify-center">{isVideo ? (<video src={foto} className="w-full h-full object-cover" muted />) : (<img src={foto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />)}<button type="button" onClick={() => { setEditingShow({ ...editingShow, fotos: (editingShow.fotos || []).filter((_, i) => i !== idx) }); }} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md cursor-pointer z-10" title="Eliminar elemento"><X className="w-3 h-3" /></button></div>); })}
                  </div>
                )}
                <MediaUploader accept="image/*,video/*" label="Subir Foto o Video" onUploadSuccess={(url) => { setEditingShow({ ...editingShow, fotos: [...(editingShow.fotos || []), url] }); }} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingShow(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer">Cancelar</button>
                <button
                  type="submit"
                  disabled={isDuplicateShowName || (editingShow.precio || 0) > 10000 || (editingShow.precio || 0) < 0 || (editingShow.nombre || '').length > 30 || (editingShow.descripcion || '').length > 150}
                  className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                    isDuplicateShowName || (editingShow.precio || 0) > 10000 || (editingShow.precio || 0) < 0 || (editingShow.nombre || '').length > 30 || (editingShow.descripcion || '').length > 150
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed border border-zinc-600"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  }`}
                >
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITING SERVICE */}
      {editingService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h4 className="font-bold text-base text-zinc-100">{editingService.index !== undefined && editingService.index >= 0 ? "Editar Servicio Adicional" : "Agregar Nuevo Servicio Adicional"}</h4>
              <button type="button" onClick={() => setEditingService(null)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveServiceItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  value={editingService.nombre}
                  onChange={(e) => setEditingService({ ...editingService, nombre: e.target.value })}
                  placeholder="Ej. Inflable gigante, Máquina de palomitas, Iluminación LED..."
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none transition-colors ${
                    isDuplicateServiceName
                      ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500"
                  }`}
                />
                <AnimatePresence>
                {(editingService.nombre || '').length > 30 && (
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
                  {isDuplicateServiceName && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> Este servicio ya existe
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Categoría / Tipo de Servicio</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setEditingService({ ...editingService, tipoCobro: 'evento', sinPrecioFijo: false })} className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${(editingService.tipoCobro || 'evento') === 'evento' && !editingService.sinPrecioFijo ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-750'}`}><Calendar className="w-4 h-4 text-emerald-400" /><span>Por Evento</span></button>
                  <button type="button" onClick={() => setEditingService({ ...editingService, tipoCobro: 'persona', sinPrecioFijo: false })} className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${editingService.tipoCobro === 'persona' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-750'}`}><Users className="w-4 h-4 text-emerald-400" /><span>Por Persona</span></button>
                  <button type="button" onClick={() => setEditingService({ ...editingService, tipoCobro: 'cotizacion', sinPrecioFijo: true, precio: 0 })} className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${editingService.tipoCobro === 'cotizacion' || editingService.sinPrecioFijo ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-sm' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-750'}`}><FileText className="w-4 h-4 text-amber-400" /><span>Cotización</span></button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio ($ MXN)</label>
                <input
                  type="number"
                  disabled={editingService.tipoCobro === 'cotizacion' || !!editingService.sinPrecioFijo}
                  required={editingService.tipoCobro !== 'cotizacion' && !editingService.sinPrecioFijo}
                  min="0"
                  max="10000"
                  value={(editingService.tipoCobro === 'cotizacion' || editingService.sinPrecioFijo) ? '' : (editingService.precio || '')}
                  onChange={(e) => setEditingService({ ...editingService, precio: parseInt(e.target.value) || 0 })}
                  placeholder={(editingService.tipoCobro === 'cotizacion' || editingService.sinPrecioFijo) ? "A cotizar (sin precio fijo)" : "Ej. 1200"}
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    (editingService.tipoCobro === 'cotizacion' || editingService.sinPrecioFijo)
                      ? "bg-zinc-800/40 border-zinc-800 text-amber-300/80 cursor-not-allowed placeholder-amber-300/70"
                      : (editingService.precio || 0) > 10000 || (editingService.precio || 0) < 0
                      ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                      : "bg-zinc-800 border-zinc-700 text-emerald-400 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  }`}
                />
                <AnimatePresence>
                  {((editingService.tipoCobro !== 'cotizacion' && !editingService.sinPrecioFijo) && ((editingService.precio || 0) > 10000 || (editingService.precio || 0) < 0)) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      <span>⚠️</span> Error: El precio excede el límite máximo permitido de $10,000 MXN.
                    </motion.p>
                  )}
                </AnimatePresence>
                
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción / Detalles (Opcional)</label>
                   <textarea rows={3} value={editingService.descripcion || ''} onChange={(e) => setEditingService({ ...editingService, descripcion: e.target.value })} placeholder="Ej. Servicio por 4 horas continuas con operador incluido." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500" />
               
               <AnimatePresence>
                 {(editingService.descripcion || '').length > 300 && (
                   <motion.p
                     initial={{ opacity: 0, y: -4 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -4 }}
                     className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm"
                   >
                     <span>⚠️</span> La descripción no puede exceder los 300 caracteres.
                   </motion.p>
                 )}
               </AnimatePresence>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingService(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer">Cancelar</button>
                 <button
                   type="submit"
                   disabled={isDuplicateServiceName || ((editingService.tipoCobro !== 'cotizacion' && !editingService.sinPrecioFijo) && ((editingService.precio || 0) > 10000 || (editingService.precio || 0) < 0)) || (editingService.nombre || '').length > 30 || (editingService.descripcion || '').length > 300}
                  className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                    isDuplicateServiceName || ((editingService.tipoCobro !== 'cotizacion' && !editingService.sinPrecioFijo) && ((editingService.precio || 0) > 10000 || (editingService.precio || 0) < 0)) || (editingService.nombre || '').length > 30 || (editingService.descripcion || '').length > 150
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed border border-zinc-600"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  }`}
                >
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
