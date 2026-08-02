import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Sparkles, Share2, Phone, Trash2, Plus, Save, Instagram, Facebook } from "lucide-react";
import { AppData } from "../types";
import MediaUploader from "../components/ui/MediaUploader";

interface AdminBannerContactoProps {
  data: AppData;
  token: string;
  apiCall: (url: string, payload: any) => Promise<boolean>;
  showStatus: (msg: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onRequestConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

export default function AdminBannerContacto({
  data,
  token,
  apiCall,
  showStatus,
  onRefresh,
  isLoading,
  setIsLoading,
  onRequestConfirmation
}: AdminBannerContactoProps) {
  const [bannerForm, setBannerForm] = useState<{
    imagenesUrl: string[];
    slogan: string;
  }>({
    imagenesUrl: data.banner?.imagenesUrl?.length
      ? [...data.banner.imagenesUrl]
      : (data.banner?.imagenUrl ? [data.banner.imagenUrl] : [
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1600",
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600",
          "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1600",
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1600",
          "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1600"
        ]),
    slogan: data.banner?.slogan || data.nosotros?.slogan || "Una fiesta mágica, única e inolvidable"
  });

  const [redesForm, setRedesForm] = useState({
    instagram: data.redesSociales?.instagram || "https://www.instagram.com/fantasysalonde_fiestas/",
    facebook: data.redesSociales?.facebook || "https://www.facebook.com/Fantasysalonjardin",
    whatsapp: data.redesSociales?.whatsapp || (data.nosotros?.telefonos?.[0] || "55 3607 3700")
  });

  const [telefonosList, setTelefonosList] = useState<string[]>(
    data.nosotros?.telefonos?.length ? [...data.nosotros.telefonos] : ["55 3607 3700", "56 3047 9364", "55 5102 5998"]
  );

  const [newPhoneInput, setNewPhoneInput] = useState("");

  useEffect(() => {
    if (data) {
      const imgs = data.banner?.imagenesUrl?.length
        ? [...data.banner.imagenesUrl]
        : (data.banner?.imagenUrl ? [data.banner.imagenUrl] : [
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1600",
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600",
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1600",
            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1600",
            "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1600"
          ]);
      setBannerForm({
        imagenesUrl: imgs,
        slogan: data.banner?.slogan || data.nosotros?.slogan || "Una fiesta mágica, única e inolvidable"
      });
      setRedesForm({
        instagram: data.redesSociales?.instagram || "https://www.instagram.com/fantasysalonde_fiestas/",
        facebook: data.redesSociales?.facebook || "https://www.facebook.com/Fantasysalonjardin",
        whatsapp: data.redesSociales?.whatsapp || (data.nosotros?.telefonos?.[0] || "55 3607 3700")
      });
      if (data.nosotros?.telefonos) {
        setTelefonosList([...data.nosotros.telefonos]);
      }
    }
  }, [data]);

  const handleSaveBannerContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bannerForm.slogan && bannerForm.slogan.length > 50) {
      showStatus("Error: El slogan no puede exceder los 50 caracteres.");
      return;
    }
    setIsLoading(true);

    const payloadBanner = {
      imagenUrl: bannerForm.imagenesUrl[0] || "",
      imagenesUrl: bannerForm.imagenesUrl,
      slogan: bannerForm.slogan
    };

    const okBanner = await apiCall("/api/admin/save-section", {
      section: "banner",
      data: payloadBanner
    });

    const okRedes = await apiCall("/api/admin/save-section", {
      section: "redesSociales",
      data: redesForm
    });

    const updatedNosotros = {
      ...data.nosotros,
      slogan: bannerForm.slogan,
      telefonos: telefonosList
    };

    const okNosotros = await apiCall("/api/admin/save-section", {
      section: "nosotros",
      data: updatedNosotros
    });

    setIsLoading(false);

    if (okBanner && okRedes && okNosotros) {
      showStatus("Banner (5 imágenes), Slogan, Redes Sociales y Números de Contacto guardados exitosamente.");
      onRefresh();
    }
  };

