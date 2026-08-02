import React from "react";
import { Trash2, Video } from "lucide-react";
import { AppData } from "../types";
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

  const handleDeleteTestimonio = (id: string) => {
    onRequestConfirmation("Eliminar Testimonio", "¿Seguro que deseas eliminar este testimonio?", async () => {
      await apiCall(`/api/admin/testimonios/delete/${id}`, {});
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
        <h3 className="text-xl font-bold text-zinc-100">Testimonios en Video</h3>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          {data.testimonios?.length || 0} archivos subidos
        </p>
      </div>

      <div className="bg-zinc-800/40 border border-zinc-700/80 p-5 rounded-2xl space-y-4">
        <MediaUploader
          onUploadSuccess={async (url) => {
            const itemToAdd = { id: "test-" + Date.now(), videoUrl: url };
            const ok = await apiCall("/api/admin/testimonios/save", { testimonio: itemToAdd });
            if (ok) {
              showStatus("¡Video de testimonio subido con éxito!");
            }
          }}
          accept="video/*"
          mode="dropzone"
          label="Subir video de testimonio (.mp4, .webm, .mov)"
          token={token}
        />
      </div>

      {data.testimonios && data.testimonios.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
          {data.testimonios.map((test) => (
            <div key={test.id} className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-[9/16]">
              {test.videoUrl ? (
                <video src={test.videoUrl} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Video className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDeleteTestimonio(test.id)}
                  className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg cursor-pointer transform hover:scale-110 transition-all"
                  title="Eliminar testimonio"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 italic py-4 text-center">No hay testimonios en video.</p>
      )}
    </div>
  );
}
