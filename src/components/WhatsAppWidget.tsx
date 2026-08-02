import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Calendar, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WhatsAppWidgetProps {
  phone: string;
}

export default function WhatsAppWidget({ phone }: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanPhone = phone.replace(/\s+/g, "");

  const handleQuickAction = (text: string) => {
    const url = `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const url = `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(message.trim())}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setMessage("");
  };

  // Auto-focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-[360px] sm:w-[380px] bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="bg-fantasy-purple-700 p-5 text-white flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-xs border border-white/20 rounded-full flex items-center justify-center text-white">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-fantasy-pink-400 border-2 border-fantasy-purple-700 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white leading-tight">Jardín Fantasy</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-fantasy-pink-400 rounded-full" />
                    <span className="text-[10px] text-fantasy-pink-200 uppercase font-bold tracking-wider">Asesores en línea</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
                title="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 bg-slate-50 grow overflow-y-auto space-y-4 max-h-[300px] custom-scrollbar">
              {/* Automated Assistant Message */}
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-full bg-fantasy-purple-100 border border-fantasy-purple-200 text-fantasy-purple-700 font-bold flex items-center justify-center text-xs shrink-0 select-none">
                  F
                </div>
                <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs text-xs text-slate-700 leading-relaxed max-w-[85%]">
                  <p className="font-bold text-slate-900 mb-1">Asistente Fantasy</p>
                  ¡Hola! Bienvenido a Salón Jardín Fantasy. ¿Tienes alguna duda sobre nuestras instalaciones o quieres consultar disponibilidad de fecha para tu evento?
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="space-y-2 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selecciona una duda rápida:</p>
                
                <button
                  onClick={() => handleQuickAction("Hola, me gustaría cotizar una fiesta infantil en Salón Jardín Fantasy.")}
                  className="w-full flex items-center gap-3 bg-white hover:bg-fantasy-purple-50/50 border border-slate-200/80 hover:border-fantasy-purple-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 transition-all cursor-pointer text-left shadow-xs hover:shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-fantasy-pink-500 shrink-0" />
                  <span>Cotizar Fiesta Infantil</span>
                </button>

                <button
                  onClick={() => handleQuickAction("Hola, me gustaría cotizar un evento social en Salón Jardín Fantasy.")}
                  className="w-full flex items-center gap-3 bg-white hover:bg-fantasy-purple-50/50 border border-slate-200/80 hover:border-fantasy-purple-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 transition-all cursor-pointer text-left shadow-xs hover:shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-fantasy-purple-500 shrink-0" />
                  <span>Cotizar Evento Social</span>
                </button>

                <button
                  onClick={() => handleQuickAction("Hola, me gustaría consultar la disponibilidad de fechas para mi evento en Salón Jardín Fantasy.")}
                  className="w-full flex items-center gap-3 bg-white hover:bg-fantasy-purple-50/50 border border-slate-200/80 hover:border-fantasy-purple-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 transition-all cursor-pointer text-left shadow-xs hover:shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-fantasy-blue-500 shrink-0" />
                  <span>Consultar Disponibilidad</span>
                </button>

                <button
                  onClick={() => handleQuickAction("Hola, tengo algunas preguntas generales sobre el Salón Jardín Fantasy.")}
                  className="w-full flex items-center gap-3 bg-white hover:bg-fantasy-purple-50/50 border border-slate-200/80 hover:border-fantasy-purple-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 transition-all cursor-pointer text-left shadow-xs hover:shadow-sm"
                >
                  <HelpCircle className="w-4 h-4 text-fantasy-purple-400 shrink-0" />
                  <span>Preguntas Generales</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="grow bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-fantasy-purple-500 focus:bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className={`p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 ${
                  message.trim()
                    ? "bg-fantasy-purple-50 text-fantasy-purple-600 hover:bg-fantasy-purple-100 cursor-pointer"
                    : "bg-slate-50 text-slate-300 cursor-not-allowed"
                }`}
                title="Enviar mensaje"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? "bg-zinc-800 text-white hover:bg-zinc-900" : "bg-[#25D366] text-white hover:bg-[#20ba5a]"
        }`}
        title={isOpen ? "Cerrar chat" : "Contáctanos por WhatsApp"}
        id="floating-whatsapp-btn"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <svg viewBox="0 0 16 16" className="w-7 h-7 fill-current">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
        )}
      </button>
    </div>
  );
}