  return (
    <form onSubmit={handleSaveBannerContacto} className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-zinc-800 gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-fantasy-purple-400" />
            <span>Banner, Slogan, Redes Sociales y Teléfonos</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Gestiona la imagen principal del inicio, la frase del slogan, los enlaces directos a tus redes sociales y tus números de contacto.
          </p>
        </div>

      </div>

      {/* Section 1: Hero Banner & Slogan */}
      <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800 pb-4">
          <div>
            <h4 className="text-sm font-bold text-fantasy-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fantasy-purple-400" />
              Carrusel de Banner (5 Imágenes) & Slogan
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Sube directamente las fotos de tu salón. Cambiarán automáticamente cada 10 segundos en la página de inicio.
            </p>
          </div>
          <span className="text-[10px] font-bold text-fantasy-purple-400 bg-fantasy-purple-950/80 border border-fantasy-purple-500/30 px-3 py-1 rounded-full">
            {bannerForm.imagenesUrl.length} / 5 Imágenes
          </span>
        </div>

        {/* Slogan */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
            Slogan Principal (Frase de Bienvenida)
          </label>
          <input
            type="text"
            required
            value={bannerForm.slogan}
            onChange={(e) => setBannerForm({ ...bannerForm, slogan: e.target.value })}
            placeholder="Ej: Una fiesta mágica, única e inolvidable"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-fantasy-purple-500 font-medium"
          />
              {bannerForm.slogan.length > 50 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> El slogan no puede exceder los 50 caracteres.
                </p>
              )}
        </div>

        {/* 5 Banner Images Upload Slots (Subida Directa) */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-fantasy-purple-400 uppercase tracking-wider">
            FOTOS DEL CARRUSEL DE BANNER (SUBIDA DIRECTA)
          </label>

          {/* List of current banner images */}
          {bannerForm.imagenesUrl.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {bannerForm.imagenesUrl.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl overflow-hidden border border-zinc-800 aspect-video w-48 sm:w-56 bg-zinc-950 shadow-md group"
                >
                  <img
                    src={imgUrl}
                    alt={`Banner ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5 items-center">
                    <span className="bg-black/60 backdrop-blur-xs text-[9px] text-white px-2 py-0.5 rounded-full font-bold select-none">
                      {idx + 1} {idx === 0 ? "★" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onRequestConfirmation(
                          "Eliminar Imagen del Banner",
                          "¿Seguro que deseas eliminar esta imagen de la galería del banner?",
                          () => {
                            const updated = bannerForm.imagenesUrl.filter((_, i) => i !== idx);
                            setBannerForm({ ...bannerForm, imagenesUrl: updated });
                          }
                        );
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-lg transition-all cursor-pointer shadow-md"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dropzone for adding new image if fewer than 5 */}
          {bannerForm.imagenesUrl.length < 5 ? (
            <MediaUploader
              token={token}
              mode="dropzone"
              accept="image/*"
              label="Subir nueva foto para el carrusel de banner"
              onUploadSuccess={(url) => {
                setBannerForm({
                  ...bannerForm,
                  imagenesUrl: [...bannerForm.imagenesUrl, url]
                });
              }}
            />
          ) : (
            <div className="border border-dashed border-zinc-800 rounded-xl p-4 bg-zinc-950/20 text-center text-[11px] text-zinc-500 font-medium">
              ℹ️ Has alcanzado el límite máximo de 5 imágenes para el banner. Elimina alguna para subir otra.
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Redes Sociales */}
      <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <h4 className="text-sm font-bold text-fantasy-purple-400 uppercase tracking-wider flex items-center gap-2">
          <Share2 className="w-4 h-4 text-fantasy-purple-400" />
          Redes Sociales
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instagram */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="p-1 rounded bg-pink-950 text-pink-400 border border-pink-500/30">
                <Instagram className="w-3.5 h-3.5" />
              </span>
              Instagram
            </label>
            <input
              type="url"
              value={redesForm.instagram}
              onChange={(e) => setRedesForm({ ...redesForm, instagram: e.target.value })}
              placeholder="https://www.instagram.com/fantasysalonde_fiestas/"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-fantasy-purple-500 font-medium"
            />
            {redesForm.instagram.length > 200 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> El enlace no puede exceder los 200 caracteres.
                </p>
              )}
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="p-1 rounded bg-fantasy-purple-950 text-fantasy-purple-400 border border-fantasy-purple-500/30">
                <Facebook className="w-3.5 h-3.5" />
              </span>
              Facebook
            </label>
            <input
              type="url"
              value={redesForm.facebook}
              onChange={(e) => setRedesForm({ ...redesForm, facebook: e.target.value })}
              placeholder="https://www.facebook.com/Fantasysalonjardin"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-fantasy-purple-500 font-medium"
            />
            {redesForm.facebook.length > 200 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> El enlace no puede exceder los 200 caracteres.
                </p>
              )}
          </div>
        </div>
      </div>

      {/* Section 3: Números de Teléfono / WhatsApp */}
      <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <h4 className="text-sm font-bold text-fantasy-purple-400 uppercase tracking-wider flex items-center gap-2">
          <Phone className="w-4 h-4 text-fantasy-purple-400" />
          Números Telefónicos y WhatsApp de Atención
        </h4>

        <p className="text-xs text-zinc-400">
          Estos números se utilizan en el encabezado, tarjetas de contacto, llamadas directas y en el botón flotante de WhatsApp.
        </p>

        {/* List of current phone numbers */}
        <div className="space-y-3">
          {telefonosList.map((tel, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs font-bold text-fantasy-purple-400 bg-fantasy-purple-950/80 border border-fantasy-purple-500/30 px-3 py-2 rounded-xl shrink-0">
                Teléfono {idx + 1} {idx === 0 ? "(Principal/WhatsApp)" : ""}
              </span>
              <input
                type="text"
                pattern="[0-9]{10}"
                value={tel}
                onChange={(e) => {
                  const updated = [...telefonosList];
                  updated[idx] = e.target.value.replace(/\D/g, '');
                  setTelefonosList(updated);
                }}
                placeholder="Ej: 5536073700"
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-fantasy-purple-500 font-medium"
              />
              {telefonosList.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setTelefonosList(telefonosList.filter((_, i) => i !== idx));
                  }}
                  className="p-2.5 bg-zinc-900 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Eliminar teléfono"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add phone line */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              pattern="[0-9]{10}"
              value={newPhoneInput}
              onChange={(e) => setNewPhoneInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Añadir nuevo número (Ej: 5512345678)"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-fantasy-purple-500"
            />
            <button
              type="button"
              onClick={() => {
                if (newPhoneInput.trim().length === 10) {
                  setTelefonosList([...telefonosList, newPhoneInput.trim()]);
                  setNewPhoneInput("");
                } else {
                  alert("El teléfono debe tener exactamente 10 dígitos numéricos.");
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-fantasy-purple-950/80 border border-fantasy-purple-500/40 text-fantasy-purple-300 hover:bg-fantasy-purple-900/80 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Teléfono</span>
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 flex items-center gap-1">ℹ️ Exactamente 10 dígitos numéricos obligatorios (sin espacios ni guiones).</p>
        </div>
      </div>

      {/* Submit Button Bar */}
      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-fantasy-pink-600 hover:bg-fantasy-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-fantasy-purple-950/50 cursor-pointer transition-all"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
