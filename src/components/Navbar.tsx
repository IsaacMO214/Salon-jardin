import { Menu as MenuIcon, X, Lock, LogOut } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  currentView: 'public' | 'admin';
  setView: (view: 'public' | 'admin') => void;
  isAdmin: boolean;
  onLogout: () => void;
  telefonos: string[];
}

export default function Navbar({ currentView, setView, isAdmin, onLogout, telefonos }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Inicio", href: "#" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Eventos", href: "#eventos" },
    { label: "Paquetes", href: "#paquetes" },
    { label: "Menús", href: "#menus" },
    { label: "Shows y Extras", href: "#shows" },
    { label: "Galería", href: "#galeria" },
    { label: "Testimonios", href: "#testimonios" },
    { label: "Reglamento", href: "#reglamento" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-md border-b border-green-100/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between h-20 relative">
          {/* Logo */}
          <div className="flex items-center">
            <a 
              href="#" 
              onClick={() => setView('public')}
              className="flex flex-col items-start leading-none cursor-pointer group"
              id="navbar-logo"
            >
              <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide text-green-800 transition-colors group-hover:text-green-900">
                Fantasy
              </span>
              <span className="text-[7.5px] sm:text-[9px] font-bold text-slate-500 tracking-[0.25em] uppercase mt-0.5">
                SALÓN Y JARDÍN
              </span>
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-x-5 xl:space-x-6 w-max whitespace-nowrap">
            {currentView === 'public' ? (
              <>
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-[13px] font-semibold text-slate-700 hover:text-green-800 transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                ))}
              </>
            ) : (
              <>
                <span className="text-[10px] uppercase tracking-wider bg-green-50 text-green-800 px-3 py-1 rounded-full font-bold">
                  Panel de Control Activo
                </span>
                <button
                  onClick={() => setView('public')}
                  className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-green-700 transition-colors cursor-pointer"
                >
                  Ver Sitio Público
                </button>
                {isAdmin && (
                  <button
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-[11px] font-bold uppercase tracking-wider text-red-600 transition-all cursor-pointer"
                    id="logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Salir
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              aria-label="Menú principal"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 pt-2 pb-6 space-y-2">
          {currentView === 'public' ? (
            <>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-green-800 transition-all"
                >
                  {link.label}
                </a>
              ))}
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3">PANEL DE CONTROL</p>
              <button
                onClick={() => {
                  setView('public');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                Ver Sitio Público
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión Admin
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
