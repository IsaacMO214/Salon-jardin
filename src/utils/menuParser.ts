export interface MenuOptionCourse {
  nombre: string;
  descripcion: string;
}

export interface MenuOptionItem {
  tiempos: MenuOptionCourse[]; // ordered array, length = numTiempos
  guarnicion: MenuOptionCourse;
  tieneSalseado?: boolean;
}

const COURSE_LABELS = ["1er", "2do", "3er", "4to", "5to"];

export function getCourseLabel(index: number): string {
  return COURSE_LABELS[index] || `${index + 1}to`;
}

export function parseCourseText(text: string): { nombre: string; descripcion: string } {
  if (!text) return { nombre: "", descripcion: "" };
  text = text.trim();
  const matchParen = text.match(/^(.*?)\((.*?)\)$/);
  if (matchParen) {
    return {
      nombre: matchParen[1].trim(),
      descripcion: matchParen[2].trim()
    };
  }
  const matchColon = text.match(/^(.*?):\s*(.*)$/);
  if (matchColon) {
    return {
      nombre: matchColon[1].trim(),
      descripcion: matchColon[2].trim()
    };
  }
  return { nombre: text, descripcion: "" };
}

function detectNumTiempos(items: string[]): number {
  if (!items || items.length === 0) return 2;
  const allText = items.join(" ");
  let maxCourse = 0;
  for (let i = 1; i <= 5; i++) {
    const label = COURSE_LABELS[i - 1];
    const pattern = new RegExp(`\\[${label}\\s*Tiempo\\]`, 'i');
    if (pattern.test(allText)) {
      maxCourse = i;
    }
  }
  return maxCourse >= 2 ? maxCourse : 2;
}

export function parseItemsToStructuredOptions(items: string[], numTiempos?: number): MenuOptionItem[] {
  const effectiveNum = numTiempos || detectNumTiempos(items);
  if (!items || items.length === 0) {
    return [
      {
        tiempos: Array.from({ length: effectiveNum }, () => ({ nombre: "", descripcion: "" })),
        guarnicion: { nombre: "", descripcion: "" },
        tieneSalseado: false
      }
    ];
  }

  const result: MenuOptionItem[] = [];

  for (const item of items) {
    let body = item;
    const matchOp = item.match(/^Opción\s*\d+:?\s*/i);
    if (matchOp) {
      body = item.substring(matchOp[0].length);
    }

    const tiempos: MenuOptionCourse[] = Array.from({ length: effectiveNum }, () => ({ nombre: "", descripcion: "" }));
    let guar = { nombre: "", descripcion: "" };
    let tieneSalseado = false;

    const parts = body.split(/\s*-\s*\[/);
    for (const part of parts) {
      let raw = part.trim();
      if (!raw.startsWith("[")) {
        raw = "[" + raw;
      }
      const matchTag = raw.match(/^\[(.*?)\]\s*(.*)$/);
      if (matchTag) {
        const tag = matchTag[1].toLowerCase();
        const val = matchTag[2].trim();

        let matched = false;
        for (let i = 0; i < effectiveNum; i++) {
          const label = COURSE_LABELS[i]?.toLowerCase() || "";
          if (tag.includes(label) || tag.includes(`${i + 1}er`) || tag.includes(`${i + 1}do`) || tag.includes(`${i + 1}er`) || tag.includes(`${i + 1}to`)) {
            tiempos[i] = parseCourseText(val);
            matched = true;
            break;
          }
        }
        if (!matched) {
          if (tag.includes("guarnic")) {
            guar = parseCourseText(val);
          } else if (tag.includes("salsead")) {
            tieneSalseado = true;
          }
        }
      } else if (raw.toLowerCase().includes("salsead")) {
        tieneSalseado = true;
      }
    }

    result.push({
      tiempos,
      guarnicion: guar,
      tieneSalseado
    });
  }

  return result.length > 0 ? result : [
    {
      tiempos: Array.from({ length: effectiveNum }, () => ({ nombre: "", descripcion: "" })),
      guarnicion: { nombre: "", descripcion: "" },
      tieneSalseado: false
    }
  ];
}

export function serializeStructuredOptions(options: MenuOptionItem[], numTiempos: number): string[] {
  return options.map((opt, index) => {
    const parts: string[] = [];

    for (let i = 0; i < numTiempos; i++) {
      const tiempo = opt.tiempos[i];
      if (tiempo && tiempo.nombre.trim()) {
        let text = tiempo.nombre.trim();
        if (tiempo.descripcion.trim()) {
          text += ` (${tiempo.descripcion.trim()})`;
        }
        parts.push(`[${getCourseLabel(i)} Tiempo] ${text}`);
      }
    }

    if (opt.guarnicion.nombre.trim()) {
      let text = opt.guarnicion.nombre.trim();
      if (opt.guarnicion.descripcion.trim()) {
        text += ` (${opt.guarnicion.descripcion.trim()})`;
      }
      parts.push(`[Guarnición] ${text}`);
    }

    if (opt.tieneSalseado) {
      parts.push(`[Salseado]`);
    }

    return `Opción ${index + 1}: ${parts.join(" - ")}`;
  }).filter(s => s.trim().length > 0);
}

export function getOptionSummaryText(opt: MenuOptionItem, numTiempos: number): string {
  const parts: string[] = [];
  for (let i = 0; i < numTiempos; i++) {
    const t = opt.tiempos[i];
    if (t && t.nombre.trim()) {
      parts.push(`${getCourseLabel(i)} Tiempo: ${t.nombre.trim()}`);
    }
  }
  if (opt.guarnicion.nombre.trim()) {
    parts.push(`Guarnición: ${opt.guarnicion.nombre.trim()}`);
  }
  return parts.length > 0 ? parts.join(" — ") : "Opción sin platillos definidos";
}
