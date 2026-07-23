import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

export let pool: mysql.Pool;

const MAX_DB_RETRIES = 5;
const DB_RETRY_DELAY = 3000;

export async function initDB(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_DB_RETRIES; attempt++) {
    try {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || "localhost",
        port: parseInt(process.env.MYSQL_PORT || "3306"),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "jardin_fantasy",
        waitForConnections: true,
        connectionLimit: 10,
        charset: "utf8mb4",
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });

      await pool.execute("SELECT 1");
      console.log("MySQL connected.");
      return;
    } catch (err) {
      console.error(`MySQL connection attempt ${attempt}/${MAX_DB_RETRIES} failed:`, err);
      if (attempt === MAX_DB_RETRIES) throw err;
      await new Promise(r => setTimeout(r, DB_RETRY_DELAY));
    }
  }
}

// Load ALL data from MySQL into a single object (matching old db.json shape)
export async function readDB(): Promise<any> {
  const db: any = {};

  // Single-row tables
  db.banner = await loadSingle("banner") || { imagenesUrl: [], slogan: "" };
  db.redesSociales = await loadSingle("redes_sociales") || {};
  db.nosotros = await loadSingle("nosotros") || { telefonos: [], valores: [] };
  db.reglamento = await loadSingle("reglamento") || { objetosProhibidos: [], reglas: [] };

  // Array tables (all rows)
  db.eventos = await loadArray("eventos");
  db.menus = await loadArray("menus");
  db.paquetes_sociales = await loadArray("paquetes_sociales");
  db.paquetes_infantiles = await loadArray("paquetes_infantiles");
  db.shows = await loadArray("shows");
  db.servicios_adicionales = await loadArray("servicios_adicionales");
  db.testimonios = await loadArray("testimonios");
  db.galeria = await loadArray("galeria");
  db.usuarios = await loadArray("usuarios");

  return db;
}

// Save ALL data back to MySQL (full sync)
export async function writeDB(data: any): Promise<boolean> {
  try {
    await saveSingle("banner", data.banner);
    await saveSingle("redes_sociales", data.redesSociales);
    await saveSingle("nosotros", data.nosotros);
    await saveSingle("reglamento", data.reglamento);

    await saveArray("eventos", data.eventos, ["id", "nombre", "descripcion", "icono", "fotos"]);
    await saveArray("menus", data.menus, ["id", "nombre", "tipo", "numTiempos", "conCategorias", "items", "salseados", "fotos"]);
    await saveArray("paquetes_sociales", data.paquetes_sociales, ["id", "nombre", "precio", "horas", "servicios", "menus", "fotos"]);
    await saveArray("paquetes_infantiles", data.paquetes_infantiles, ["id", "nombre", "precio", "horas", "tipoServicio", "servicios", "menus", "fotos"]);
    await saveArray("shows", data.shows, ["id", "nombre", "precio", "duracion", "descripcion", "fotos", "videoUrl"]);
    await saveArray("servicios_adicionales", data.servicios_adicionales, ["id", "nombre", "precio", "tipoCobro", "descripcion", "sinPrecioFijo"]);
    await saveArray("testimonios", data.testimonios, ["id", "videoUrl"]);
    await saveArray("galeria", data.galeria, ["id", "url", "categoria"]);
    await saveArray("usuarios", data.usuarios, ["id", "username", "passwordHash"]);
    return true;
  } catch (e) {
    console.error("Error writing to MySQL:", e);
    return false;
  }
}

// ─── helpers ───

async function loadSingle(table: string): Promise<any | null> {
  const [rows] = await pool.execute(`SELECT * FROM \`${table}\` WHERE id = 1`);
  const r = (rows as any[])[0];
  if (!r) return null;
  // Parse JSON columns
  for (const key of Object.keys(r)) {
    if (typeof r[key] === "string" && (r[key].startsWith("[") || r[key].startsWith("{"))) {
      try { r[key] = JSON.parse(r[key]); } catch { /* keep string */ }
    }
  }
  return r;
}

async function loadArray(table: string): Promise<any[]> {
  const [rows] = await pool.execute(`SELECT * FROM \`${table}\``);
  const items = rows as any[];
  for (const item of items) {
    for (const key of Object.keys(item)) {
      if (typeof item[key] === "string" && (item[key].startsWith("[") || item[key].startsWith("{"))) {
        try { item[key] = JSON.parse(item[key]); } catch { /* keep string */ }
      }
    }
  }
  return items;
}

async function saveSingle(table: string, data: any): Promise<void> {
  if (!data) return;
  const columns = Object.keys(data).filter(k => k !== "id");
  const values = columns.map(c => {
    const v = data[c];
    return Array.isArray(v) || (typeof v === "object" && v !== null) ? JSON.stringify(v) : v;
  });
  const placeholders = columns.map(() => "?").join(", ");
  const updates = columns.map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(", ");

  await pool.execute(
    `INSERT INTO \`${table}\` (id, ${columns.map(c => "`" + c + "`").join(", ")})
     VALUES (1, ${placeholders})
     ON DUPLICATE KEY UPDATE ${updates}`,
    values
  );
}

async function saveArray(table: string, items: any[], columns: string[]): Promise<void> {
  if (!items) return;
  // DELETE rows not in current set
  const ids = items.filter(i => i && i.id).map(i => i.id);
  if (ids.length > 0) {
    const placeholders = ids.map(() => "?").join(",");
    await pool.execute(`DELETE FROM \`${table}\` WHERE id NOT IN (${placeholders})`, ids);
  } else {
    await pool.execute(`DELETE FROM \`${table}\``);
  }

  // INSERT or UPDATE each row
  for (const item of items) {
    if (!item) continue;
    const vals = columns.map(c => {
      const v = item[c];
      if (v === undefined) return null;
      return Array.isArray(v) || (typeof v === "object" && v !== null) ? JSON.stringify(v) : v;
    });
    const placeholders = columns.map(() => "?").join(", ");
    const updates = columns.filter(c => c !== "id").map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(", ");

    await pool.execute(
      `INSERT INTO \`${table}\` (${columns.map(c => "`" + c + "`").join(", ")})
       VALUES (${placeholders})
       ON DUPLICATE KEY UPDATE ${updates}`,
      vals
    );
  }
}

// Ensure initDB is called before first use
let initialized = false;
export async function ensureDB(): Promise<void> {
  if (!initialized) {
    await initDB();
    initialized = true;
  }
}
