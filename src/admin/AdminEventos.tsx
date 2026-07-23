import React, { useState } from "react";
import {
  Plus, X, Trash2, Edit2,
  Heart, Crown, GraduationCap, Droplet, Gift, Sparkles, BookOpen,
  Cake, PartyPopper, Music, Users, Briefcase, Camera, Utensils, Wine, Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppData, Evento } from "../types";
import MediaUploader from "../components/ui/MediaUploader";

const AVAILABLE_ICONS = [
  { name: "Heart", label: "Corazón (Bodas)", icon: Heart },
  { name: "Crown", label: "Corona (XV Años)", icon: Crown },
  { name: "GraduationCap", label: "Birrete (Graduaciones)", icon: GraduationCap },
  { name: "Droplet", label: "Gota (Bautizos)", icon: Droplet },
  { name: "Gift", label: "Regalo (Baby Shower)", icon: Gift },
  { name: "Sparkles", label: "Destellos (Presentaciones)", icon: Sparkles },
  { name: "BookOpen", label: "Libro Abierto (Comuniones)", icon: BookOpen },
  { name: "Cake", label: "Pastel (Aniversarios)", icon: Cake },
  { name: "PartyPopper", label: "Confeti (Fiestas)", icon: PartyPopper },
  { name: "Music", label: "Música (Conciertos)", icon: Music },
  { name: "Users", label: "Grupos (Reuniones)", icon: Users },
  { name: "Briefcase", label: "Maletín (Empresariales)", icon: Briefcase },
  { name: "Camera", label: "Cámara (Sesiones)", icon: Camera },
  { name: "Utensils", label: "Cubiertos (Banquetes)", icon: Utensils },
  { name: "Wine", label: "Copa (Brindis)", icon: Wine },
  { name: "Star", label: "Estrella (Gala)", icon: Star }
];

