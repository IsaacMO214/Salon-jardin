import React, { useState } from "react";
import { Plus, Trash2, Edit3, AlertCircle, X } from "lucide-react";
import { MenuOptionItem, parseItemsToStructuredOptions, serializeStructuredOptions, getOptionSummaryText, getCourseLabel } from "../../utils/menuParser";

interface MenuCoursesEditorProps {
  items: string[];
  numTiempos: number;
  onChange: (newItems: string[]) => void;
  onRequestConfirmation: (title: string, msg: string, onConfirm: () => void) => void;
}

function createEmptyOption(numTiempos: number): MenuOptionItem {
  return {
    tiempos: Array.from({ length: numTiempos }, () => ({ nombre: "", descripcion: "" })),
    guarnicion: { nombre: "", descripcion: "" },
    tieneSalseado: false
  };
}

export default function MenuCoursesEditor({
  items,
  numTiempos,
  onChange,
  onRequestConfirmation
}: MenuCoursesEditorProps) {
  const [options, setOptions] = useState<MenuOptionItem[]>(() =>
    parseItemsToStructuredOptions(items, numTiempos)
  );
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newOptionData, setNewOptionData] = useState<MenuOptionItem>(createEmptyOption(numTiempos));
  const [addModalError, setAddModalError] = useState<string | null>(null);

  React.useEffect(() => {
    setOptions(parseItemsToStructuredOptions(items, numTiempos));
  }, [items.join("||"), numTiempos]);

  const updateOptions = (newOptions: MenuOptionItem[]) => {
    setOptions(newOptions);
    const serialized = serializeStructuredOptions(newOptions, numTiempos);
    onChange(serialized);
  };

  const handleFieldChange = (
    optIdx: number,
    field: 'tiempo' | 'guarnicion',
    subIdx: number | null,
    subField: 'nombre' | 'descripcion',
    val: string
  ) => {
    const updated = options.map((opt, i) => {
      if (i !== optIdx) return opt;
      const newOpt = { ...opt };
      if (field === 'tiempo' && subIdx !== null) {
        const tiempos = [...newOpt.tiempos];
        tiempos[subIdx] = { ...tiempos[subIdx], [subField]: val };
        newOpt.tiempos = tiempos;
      } else if (field === 'guarnicion') {
        newOpt.guarnicion = { ...newOpt.guarnicion, [subField]: val };
      }
      return newOpt;
    });
    updateOptions(updated);
  };

  const openAddModal = () => {
    setNewOptionData(createEmptyOption(numTiempos));
    setAddModalError(null);
    setShowAddModal(true);
  };

  const handleConfirmAddOption = () => {
    for (let i = 0; i < numTiempos; i++) {
      if (!newOptionData.tiempos[i]?.nombre.trim()) {
        setAddModalError(`Por favor ingresa el nombre del ${getCourseLabel(i)} Tiempo.`);
        return;
      }
    }
    if (!newOptionData.guarnicion.nombre.trim()) {
      setAddModalError("Por favor ingresa el nombre de la Guarnición.");
      return;
    }

    setAddModalError(null);
    const updated = [...options, newOptionData];
    updateOptions(updated);
    setShowAddModal(false);
    setExpandedIdx(updated.length - 1);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 1) {
      alert("Debe haber al menos 1 opción en el menú.");
      return;
    }
    onRequestConfirmation("Eliminar Opción", "¿Seguro que deseas eliminar esta opción del menú?", () => {
      const updated = options.filter((_, i) => i !== idx);
      updateOptions(updated);
      if (expandedIdx === idx) {
        setExpandedIdx(null);
      } else if (expandedIdx !== null && expandedIdx > idx) {
        setExpandedIdx(expandedIdx - 1);
      }
    });
  };

  const renderCourseFields = (opt: MenuOptionItem, optIdx: number) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {opt.tiempos.map((tiempo, tIdx) => (
          <div key={tIdx} className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-700/60 space-y-2">
            <span className="text-[10px] font-bold text-fantasy-purple-400 uppercase tracking-widest block">
              {getCourseLabel(tIdx)} Tiempo
            </span>
            <div>
              <label className="block text-[10px] text-zinc-400 mb-0.5">Nombre del Platillo</label>
              <input
                type="text"
                placeholder={`Ej. Plato principal ${tIdx + 1}`}
                value={tiempo.nombre}
                onChange={(e) => handleFieldChange(optIdx, 'tiempo', tIdx, 'nombre', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
              />
              {tiempo.nombre.length > 30 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> El nombre del {getCourseLabel(tIdx)} Tiempo no puede exceder los 30 caracteres.
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 mb-0.5">Descripción</label>
              <input
                type="text"
                placeholder="Ej. ingredientes y estilo de preparación"
                value={tiempo.descripcion}
                onChange={(e) => handleFieldChange(optIdx, 'tiempo', tIdx, 'descripcion', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
              />
              {tiempo.descripcion.length > 300 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> La descripción del {getCourseLabel(tIdx)} Tiempo no puede exceder los 300 caracteres.
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-700/60 space-y-2">
          <span className="text-[10px] font-bold text-fantasy-purple-400 uppercase tracking-widest block">
            Guarnición
          </span>
          <div>
            <label className="block text-[10px] text-zinc-400 mb-0.5">Nombre de la Guarnición</label>
            <input
              type="text"
              placeholder="Ej. Arroz blanco, Verduras salteadas"
              value={opt.guarnicion.nombre}
              onChange={(e) => handleFieldChange(optIdx, 'guarnicion', null, 'nombre', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
            />
            {opt.guarnicion.nombre.length > 30 && (
              <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                <span>⚠️</span> El nombre de la Guarnición no puede exceder los 30 caracteres.
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 mb-0.5">Descripción</label>
            <input
              type="text"
              placeholder="Ej. acompañamiento fresco de verduras"
              value={opt.guarnicion.descripcion}
              onChange={(e) => handleFieldChange(optIdx, 'guarnicion', null, 'descripcion', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
            />
            {opt.guarnicion.descripcion.length > 300 && (
              <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                <span>⚠️</span> La descripción de la Guarnición no puede exceder los 300 caracteres.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModalCourseFields = () => {
    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {Array.from({ length: numTiempos }, (_, tIdx) => (
          <div key={tIdx} className="bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-700/60 space-y-2">
            <span className="text-xs font-bold text-fantasy-purple-400 uppercase tracking-wider block">
              {getCourseLabel(tIdx)} Tiempo <span className="text-red-400">*</span>
            </span>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Nombre del Platillo</label>
              <input
                type="text"
                placeholder={`Ej. Plato ${tIdx + 1}`}
                value={newOptionData.tiempos[tIdx]?.nombre || ""}
                onChange={(e) => {
                  const tiempos = [...newOptionData.tiempos];
                  tiempos[tIdx] = { ...tiempos[tIdx], nombre: e.target.value };
                  setNewOptionData({ ...newOptionData, tiempos });
                }}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
              />
              {(newOptionData.tiempos[tIdx]?.nombre || "").length > 30 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> El nombre del {getCourseLabel(tIdx)} Tiempo no puede exceder los 30 caracteres.
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Descripción (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. ingredientes y preparación"
                value={newOptionData.tiempos[tIdx]?.descripcion || ""}
                onChange={(e) => {
                  const tiempos = [...newOptionData.tiempos];
                  tiempos[tIdx] = { ...tiempos[tIdx], descripcion: e.target.value };
                  setNewOptionData({ ...newOptionData, tiempos });
                }}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
              />
              {(newOptionData.tiempos[tIdx]?.descripcion || "").length > 300 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> La descripción del {getCourseLabel(tIdx)} Tiempo no puede exceder los 300 caracteres.
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-700/60 space-y-2">
          <span className="text-xs font-bold text-fantasy-purple-400 uppercase tracking-wider block">
            Guarnición <span className="text-red-400">*</span>
          </span>
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Nombre de la Guarnición</label>
            <input
              type="text"
              placeholder="Ej. Arroz blanco, Ensalada"
              value={newOptionData.guarnicion.nombre}
              onChange={(e) => setNewOptionData({
                ...newOptionData,
                guarnicion: { ...newOptionData.guarnicion, nombre: e.target.value }
              })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
            />
            {newOptionData.guarnicion.nombre.length > 30 && (
              <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                <span>⚠️</span> El nombre de la Guarnición no puede exceder los 30 caracteres.
              </p>
            )}
          </div>
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Descripción (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. arroz al vapor con verduras"
              value={newOptionData.guarnicion.descripcion}
              onChange={(e) => setNewOptionData({
                ...newOptionData,
                guarnicion: { ...newOptionData.guarnicion, descripcion: e.target.value }
              })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
            />
            {newOptionData.guarnicion.descripcion.length > 300 && (
              <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                <span>⚠️</span> La descripción de la Guarnición no puede exceder los 300 caracteres.
              </p>
            )}
          </div>
        </div>

        <div className="bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-700/60">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newOptionData.tieneSalseado || false}
              onChange={(e) => setNewOptionData({
                ...newOptionData,
                tieneSalseado: e.target.checked
              })}
              className="w-4 h-4 text-fantasy-purple-500 rounded border-zinc-600 focus:ring-fantasy-purple-500 bg-zinc-900 cursor-pointer"
            />
            <span className="text-xs font-semibold text-zinc-200">
              Incluir Salseado a elegir para esta opción
            </span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 bg-zinc-900/60 p-4 border border-zinc-800 rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-800">
        <div>
          <label className="block text-xs font-bold text-fantasy-purple-400 uppercase tracking-wider">
            Platillos del Menú ({numTiempos} Tiempos)
          </label>
          <p className="text-[11px] text-zinc-400">
            Haz clic en "Editar" para desplegar y modificar una opción. Usa "+ Agregar Opción" para abrir el formulario de nueva opción.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-fantasy-purple-950/90 border border-fantasy-purple-500/50 text-fantasy-purple-300 hover:bg-fantasy-purple-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar Opción
        </button>
      </div>

      <div className="space-y-3">
        {options.map((opt, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div
              key={idx}
              className={`bg-zinc-800/80 border rounded-xl transition-all duration-200 overflow-hidden ${
                isExpanded ? "border-fantasy-purple-500/60 ring-1 ring-fantasy-purple-500/30" : "border-zinc-700/80 hover:border-zinc-600"
              }`}
            >
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-fantasy-purple-400 bg-fantasy-purple-950/80 px-2 py-0.5 rounded border border-fantasy-purple-500/30">
                      Opción {idx + 1}
                    </span>
                    {opt.tieneSalseado && (
                      <span className="text-[10px] font-semibold text-fantasy-pink-300 bg-fantasy-pink-950/70 px-2 py-0.5 rounded border border-fantasy-pink-500/30">
                        Salseado incluido
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-200 font-medium truncate">
                    {getOptionSummaryText(opt, numTiempos)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className="px-3 py-1.5 bg-zinc-700/90 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-fantasy-purple-400" />
                    {isExpanded ? "Plegar" : "Editar"}
                  </button>
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-1.5 hover:bg-red-950/80 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      title="Eliminar Opción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-zinc-700/70 bg-zinc-900/70 space-y-4">
                  {renderCourseFields(opt, idx)}

                  <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={opt.tieneSalseado || false}
                        onChange={(e) => {
                          const updated = options.map((item, i) => {
                            if (i !== idx) return item;
                            return { ...item, tieneSalseado: e.target.checked };
                          });
                          updateOptions(updated);
                        }}
                        className="w-4 h-4 text-fantasy-purple-500 rounded border-zinc-600 focus:ring-fantasy-purple-500 bg-zinc-900 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-zinc-200">
                        Incluir Salseado a elegir para esta opción
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setExpandedIdx(null)}
                      className="px-3 py-1.5 bg-fantasy-purple-950 hover:bg-fantasy-purple-900 text-fantasy-purple-300 border border-fantasy-purple-500/40 text-xs font-bold rounded-lg self-end sm:self-auto cursor-pointer transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-fantasy-purple-400">
                  Agregar Nueva Opción ({numTiempos} Tiempos)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ingresa la información de cada tiempo para agregar esta opción al menú.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addModalError && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{addModalError}</span>
              </div>
            )}

            {renderModalCourseFields()}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAddOption}
                className="px-4 py-2 bg-fantasy-purple-600 hover:bg-fantasy-purple-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-fantasy-purple-900/30 cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
