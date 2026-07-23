import { Info, MapPin, Phone, ShieldAlert, Calendar, Ban, Baby, Clock, AlertTriangle, ShieldCheck, Instagram, Facebook } from "lucide-react";
import { Reglamento, RedesSociales } from "../types";

interface ReglamentoContactoProps {
  reglamento: Reglamento;
  direccion: string;
  telefonos: string[];
  redesSociales?: RedesSociales;
}

export default function ReglamentoContacto({ reglamento, direccion, telefonos, redesSociales }: ReglamentoContactoProps) {
  return (
    <section id="reglamento" className="py-24 doodle-leaves-bg scroll-mt-10 border-b border-slate-150 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* 1. Header with Badge, Title, and Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/60 border border-amber-200/40 text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-3 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Convivencia Segura y Armoniosa
          </div>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-green-900 font-serif mt-2">
            Reglamento y Políticas de Reservación
          </h2>
          <div className="w-16 h-0.5 bg-emerald-600 mx-auto mt-3 mb-3 rounded-full" />
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-lg mx-auto">
            Para garantizar la seguridad, diversión y el perfecto estado de nuestro jardín mágico, agradecemos el cumplimiento de las siguientes normas:
          </p>
        </div>

        {/* 2. Grid of 4 beautiful cards representing the rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Card 1: Apartado y Reserva */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-green-100/40 p-6 shadow-xs hover:border-green-300/60 transition-all duration-350">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Apartado y Reserva
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apartado de fecha con un pago inicial de ${reglamento.precioApartado?.toLocaleString("es-MX") || "2,500"} MXN.
            </p>
          </div>

          {/* Card 2: Artículos Prohibidos */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-green-100/40 p-6 shadow-xs hover:border-green-300/60 transition-all duration-350">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5">
              <Ban className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Artículos Prohibidos
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No se permite pirotecnia de cualquier tipo, espumas, confeti, espuma ni espantasuegras.
            </p>
          </div>

          {/* Card 3: Acceso Infantil */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-green-100/40 p-6 shadow-xs hover:border-green-300/60 transition-all duration-350">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
              <Baby className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Acceso Infantil
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Por seguridad e higiene, NO se permiten huevos de harina, confeti, espumas ni piñatas que contengan confeti.
            </p>
          </div>

          {/* Card 4: Puntualidad de Horario */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-green-100/40 p-6 shadow-xs hover:border-green-300/60 transition-all duration-350">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Puntualidad de Horario
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              El horario contratado es estricto; el desalojo del salón se realiza máximo 30 minutos después de terminado el evento.
            </p>
          </div>

        </div>

        {/* 3. Safety Warning Banner */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 backdrop-blur-xs flex gap-4 items-start text-left shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <span className="font-bold text-amber-800">Nota de Seguridad Infantil:</span> Está estrictamente prohibido el acceso o uso de pirotecnia de cualquier tipo dentro de las instalaciones del salón y jardín. Agradecemos su comprensión para proteger la integridad física de los más pequeños.
            </div>
          </div>
        </div>

        {/* 4. Contact and Map Section */}
        <div id="contacto" className="scroll-mt-24">
          
          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] tracking-wider uppercase font-bold text-green-700">¿Dónde Estamos?</span>
            <h2 className="text-3xl font-light tracking-tight text-slate-850 mt-2">
              Contáctanos y Ubicación
            </h2>
            <div className="w-12 h-[1px] bg-green-700/40 mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact details */}
            <div className="lg:col-span-5 flex flex-col justify-between h-[420px] bg-white/95 backdrop-blur-xs rounded-2xl border border-green-100/40 p-8 shadow-xs">
              <div className="space-y-6">
                <h3 className="text-xl font-light tracking-tight text-slate-850 font-serif border-b border-green-100/30 pb-3">
                  Medios Directos
                </h3>
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 text-green-700 p-3 rounded-full shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[10px] text-green-700 uppercase tracking-wider">Dirección</h4>
                    <p className="text-xs sm:text-sm text-slate-650 mt-1 leading-relaxed">{direccion}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-50 text-green-700 p-3 rounded-full shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[10px] text-green-700 uppercase tracking-wider">Teléfonos de Atención</h4>
                    <div className="space-y-1.5 mt-1">
                      {telefonos.map((tel) => (
                        <a
                          key={tel}
                          href={`tel:+52${tel.replace(/\s+/g, "")}`}
                          className="block text-xs sm:text-sm text-slate-700 hover:text-green-700 font-semibold transition-colors"
                        >
                          {tel}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Action CTA & Social Networks */}
              <div className="pt-4 border-t border-green-100/30 space-y-2.5">
                <a
                  href={`https://wa.me/52${telefonos[0]?.replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex justify-center items-center gap-2 py-3 px-6 rounded-full font-bold uppercase tracking-wider text-[10px] bg-green-700 hover:bg-green-800 text-white transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Chatear por WhatsApp
                </a>
              </div>
            </div>

            {/* Google Map Embed Column */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-150 overflow-hidden h-[420px] relative">
              <iframe
                title="Google Maps Location - Jardín Fantasy"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.5936714659974!2d-98.9950587258414!3d19.397576541571477!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1e2e92c69ba2d%3A0xe54d6fa0d912cdfa!2sCalle%20San%20Rafael%20254%2C%20Vicente%20Villada%2C%2057710%20Cd%20Nezahualc%C3%B3yotl%2C%20M%C3%A9x.!5e0!3m2!1ses-419!2smx!4v1711200000000!5m2!1ses-419!2smx"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                id="google-maps-iframe"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
