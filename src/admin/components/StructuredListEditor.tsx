import React, { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";

interface StructuredListEditorProps {
  items: string[];
  maxLimit?: number;
  title?: string;
  subtitle?: string;
  itemLabel?: string;
  notePlaceholder?: string;
  onChange: (newItems: string[]) => void;
  onRequestConfirmation: (title: string, msg: string, onConfirm: () => void) => void;
}

export default function StructuredListEditor({
  items,
  maxLimit = 10,
  title = "Platillos del Menú",
  subtitle = "Gestiona individualmente cada platillo u opción.",
  itemLabel = "Platillo",
  notePlaceholder = "Ej. Incluye nota aclaratoria sobre el menú.",
  onChange,
  onRequestConfirmation
}: StructuredListEditorProps) {
  const parseInitialState = (rawItems: string[]) => {
    const d: string[] = [];
    let n = "";
    rawItems.forEach((item) => {
      if (item.toLowerCase().startsWith("nota:")) {
        n = item.replace(/^nota:\s*/i, "").trim();
      } else {
        d.push(item);
      }
    });
    return {
      dishes: d.length > 0 ? d : [""],
      note: n
    };
  };

  const [dishes, setDishes] = useState<string[]>(() => parseInitialState(items).dishes);
  const [note, setNote] = useState<string>(() => parseInitialState(items).note);

  React.useEffect(() => {
    const parsed = parseInitialState(items);
    setDishes(parsed.dishes);
    setNote(parsed.note);
  }, [items]);

  const emitChange = (updatedDishes: string[], updatedNote: string) => {
    const result: string[] = [...updatedDishes];
    if (updatedNote.trim().length > 0) {
      result.push(`Nota: ${updatedNote.trim()}`);
    }
    onChange(result);
  };

  const handleDishChange = (index: number, val: string) => {
    const updated = [...dishes];
    updated[index] = val;
    setDishes(updated);
    emitChange(updated, note);
  };

  const addDish = () => {
    if (dishes.length >= maxLimit) return;
    const updated = [...dishes, ""];
    setDishes(updated);
    emitChange(updated, note);
  };

  const removeDish = (index: number) => {
    onRequestConfirmation("Eliminar Platillo", "¿Seguro que deseas eliminar este platillo?", () => {
      const updated = dishes.filter((_, i) => i !== index);
      const finalDishes = updated.length > 0 ? updated : [""];
      setDishes(finalDishes);
      emitChange(finalDishes, note);
    });
  };

  const handleNoteChange = (val: string) => {
    setNote(val);
    emitChange(dishes, val);
  };

  return (
    <div className="bg-zinc-800/80 border border-zinc-700/80 p-4 rounded-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-700/70">
        <div>
          <label className="block text-xs font-bold text-fantasy-purple-400 uppercase tracking-wider">
            {title} ({dishes.length}/{maxLimit} registrados)
          </label>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {subtitle}
          </p>
        </div>
        {dishes.length < maxLimit && (
          <button
            type="button"
            onClick={addDish}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-fantasy-purple-950/90 border border-fantasy-purple-500/50 text-fantasy-purple-300 hover:bg-fantasy-purple-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar {itemLabel}
          </button>
        )}
      </div>

      {dishes.length >= maxLimit && (
        <div className="p-2.5 bg-fantasy-pink-950/60 border border-fantasy-pink-500/40 rounded-lg text-fantasy-pink-200 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-fantasy-pink-400 shrink-0" />
          <span>Has alcanzado el límite máximo de {maxLimit} {itemLabel.toLowerCase()}s.</span>
        </div>
      )}

      {/* List of dish input fields */}
      <div className="space-y-2.5">
        {dishes.map((dish, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 min-w-24 shrink-0">
                {itemLabel} {idx + 1}:
              </span>
              <input
                type="text"
                value={dish}
                onChange={(e) => handleDishChange(idx, e.target.value)}
                placeholder={`Escribe el/la ${itemLabel.toLowerCase()} ${idx + 1}...`}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
              />
              {dishes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDish(idx)}
                  className="p-2 bg-zinc-900 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title={`Eliminar ${itemLabel.toLowerCase()}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {dish.length > 100 && (
              <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                <span>⚠️</span> {itemLabel} no puede exceder los 100 caracteres.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recuadro de Nota */}
      <div className="pt-3 border-t border-zinc-700/70 space-y-1.5">
        <label className="block text-xs font-bold text-fantasy-purple-400 uppercase tracking-wider">
          Recuadro de Nota / Leyenda Aclaratoria
        </label>
        <p className="text-[11px] text-zinc-400">
          Esta nota se mostrará destacada junto a los platillos/opciones.
        </p>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder={notePlaceholder}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
        />
        {note.length > 200 && (
          <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
            <span>⚠️</span> La nota no puede exceder los 200 caracteres.
          </p>
        )}
      </div>
    </div>
  );
}
