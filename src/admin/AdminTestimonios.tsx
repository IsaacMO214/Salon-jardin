import React, { useState } from "react";
import { Plus, X, Trash2, Edit2, Video } from "lucide-react";
import { AppData, Testimonio } from "../types";
import MediaUploader from "../components/ui/MediaUploader";

interface AdminTestimoniosProps {
  data: AppData;
  token: string;
  apiCall: (url: string, payload: any) => Promise<boolean>;
  showStatus: (msg: string) => void;
  onRequestConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

export default function AdminTestimonios({
  data,
  token,
  apiCall,
  showStatus,
  onRequestConfirmation
}: AdminTestimoniosProps) {
  const [editingTestimonio, setEditingTestimonio] = useState<Testimonio | null>(null);

  const handleSaveTestimonio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonio) return;
    const ok = await apiCall("/api/admin/testimonios/save", { testimonio: editingTestimonio });
    if (ok) setEditingTestimonio(null);
  };

  const handleDeleteTestimonio = (id: string) => {
    onRequestConfirmation("Eliminar Testimonio", "¿Seguro que deseas eliminar este testimonio?", async () => {
      await apiCall(`/api/admin/testimonios/delete/${id}`, {});
    });
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xl font-bold text-zinc-100">Testimonios en Video</h3>
          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">{data.testimonios?.length || 0}</span>
        </div>
        <button
          onClick={() => setEditingTestimonio({ id: "test-" + Date.now(), videoUrl: "" })}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Agregar Testimonio
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.testimonios?.map((test) => (
          <div key={test.id} className="rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="aspect-video bg-zinc-950 relative">
              {test.videoUrl ? (
                <video src={test.videoUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Video className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="p-3 bg-zinc-900/60 flex justify-end gap-1.5">
              <button
                onClick={() => setEditingTestimonio(test)}
                className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteTestimonio(test.id)}
                className="p-1.5 text-red-400 hover:bg-red-950/50 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDITING TESTIMONIO */}
      {editingTestimonio && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-700">
              <span className="font-bold text-base text-zinc-100">
                {data.testimonios?.some((t) => t.id === editingTestimonio.id) ? "Editar Testimonio" : "Subir Video de Testimonio"}
              </span>
              <button type="button" onClick={() => setEditingTestimonio(null)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveTestimonio} className="space-y-4">
              <MediaUploader
                onUploadSuccess={(url) => {
                  setEditingTestimonio({ ...editingTestimonio, videoUrl: url });
                  showStatus("¡Video subido con éxito!");
                }}
                accept="video/*"
                mode="dropzone"
                label="Subir video de testimonio (.mp4, .webm, .mov)"
                token={token}
              />
              <div className="text-right pt-4 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingTestimonio(null)}
                  className="px-4 py-2 border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 cursor-pointer"
                >
                  Guardar Testimonio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
