import React, { useState } from "react";
import { Trash2, Image as ImageIcon } from "lucide-react";
import { AppData } from "../types";
import MediaUploader from "../components/ui/MediaUploader";

interface AdminGaleriaProps {
  data: AppData;
  token: string;
  apiCall: (url: string, payload: any) => Promise<boolean>;
  showStatus: (msg: string) => void;
  onRequestConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

export default function AdminGaleria({
  data,
  token,
  apiCall,
  showStatus,
  onRequestConfirmation
}: AdminGaleriaProps) {
  const [newGalItem, setNewGalItem] = useState({ categoria: "salon", descripcion: "" });

  const handleDeleteGaleriaItem = (id: string) => {
    onRequestConfirmation("Eliminar de Galería", "¿Seguro que deseas eliminar este archivo de la galería?", async () => {
      await apiCall(`/api/admin/galeria/delete/${id}`, {});
    });
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
        <h3 className="text-xl font-bold text-zinc-100">Galería Fotográfica y Videos</h3>
      </div>

      {/* Upload directly to gallery */}
      <div className="bg-zinc-800/40 border border-zinc-700/80 p-5 rounded-2xl space-y-4">
        <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-widest">Subir Archivos Directamente a la Galería</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Categoría</label>
            <select
              value={newGalItem.categoria}
              onChange={(e) => setNewGalItem({ ...newGalItem, categoria: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="salon">El Salón</option>
              <option value="decoracion">Decoración</option>
              <option value="infantil">Área Infantil</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción Breve (Opcional)</label>
            <input
              type="text"
            value={newGalItem.descripcion}
              onChange={(e) => setNewGalItem({ ...newGalItem, descripcion: e.target.value })}
              placeholder="Ej. Montaje de mesa principal en tonos dorados..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
              {newGalItem.descripcion.length > 300 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> La descripción no puede exceder los 300 caracteres.
                </p>
              )}
          </div>
        </div>
        <MediaUploader
          onUploadSuccess={async (url) => {
            const itemToAdd = { id: "gal-" + Date.now(), url, categoria: newGalItem.categoria || "salon" };
            const ok = await apiCall("/api/admin/galeria/save", { item: itemToAdd });
            if (ok) {
              showStatus("¡Archivo subido y agregado a la galería con éxito!");
            }
          }}
          accept="image/*,video/*"
          mode="dropzone"
          label="Subir archivo directamente a la galería"
          token={token}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data.galeria.map((g) => (
          <div key={g.id} className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-video">
            {g.url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={g.url} className="w-full h-full object-cover" controls />
            ) : (
              <img src={g.url} alt="Galeria" className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDeleteGaleriaItem(g.id)}
                className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs p-1.5 text-[10px] text-zinc-300 font-medium truncate">
              Categoría: <span className="text-emerald-400 capitalize">{g.categoria}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
