import React, { useState, useRef } from "react";
import { Upload, Loader2, FileImage, FileVideo } from "lucide-react";

interface MediaUploaderProps {
  onUploadSuccess: (url: string) => void;
  accept?: string;
  mode?: "button" | "dropzone" | "compact";
  label?: string;
  className?: string;
  token?: string;
}

export default function MediaUploader({
  onUploadSuccess,
  accept = "image/*",
  mode = "button",
  label = "Subir Archivo",
  className = "",
  token,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const activeToken = token || sessionStorage.getItem("admin_token") || localStorage.getItem("admin_token") || "";

    try {
      const response = await fetch(`/api/admin/upload?token=${encodeURIComponent(activeToken)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken}`
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.success) {
          onUploadSuccess(data.url);
        } else {
          setError(data.message || "Error al subir archivo");
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response from server:", text);
        // Look for error message inside the HTML if possible, or show status
        if (response.status === 413) {
          setError("El archivo es demasiado grande");
        } else if (response.status === 401) {
          setError("Sesión expirada o no autorizado");
        } else {
          setError(`Error en el servidor (${response.status}). ${text ? 'Respuesta no JSON.' : 'Respuesta vacía.'}`);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error de conexión al servidor");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Basic client-side validation
      const fileType = file.type;
      const isImage = fileType.startsWith("image/");
      const isVideo = fileType.startsWith("video/");

      if (accept.includes("image") && !isImage && !accept.includes("video")) {
        setError("Por favor sube solo imágenes");
        return;
      }
      if (accept.includes("video") && !isVideo && !accept.includes("image")) {
        setError("Por favor sube solo videos");
        return;
      }

      handleUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 1. Compact icon inside text input
  if (mode === "compact") {
    return (
      <div className={`absolute right-1 top-1/2 -translate-y-1/2 flex items-center ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={triggerFileInput}
          title={label}
          className="p-1.5 text-zinc-400 hover:text-fantasy-purple-400 hover:bg-zinc-800 rounded-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-fantasy-purple-400" />
          ) : accept.includes("video") ? (
            <FileVideo className="w-3.5 h-3.5" />
          ) : (
            <FileImage className="w-3.5 h-3.5" />
          )}
        </button>
        {error && (
          <div className="absolute bottom-full right-0 mb-1 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-50">
            {error}
          </div>
        )}
      </div>
    );
  }

  // 2. Beautiful Drag-and-Drop Dropzone
  if (mode === "dropzone") {
    return (
      <div className={`w-full ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[130px] ${
            isDragActive
              ? "border-fantasy-purple-500 bg-fantasy-purple-950/40 text-fantasy-purple-200"
              : "border-zinc-700/80 hover:border-fantasy-purple-500/60 bg-zinc-900/60 hover:bg-zinc-800/80"
          } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-fantasy-purple-400" />
              <p className="text-xs font-semibold text-zinc-300">Subiendo archivo...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="inline-flex p-2.5 bg-zinc-800 border border-zinc-700 rounded-full text-fantasy-purple-400 shadow-xs">
                <Upload className="w-5 h-5 text-fantasy-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-100">{label}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Arrastra y suelta un archivo aquí, o haz clic para explorar</p>
              </div>
              <span className="inline-block text-[9px] px-2 py-0.5 bg-fantasy-purple-950/60 text-fantasy-purple-400 border border-fantasy-purple-500/30 rounded font-semibold uppercase tracking-wider">
                {accept === "image/*" ? "Solo imágenes" : accept === "video/*" ? "Solo videos" : "Imágenes o Videos"}
              </span>
            </div>
          )}
        </div>
        {error && (
          <p className="text-[10px] text-red-400 font-semibold text-center mt-1.5 bg-red-950/50 border border-red-800/50 py-1 rounded-md">
            {error}
          </p>
        )}
      </div>
    );
  }

  // 3. Simple Button Mode
  return (
    <div className={`inline-block ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={triggerFileInput}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 hover:border-fantasy-purple-500/50 hover:bg-zinc-700 text-xs font-bold text-zinc-200 hover:text-fantasy-purple-300 rounded-lg shadow-xs cursor-pointer disabled:opacity-75 transition-all"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-fantasy-purple-400" />
            <span>Subiendo...</span>
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5 text-fantasy-purple-400" />
            <span>{label}</span>
          </>
        )}
      </button>
      {error && (
        <span className="text-[10px] text-red-400 font-semibold ml-2">
          {error}
        </span>
      )}
    </div>
  );
}