interface AdminEventosProps {
  data: AppData;
  token: string;
  apiCall: (url: string, payload: any) => Promise<boolean>;
  showStatus: (msg: string) => void;
  onRequestConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

export default function AdminEventos({
  data,
  token,
  apiCall,
  showStatus,
  onRequestConfirmation
}: AdminEventosProps) {
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Check case-insensitive uniqueness (e.g. "Bodas" vs "bodas")
  const isDuplicateName = Boolean(
    editingEvent &&
      editingEvent.nombre.trim() !== "" &&
      data.eventos.some(
        (evt) =>
          evt.id !== editingEvent.id &&
          evt.nombre.trim().toLowerCase() === editingEvent.nombre.trim().toLowerCase()
      )
  );

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    if (isDuplicateName) {
      showStatus("Error: Este evento ya existe. Elige un nombre diferente.");
      return;
    }
    if (editingEvent.nombre && editingEvent.nombre.length > 30) {
      showStatus("Error: El nombre del evento excede el límite de 30 caracteres.");
      return;
    }
    if (editingEvent.descripcion && editingEvent.descripcion.length > 300) {
      showStatus("Error: La descripción excede el límite de 300 caracteres.");
      return;
    }
    const cleanedFotos = editingEvent.fotos.filter((f) => f && f.trim() !== "");
    const cleanedEvent = { ...editingEvent, fotos: cleanedFotos };
    const ok = await apiCall("/api/admin/eventos/save", { event: cleanedEvent });
    if (ok) {
      setEditingEvent(null);
      setShowIconPicker(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    onRequestConfirmation("Eliminar Evento", "¿Seguro que deseas eliminar este evento?", async () => {
      await apiCall(`/api/admin/eventos/delete/${id}`, {});
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
        <h3 className="text-xl font-bold text-zinc-100">
          Gestionar Eventos
        </h3>
        <button
          onClick={() => {
            setEditingEvent({ id: "new-evt-" + Date.now(), nombre: "", descripcion: "", icono: "Sparkles", fotos: [] });
            setShowIconPicker(false);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Agregar Evento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {data.eventos.map((evt) => {
          const iconObj = AVAILABLE_ICONS.find((i) => i.name === evt.icono) || AVAILABLE_ICONS[5];
          const IconComp = iconObj.icon;
          return (
            <div key={evt.id} className="flex justify-between items-center p-3.5 border border-zinc-800 bg-zinc-800/40 rounded-xl hover:bg-zinc-800/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-emerald-400 shrink-0">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-100">{evt.nombre}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Archivos: {evt.fotos?.filter(Boolean).length || 0} de 6 • Icono: {iconObj.label.split(" (")[0]} ({evt.icono})
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingEvent(evt)}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
                  title="Editar Evento"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="p-1.5 bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar Evento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL EDITING EVENT */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h4 className="font-bold text-base text-zinc-100">
                {data.eventos.some((e) => e.id === editingEvent.id) ? "Editar Evento" : "Agregar Nuevo Evento"}
              </h4>
              <button type="button" onClick={() => { setEditingEvent(null); setShowIconPicker(false); }} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.nombre}
                    onChange={(e) => setEditingEvent({ ...editingEvent, nombre: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none transition-colors ${
                      isDuplicateName
                        ? "bg-red-950/30 border-red-500 focus:border-red-400 text-red-200"
                        : "bg-zinc-800 border-zinc-700 focus:border-emerald-500"
                    }`}
                  />
                  <AnimatePresence>
                    {(editingEvent.nombre || '').length > 30 && (
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
                    {isDuplicateName && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1.5 rounded-lg shadow-sm"
                      >
                        <span>⚠️</span> Este evento ya existe
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Icono</label>
                  {(() => {
                    const currentObj = AVAILABLE_ICONS.find((i) => i.name === editingEvent.icono) || AVAILABLE_ICONS[5];
                    const IconComp = currentObj.icon;
                    return (
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowIconPicker(!showIconPicker)}
                          className="w-full flex items-center justify-between bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 font-medium transition-colors cursor-pointer shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-emerald-950 border border-emerald-500/40 rounded-lg text-emerald-400">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-zinc-200">{currentObj.label}</span>
                          </div>
                          <span className="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                            {showIconPicker ? "Cerrar menú ▴" : "Elegir icono ▾"}
                          </span>
                        </button>

                        <AnimatePresence>
                          {showIconPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.98 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-900 border border-emerald-500/50 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2 space-y-1"
                            >
                              <div className="flex justify-between items-center px-2 py-1 border-b border-zinc-800 mb-1">
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                  ✨ Catálogo de Iconos:
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setShowIconPicker(false)}
                                  className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {AVAILABLE_ICONS.map((item) => {
                                const ItemComp = item.icon;
                                const isSelected = editingEvent.icono === item.name;
                                return (
                                  <button
                                    type="button"
                                    key={item.name}
                                    onClick={() => {
                                      setEditingEvent({ ...editingEvent, icono: item.name });
                                      setShowIconPicker(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-left text-xs ${
                                      isSelected
                                        ? "bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-bold"
                                        : "bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium"
                                    }`}
                                    title={item.label}
                                  >
                                    <div className="flex items-center gap-3">
                                      <ItemComp className="w-4 h-4 text-emerald-400 shrink-0" />
                                      <span>{item.label}</span>
                                    </div>
                                    {isSelected && <span className="text-emerald-400 text-xs font-bold">✓</span>}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={editingEvent.descripcion}
                  onChange={(e) => setEditingEvent({ ...editingEvent, descripcion: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <AnimatePresence>
                  {(editingEvent.descripcion || '').length > 300 && (
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

              {/* Own Gallery Manager - 6 Media Slots: 3 Photos + 3 Videos */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
                    📸 3 Fotografías del Evento
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map((idx) => {
                      const fotoUrl = editingEvent.fotos[idx] || "";
                      return (
                        <div key={idx} className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-3 flex flex-col justify-between min-h-[160px] space-y-3 shadow-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Foto {idx + 1}</span>
                            {fotoUrl && (
                              <span className="text-[9px] text-emerald-300 font-semibold bg-emerald-950 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                Subida ✓
                              </span>
                            )}
                          </div>

                          {fotoUrl ? (
                            <div className="space-y-2 flex-1 flex flex-col justify-between">
                              <div className="relative group rounded-lg overflow-hidden border border-zinc-700 h-24">
                                {fotoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                  <video src={fotoUrl} className="w-full h-full object-cover" controls controlsList="nodownload" preload="metadata" />
                                ) : (
                                  <img
                                    src={fotoUrl}
                                    alt={`Foto ${idx + 1}`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onRequestConfirmation("Eliminar archivo", "¿Seguro que deseas eliminar este archivo?", () => {
                                        const newFotos = [...editingEvent.fotos];
                                        newFotos[idx] = "";
                                        setEditingEvent({ ...editingEvent, fotos: newFotos });
                                      });
                                    }}
                                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-transform scale-95 group-hover:scale-100 cursor-pointer"
                                    title="Eliminar Foto"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  onRequestConfirmation("Eliminar archivo", "¿Seguro que deseas eliminar este archivo?", () => {
                                    const newFotos = [...editingEvent.fotos];
                                    newFotos[idx] = "";
                                    setEditingEvent({ ...editingEvent, fotos: newFotos });
                                  });
                                }}
                                className="w-full inline-flex justify-center items-center gap-1 text-[10px] font-bold text-red-300 hover:text-red-200 bg-red-950/50 hover:bg-red-900/60 border border-red-800/40 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar foto
                              </button>
                            </div>
                          ) : (
                            <div className="grow flex items-center justify-center">
                              <MediaUploader
                                onUploadSuccess={(url) => {
                                  const newFotos = [...editingEvent.fotos];
                                  while (newFotos.length <= idx) {
                                    newFotos.push("");
                                  }
                                  newFotos[idx] = url;
                                  setEditingEvent({ ...editingEvent, fotos: newFotos });
                                  showStatus(`¡Foto ${idx + 1} subida con éxito!`);
                                }}
                                accept="image/*"
                                mode="dropzone"
                                label={`Subir Foto ${idx + 1}`}
                                className="w-full"
                                token={token}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5">
                    🎬 3 Videos del Evento
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[3, 4, 5].map((idx) => {
                      const videoNumber = idx - 2;
                      const fotoUrl = editingEvent.fotos[idx] || "";
                      return (
                        <div key={idx} className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-3 flex flex-col justify-between min-h-[160px] space-y-3 shadow-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Video {videoNumber}</span>
                            {fotoUrl && (
                              <span className="text-[9px] text-amber-300 font-semibold bg-amber-950 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                Subido ✓
                              </span>
                            )}
                          </div>

                          {fotoUrl ? (
                            <div className="space-y-2 flex-1 flex flex-col justify-between">
                              <div className="relative group rounded-lg overflow-hidden border border-zinc-700 h-24 bg-black">
                                {fotoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                  <video src={fotoUrl} className="w-full h-full object-cover" controls controlsList="nodownload" preload="metadata" />
                                ) : (
                                  <img
                                    src={fotoUrl}
                                    alt={`Video ${videoNumber}`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onRequestConfirmation("Eliminar archivo", "¿Seguro que deseas eliminar este archivo?", () => {
                                        const newFotos = [...editingEvent.fotos];
                                        newFotos[idx] = "";
                                        setEditingEvent({ ...editingEvent, fotos: newFotos });
                                      });
                                    }}
                                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-transform scale-95 group-hover:scale-100 cursor-pointer"
                                    title="Eliminar Video"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  onRequestConfirmation("Eliminar archivo", "¿Seguro que deseas eliminar este archivo?", () => {
                                    const newFotos = [...editingEvent.fotos];
                                    newFotos[idx] = "";
                                    setEditingEvent({ ...editingEvent, fotos: newFotos });
                                  });
                                }}
                                className="w-full inline-flex justify-center items-center gap-1 text-[10px] font-bold text-red-300 hover:text-red-200 bg-red-950/50 hover:bg-red-900/60 border border-red-800/40 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar video
                              </button>
                            </div>
                          ) : (
                            <div className="grow flex items-center justify-center">
                              <MediaUploader
                                onUploadSuccess={(url) => {
                                  const newFotos = [...editingEvent.fotos];
                                  while (newFotos.length <= idx) {
                                    newFotos.push("");
                                  }
                                  newFotos[idx] = url;
                                  setEditingEvent({ ...editingEvent, fotos: newFotos });
                                  showStatus(`¡Video ${videoNumber} subido con éxito!`);
                                }}
                                accept="video/*"
                                mode="dropzone"
                                label={`Subir Video ${videoNumber}`}
                                className="w-full"
                                token={token}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="text-right pt-4 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setEditingEvent(null); setShowIconPicker(false); }}
                  className="px-4 py-2 border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isDuplicateName || (editingEvent.nombre || '').length > 30 || (editingEvent.descripcion || '').length > 300}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isDuplicateName || (editingEvent.nombre || '').length > 30 || (editingEvent.descripcion || '').length > 300
                      ? "bg-zinc-700 text-zinc-400 border border-zinc-600 opacity-60 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 cursor-pointer"
                  }`}
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
