import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  Package,
  Utensils,
  Music,
  Image as ImageIcon,
  Video,
  Settings,
  LogOut,
  Loader2
} from "lucide-react";
import { AppData } from "../types";
import { apiCall } from "../api/client";
import AdminLogin from "../admin/AdminLogin";
import AdminDashboard, { AdminTabType } from "../admin/AdminDashboard";
import AdminBannerContacto from "../admin/AdminBannerContacto";
import AdminEventos from "../admin/AdminEventos";
import AdminPaquetes from "../admin/AdminPaquetes";
import AdminMenus from "../admin/AdminMenus";
import AdminShows from "../admin/AdminShows";
import AdminGaleria from "../admin/AdminGaleria";
import AdminTestimonios from "../admin/AdminTestimonios";
import AdminPassword from "../admin/AdminPassword";
import ConfirmModal from "../admin/ConfirmModal";

export default function AdminPanel() {
  const [token, setToken] = useState<string>(() => {
    return sessionStorage.getItem("admin_token") || localStorage.getItem("admin_token") || "";
  });
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTabType>("inicio");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/data");
      const result = await res.json();
      if (result) {
        setData(result);
      }
    } catch (err) {
      console.error("Error al cargar datos en el panel:", err);
      showStatus("Error al cargar datos desde el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const handleApiCall = async (url: string, payload: any): Promise<boolean> => {
    return await apiCall(token, url, payload, {
      setIsLoading,
      showStatus,
      onRefresh: loadData
    });
  };

  const onRequestConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        onConfirm();
      }
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    localStorage.removeItem("admin_token");
    setToken("");
    setData(null);
  };

  if (!token) {
    return <AdminLogin onLoginSuccess={(newToken) => { setToken(newToken); loadData(); }} />;
  }

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-zinc-100 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-fantasy-purple-400" />
        <p className="text-xs font-semibold text-zinc-400">Cargando Panel Administrativo...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-zinc-100 p-4 space-y-4">
        <p className="text-sm font-bold text-red-400">No se pudieron cargar los datos del sistema.</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-fantasy-pink-600 hover:bg-fantasy-pink-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
        >
          Reintentar Carga
        </button>
      </div>
    );
  }

  const navItems = [
    { id: "inicio" as AdminTabType, label: "Inicio / Dashboard", icon: Sparkles },
    { id: "banner_contacto" as AdminTabType, label: "Banner & Contacto", icon: ImageIcon },
    { id: "eventos" as AdminTabType, label: "Eventos Especiales", icon: Calendar },
    { id: "paquetes" as AdminTabType, label: "Paquetes y Costos", icon: Package },
    { id: "menus" as AdminTabType, label: "Menús & Banquetes", icon: Utensils },
    { id: "shows" as AdminTabType, label: "Shows y Servicios", icon: Music },
    { id: "galeria" as AdminTabType, label: "Galería General", icon: ImageIcon },
    { id: "testimonios" as AdminTabType, label: "Testimonios Video", icon: Video },
    { id: "admin" as AdminTabType, label: "Contraseña", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fantasy-pink-600/20 border border-fantasy-purple-500/40 flex items-center justify-center text-fantasy-purple-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-zinc-100 tracking-tight leading-none">Jardín Fantasy</h1>
              <span className="text-[10px] font-bold text-fantasy-purple-400 uppercase tracking-widest block mt-1">Admin Panel</span>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-fantasy-pink-600 text-white shadow-md shadow-fantasy-purple-950/50 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-fantasy-purple-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-950/60 hover:bg-red-900/80 border border-red-800/40 text-red-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 py-4 px-6 flex justify-between items-center sticky top-0 z-30">
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              {navItems.find((n) => n.id === activeTab)?.label || "Panel"}
            </h2>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Gestión interactiva de contenidos en tiempo real
            </p>
          </div>


        </header>

        {/* Dynamic Tab Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl w-full mx-auto">
          {activeTab === "inicio" && <AdminDashboard data={data} setActiveTab={setActiveTab} />}
          {activeTab === "banner_contacto" && (
            <AdminBannerContacto
              data={data}
              token={token}
              apiCall={handleApiCall}
              showStatus={showStatus}
              onRefresh={loadData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onRequestConfirmation={onRequestConfirmation}
            />
          )}
          {activeTab === "eventos" && (
            <AdminEventos
              data={data}
              token={token}
              apiCall={handleApiCall}
              showStatus={showStatus}
              onRequestConfirmation={onRequestConfirmation}
            />
          )}
          {activeTab === "paquetes" && (
            <AdminPaquetes
              data={data}
              apiCall={handleApiCall}
              showStatus={showStatus}
              onRequestConfirmation={onRequestConfirmation}
            />
          )}
          {activeTab === "menus" && (
            <AdminMenus
              data={data}
              token={token}
              apiCall={handleApiCall}
              showStatus={showStatus}
              onRequestConfirmation={onRequestConfirmation}
            />
          )}
          {activeTab === "shows" && (
            <AdminShows
              data={data}
              token={token}
              apiCall={handleApiCall}
              showStatus={showStatus}
              onRequestConfirmation={onRequestConfirmation}
            />
          )}
          {activeTab === "galeria" && (
            <AdminGaleria
              data={data}
              token={token}
              apiCall={handleApiCall}
              showStatus={showStatus}
              onRequestConfirmation={onRequestConfirmation}
            />
          )}
          {activeTab === "testimonios" && (
            <AdminTestimonios
              data={data}
              token={token}
              apiCall={handleApiCall}
              showStatus={showStatus}
              onRequestConfirmation={onRequestConfirmation}
            />
          )}
          {activeTab === "admin" && <AdminPassword token={token} />}
        </div>
      </main>

      {/* Global Toast Status Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-fantasy-pink-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce font-bold text-xs">
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Global Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
