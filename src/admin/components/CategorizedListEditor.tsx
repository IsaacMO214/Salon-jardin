import React from "react";
import { Plus, Trash2, Info } from "lucide-react";

interface CategorizedListEditorProps {
  items: string[];
  maxCategories?: number;
  maxOptionsPerCat?: number;
  title?: string;
  subtitle?: string;
  categoryLabel?: string;
  optionLabel?: string;
  notePlaceholder?: string;
  onChange: (newItems: string[]) => void;
  onRequestConfirmation: (title: string, msg: string, onConfirm: () => void) => void;
}

export default function CategorizedListEditor({
  items,
  maxCategories = 10,
  maxOptionsPerCat = 15,
  title = "Categorías y Opciones",
  subtitle = "Gestiona por categorías. Ej: 'Pollo', 'Cerdo', y sus opciones.",
  categoryLabel = "Categoría",
  optionLabel = "Opción",
  notePlaceholder = "Ej. Incluye tortillas y salsas.",
  onChange,
  onRequestConfirmation
}: CategorizedListEditorProps) {
  const parseInitialState = (rawItems: string[]) => {
    const cats: { category: string; options: string[] }[] = [];
    let n = "";
    rawItems.forEach((item) => {
      if (item.toLowerCase().startsWith("nota:")) {
        n = item.replace(/^nota:\s*/i, "");
      } else {
        const parts = item.split(":");
        if (parts.length > 1) {
          cats.push({
            category: parts[0].trim(),
            options: parts.slice(1).join(":").split(",").map(o => o.trim()).filter(Boolean)
          });
        } else {
          cats.push({
            category: item.trim(),
            options: [""]
          });
        }
      }
    });
    return {
      cats: cats.length > 0 ? cats : [{ category: "", options: [""] }],
      note: n
    };
  };

  const [categories, setCategories] = React.useState(() => parseInitialState(items).cats);
  const [note, setNote] = React.useState(() => parseInitialState(items).note);

  React.useEffect(() => {
    const parsed = parseInitialState(items);
    setCategories(parsed.cats);
    setNote(parsed.note);
  }, [items]);

  const emitChange = (updatedCats: { category: string; options: string[] }[], updatedNote: string) => {
    const result: string[] = [];
    updatedCats.forEach(c => {
      if (c.category.trim() || c.options.some(o => o.trim())) {
        const opts = c.options.filter(o => o.trim());
        if (opts.length > 0) {
          result.push(`${c.category.trim() || 'Categoría'}: ${opts.join(", ")}`);
        } else {
          result.push(c.category.trim() || 'Categoría');
        }
      }
    });
    if (updatedNote.trim().length > 0) {
      result.push(`Nota: ${updatedNote}`);
    }
    onChange(result);
  };

  const handleCatNameChange = (cIdx: number, val: string) => {
    const updated = categories.map((cat, i) =>
      i === cIdx ? { ...cat, category: val } : cat
    );
    setCategories(updated);
    emitChange(updated, note);
  };

  const handleOptionChange = (cIdx: number, oIdx: number, val: string) => {
    const updated = categories.map((cat, i) =>
      i === cIdx ? { ...cat, options: cat.options.map((opt, j) => j === oIdx ? val : opt) } : cat
    );
    setCategories(updated);
    emitChange(updated, note);
  };

  const addCategory = () => {
    if (categories.length >= maxCategories) return;
    const updated = [...categories, { category: "", options: [""] }];
    setCategories(updated);
  };

  const removeCategory = (cIdx: number) => {
    onRequestConfirmation("Eliminar Categoría", "¿Seguro que deseas eliminar esta categoría y todas sus opciones?", () => {
      const updated = categories.filter((_, i) => i !== cIdx);
      const finalCats = updated.length > 0 ? updated : [{ category: "", options: [""] }];
      setCategories(finalCats);
      emitChange(finalCats, note);
    });
  };

  const addOption = (cIdx: number) => {
    if (categories[cIdx].options.length >= maxOptionsPerCat) return;
    const updated = categories.map((cat, i) =>
      i === cIdx ? { ...cat, options: [...cat.options, ""] } : cat
    );
    setCategories(updated);
  };

  const removeOption = (cIdx: number, oIdx: number) => {
    const updated = categories.map((cat, i) => {
      if (i !== cIdx) return cat;
      const filtered = cat.options.filter((_, j) => j !== oIdx);
      return { ...cat, options: filtered.length > 0 ? filtered : [""] };
    });
    setCategories(updated);
    emitChange(updated, note);
  };

  const handleNoteChange = (val: string) => {
    setNote(val);
    emitChange(categories, val);
  };

  return (
    <div className="bg-zinc-800/80 border border-zinc-700/80 p-4 rounded-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-700/70">
        <div>
          <label className="block text-xs font-bold text-fantasy-purple-400 uppercase tracking-wider">
            {title} ({categories.length}/{maxCategories} categorías)
          </label>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {subtitle}
          </p>
        </div>
        {categories.length < maxCategories && (
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-fantasy-purple-950/90 border border-fantasy-purple-500/50 text-fantasy-purple-300 hover:bg-fantasy-purple-900/90 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Categoría
          </button>
        )}
      </div>

      <div className="space-y-6">
        {categories.map((cat, cIdx) => (
          <div key={cIdx} className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-fantasy-purple-400 min-w-[80px] shrink-0">
                  Categoría {cIdx + 1}:
                </span>
                <input
                  type="text"
                  value={cat.category}
                  onChange={(e) => handleCatNameChange(cIdx, e.target.value)}
                  placeholder="Ej. Pollo, Cerdo, Res..."
                  className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-fantasy-purple-500 font-bold"
                />
                <button
                  type="button"
                  onClick={() => removeCategory(cIdx)}
                  className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar Categoría"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {cat.category.length > 50 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> La categoría no puede exceder los 50 caracteres.
                </p>
              )}
            </div>
            
            <div className="pl-2 border-l-2 border-zinc-700 space-y-2">
              {cat.options.map((opt, oIdx) => (
                <div key={oIdx} className="ml-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-zinc-400 min-w-[60px] shrink-0">
                      Opción {oIdx + 1}:
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(cIdx, oIdx, e.target.value)}
                      placeholder="Ej. Pollo Pibil..."
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500"
                    />
                    {cat.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(cIdx, oIdx)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {opt.length > 100 && (
                    <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm ml-[68px]">
                      <span>⚠️</span> La opción no puede exceder los 100 caracteres.
                    </p>
                  )}
                </div>
              ))}
              {cat.options.length < maxOptionsPerCat && (
                <button
                  type="button"
                  onClick={() => addOption(cIdx)}
                  className="ml-[68px] inline-flex items-center gap-1 text-[11px] font-semibold text-fantasy-purple-400 hover:text-fantasy-purple-300 mt-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Añadir Opción a {cat.category || `Categoría ${cIdx + 1}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-zinc-700/70">
        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
          Nota Adicional (Opcional)
        </label>
          <div className="flex items-start gap-2">
            <div className="p-2 bg-fantasy-pink-950/30 border border-fantasy-pink-900/30 rounded-lg mt-0.5">
              <Info className="w-4 h-4 text-fantasy-pink-500" />
            </div>
            <div className="flex-1 space-y-1">
              <textarea
                rows={2}
                value={note}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder={notePlaceholder}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-fantasy-purple-500 italic"
              />
              {note.length > 200 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> La nota no puede exceder los 200 caracteres.
                </p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
