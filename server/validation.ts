export function validateItem(item: any, type?: string) {
  const isPaquete = type === "paquete";
  const maxNombreLen = isPaquete ? 60 : 30;
  const maxPrecio = isPaquete ? 1000 : 10000;

  if (item.nombre && typeof item.nombre === "string" && item.nombre.length > maxNombreLen) {
    throw new Error(`El nombre no puede exceder los ${maxNombreLen} caracteres.`);
  }
  if (item.descripcion && typeof item.descripcion === "string" && item.descripcion.length > 150) {
    throw new Error("La descripción no puede exceder los 150 caracteres.");
  }
  if (item.precio !== undefined && item.precio !== "") {
    const p = Number(item.precio);
    if (isNaN(p) || p < 0 || p > maxPrecio) {
      throw new Error(`El precio debe ser un número entre 0 y ${maxPrecio.toLocaleString("es-MX")} MXN.`);
    }
  }
  if (item.horas !== undefined && item.horas !== "") {
    const h = Number(item.horas);
    if (!isNaN(h) && ![6, 7, 8].includes(h)) {
      throw new Error("La duración en horas solo puede ser de 6, 7 u 8 horas.");
    }
  }
}
