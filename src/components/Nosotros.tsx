import { History, Award, Users, Sparkles } from "lucide-react";
import { Nosotros as NosotrosType } from "../types";
import { motion } from "motion/react";

interface NosotrosProps {
  nosotros: NosotrosType;
}

export default function Nosotros({ nosotros }: NosotrosProps) {
  const stats = [
    {
      icon: <Award className="w-5 h-5 text-fantasy-purple-600" />,
      number: "+25",
      label: "Años de experiencia",
    },
    {
      icon: <Users className="w-5 h-5 text-fantasy-purple-600" />,
      number: "+10,000",
      label: "Eventos realizados",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-fantasy-purple-600" />,
      number: "Muchos",
      label: "Sueños realizados",
    }
  ];

  return (
    <section id="nosotros" className="py-16 doodle-leaves-bg scroll-mt-10 border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fantasy-purple-100/80 text-fantasy-purple-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            ¿Quiénes Somos?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fantasy-purple-900">
            Nosotros
          </h2>
          <div className="w-16 h-0.5 bg-fantasy-purple-500 mx-auto mt-3 mb-3 rounded-full" />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: History Card */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-white/80 backdrop-blur-xs rounded-xl border border-fantasy-purple-100/40 p-6 sm:p-8 shadow-xs hover:border-fantasy-purple-200/60 transition-all duration-350">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-fantasy-purple-50 text-fantasy-purple-600 p-2 rounded-lg">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Nuestra Historia</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {nosotros.descripcion}
            </p>
          </div>

          {/* Right: Interactive Stats Grid */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs flex items-center gap-4 hover:border-fantasy-purple-100 hover:shadow-xs transition-all duration-350 cursor-default"
              >
                <div className="bg-fantasy-purple-50 p-2.5 rounded-lg text-fantasy-purple-600 shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-lg font-bold text-fantasy-purple-800 tracking-tight leading-none mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}


