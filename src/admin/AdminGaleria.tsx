import React, { useState } from "react";
import { Trash2, Image as ImageIcon, ArrowLeft, Home, Paintbrush, Baby } from "lucide-react";
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
  const [activeView, setActiveView] = useState<"menu" | "salon" | "decoracion" | "infantil">("menu");

  const handleDeleteGaleriaItem = (id: string) => {
    onRequestConfirmation("Eliminar de Galería", "¿Seguro que deseas eliminar este archivo de la galería?", async () => {
      await apiCall(`/api/admin/galeria/delete/${id}`, {});
    });
  };

  const currentItems = data.galeria.filter(g => g.categoria === activeView);

  return (
    <div className="space-y-6">
      {activeView === "menu" && (
        <div className="space-y-8">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <h3 className="text-xl font-bold text-zinc-100">Galería Fotográfica y Videos</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setActiveView("salon")}
              className="flex flex-col items-center justify-center gap-4 p-8 bg-zinc-800/40 border border-zinc-700 hover:border-fantasy-purple-500/50 hover:bg-zinc-800 rounded-3xl transition-all cursor-pointer group"
            >
              <div className="p-4 bg-zinc-800 group-hover:bg-fantasy-purple-950/50 border border-zinc-700 group-hover:border-fantasy-purple-500/30 rounded-2xl transition-colors">
                <Home className="w-10 h-10 text-fantasy-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-2 text-center">Administrar Fotos de Salón</h3>
              <p className="text-sm text-zinc-400 text-center max-w-[250px]">
                Fotos y videos de las instalaciones del salón jardín.
              </p>
            </button>
            <button
              onClick={() => setActiveView("decoracion")}
              className="flex flex-col items-center justify-center gap-4 p-8 bg-zinc-800/40 border border-zinc-700 hover:border-fantasy-pink-500/50 hover:bg-zinc-800 rounded-3xl transition-all cursor-pointer group"
            >
              <div className="p-4 bg-zinc-800 group-hover:bg-fantasy-pink-950/50 border border-zinc-700 group-hover:border-fantasy-pink-500/30 rounded-2xl transition-colors">
                <Paintbrush className="w-10 h-10 text-fantasy-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-2 text-center">Administrar Fotos de Decoración</h3>
              <p className="text-sm text-zinc-400 text-center max-w-[250px]">
                Montajes, arreglos florales, mesas y decoración general.
              </p>
            </button>
            <button
              onClick={() => setActiveView("infantil")}
              className="flex flex-col items-center justify-center gap-4 p-8 bg-zinc-800/40 border border-zinc-700 hover:border-fantasy-purple-500/50 hover:bg-zinc-800 rounded-3xl transition-all cursor-pointer group"
            >
              <div className="p-4 bg-zinc-800 group-hover:bg-fantasy-purple-950/50 border border-zinc-700 group-hover:border-fantasy-purple-500/30 rounded-2xl transition-colors">
                <Baby className="w-10 h-10 text-fantasy-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-2 text-center">Administrar Fotos de Área Infantil</h3>
              <p className="text-sm text-zinc-400 text-center max-w-[250px]">
                Juegos, inflables y espacios dedicados para los niños.
              </p>
            </button>
          </div>
        </div>
      )}

      {activeView !== "menu" && (
        <div className="space-y-6">
          <button 
            onClick={() => setActiveView("menu")}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al menú
          </button>

          <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
            <div className={`p-2 bg-fantasy-${activeView === 'decoracion' ? 'pink' : 'purple'}-950 border border-fantasy-${activeView === 'decoracion' ? 'pink' : 'purple'}-500/40 rounded-xl text-fantasy-${activeView === 'decoracion' ? 'pink' : 'purple'}-400`}>
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-100 capitalize">
                Galería de {activeView === 'salon' ? 'Salón' : activeView === 'decoracion' ? 'Decoración' : 'Área Infantil'}
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {currentItems.length} archivos en esta categoría
              </p>
            </div>
          </div>

          <div className="bg-zinc-800/40 border border-zinc-700/80 p-5 rounded-2xl space-y-4">
            <MediaUploader
              onUploadSuccess={async (url) => {
                const itemToAdd = { id: "gal-" + Date.now(), url, categoria: activeView };
                const ok = await apiCall("/api/admin/galeria/save", { item: itemToAdd });
                if (ok) {
                  showStatus("¡Archivo subido y agregado a la galería con éxito!");
                }
              }}
              accept="image/*,video/*"
              mode="dropzone"
              label={`Subir a Galería de ${activeView === 'salon' ? 'Salón' : activeView === 'decoracion' ? 'Decoración' : 'Área Infantil'}`}
              token={token}
            />
          </div>

          {currentItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
              {currentItems.map((g) => (
                <div key={g.id} className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-square">
                  {g.url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={g.url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={g.url} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteGaleriaItem(g.id)}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg cursor-pointer transform hover:scale-110 transition-all"
                      title="Eliminar de la galería"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic py-4 text-center">No hay fotos ni videos en esta categoría.</p>
          )}
        </div>
      )}
    </div>
  );
}
