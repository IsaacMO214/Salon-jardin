import { useState, useEffect } from "react";
import { AppData } from "./types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Nosotros from "./components/Nosotros";
import Eventos from "./components/Eventos";
import Paquetes from "./components/Paquetes";
import Menus from "./components/Menus";
import ShowsServicios from "./components/ShowsServicios";
import GaleriaTestimonios from "./components/GaleriaTestimonios";
import ReglamentoContacto from "./components/ReglamentoContacto";
import AdminPanel from "./components/AdminPanel";
import WhatsAppWidget from "./components/WhatsAppWidget";
import { Phone, ArrowUp, Facebook, Instagram } from "lucide-react";

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdmin, setIsAdmin] = useState(false);

  // Derived view state based on current URL path
  const view = currentPath.startsWith("/admin") ? "admin" : "public";

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  const setView = (v: "public" | "admin") => {
    if (v === "public") {
      handleLogout();
    } else {
      navigateTo("/admin");
    }
  };

  // Fetch all initial data
  const loadData = async () => {
    try {
      const res = await fetch("/api/data");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error loading application data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (!currentPath.startsWith("/admin")) {
      localStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_token");
      setIsAdmin(false);
    }
  }, [currentPath]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_token");
    setIsAdmin(false);
    navigateTo("/");
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAF9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Cargando Jardín Fantasy...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F9FAF9] flex items-center justify-center text-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 max-w-sm w-full">
          <h2 className="text-xl font-light text-slate-800 mb-2">Error de Conexión</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">No se pudo cargar la base de datos de Jardín Fantasy.</p>
          <button 
            onClick={loadData}
            className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const mainPhone = data.nosotros.telefonos[0] || "55 3607 3700";

  if (view === "admin") {
    return <AdminPanel data={data} onRefresh={loadData} />;
  }

  return (
    <div className="min-h-screen text-slate-850 flex flex-col justify-between">
      {/* 1. Shared Navigation Header */}
      <Navbar
        currentView={view}
        setView={setView}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        telefonos={data.nosotros.telefonos}
      />

      {/* 2. Content Views */}
      <main className="grow">
        {/* Public Landing Sections */}
        <Hero
          slogan={data.banner?.slogan || data.nosotros.slogan}
          imagenUrl={data.banner?.imagenUrl}
          imagenesUrl={data.banner?.imagenesUrl}
        />
        <Nosotros nosotros={data.nosotros} />
        <Eventos eventos={data.eventos} />
        <Paquetes
          paquetesSociales={data.paquetes_sociales}
          paquetesInfantiles={data.paquetes_infantiles}
          shows={data.shows}
          serviciosAdicionales={data.servicios_adicionales}
          menus={data.menus}
          telefonos={data.nosotros.telefonos}
        />
        <Menus menus={data.menus} />
        <ShowsServicios shows={data.shows} serviciosAdicionales={data.servicios_adicionales} />
        <GaleriaTestimonios galeria={data.galeria} testimonios={data.testimonios} />
        <ReglamentoContacto
          reglamento={data.reglamento}
          direccion={data.nosotros.direccion}
          telefonos={data.nosotros.telefonos}
          redesSociales={data.redesSociales}
        />
      </main>

      {/* 3. Clean Minimalist Footer */}
      <footer className="bg-forest-950 border-t border-forest-900/60 py-12 text-zinc-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3">
              <img src="/uploads/logo-fantasy.png" alt="Logo Operadora Fantasy" className="w-11 h-11 object-contain rounded-lg" />
              <span className="font-semibold text-lg tracking-tight text-white uppercase">Operadora Fantasy</span>
            </div>
            <p className="text-xs text-forest-200/70 mt-3.5 leading-relaxed max-w-sm">
              Dedicados a cuidar cada detalle en tus eventos familiares y sociales de principio a fin, creando experiencias mágicas e inolvidables.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-widest mb-4">Secciones Rápidas</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-forest-200/70">
              <a href="#nosotros" onClick={() => setView('public')} className="hover:text-white transition-colors">Nosotros</a>
              <a href="#eventos" onClick={() => setView('public')} className="hover:text-white transition-colors">Eventos</a>
              <a href="#paquetes" onClick={() => setView('public')} className="hover:text-white transition-colors">Paquetes</a>
              <a href="#menus" onClick={() => setView('public')} className="hover:text-white transition-colors">Menús</a>
              <a href="#contacto" onClick={() => setView('public')} className="hover:text-white transition-colors">Contacto</a>
              <button onClick={() => setView('admin')} className="text-left hover:text-white transition-colors cursor-pointer">Admin</button>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-widest mb-4">Contacto Directo & Redes</h4>
            <p className="text-xs text-forest-200/70 leading-relaxed mb-1">{data.nosotros.direccion}</p>
            <p className="text-xs text-emerald-400 font-semibold mb-3">Tel: {mainPhone}</p>
            
            <div className="flex items-center gap-3">
              {data.redesSociales?.facebook && (
                <a
                  href={data.redesSociales.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-forest-900/60 text-forest-200 hover:bg-emerald-600 hover:text-white transition-all border border-forest-800/40"
                  title="Facebook Jardín Fantasy"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {data.redesSociales?.instagram && (
                <a
                  href={data.redesSociales.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-forest-900/60 text-forest-200 hover:bg-emerald-600 hover:text-white transition-all border border-forest-800/40"
                  title="Instagram Fantasy Salón de Fiestas"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-12 pt-6 border-t border-forest-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-forest-300/50 uppercase tracking-widest relative">
          <p>© {new Date().getFullYear()} Operadora de Fiestas Fantasy. Todos los derechos reservados.</p>
          <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            <button 
              onClick={() => setView('admin')} 
              className="hover:text-emerald-400 transition-colors cursor-pointer font-bold"
            >
              Acceso Administrador
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Floating WhatsApp Help Button (Classic Mexican business feature) */}
      <WhatsAppWidget phone={mainPhone} />
    </div>
  );
}
