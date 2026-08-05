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

      // Auto-migrate to add 'orden' column if it doesn't exist
      try { await pool.execute("ALTER TABLE paquetes_infantiles ADD COLUMN orden INT DEFAULT 0"); } catch (e) { /* ignore if exists */ }
      try { await pool.execute("ALTER TABLE paquetes_sociales ADD COLUMN orden INT DEFAULT 0"); } catch (e) { /* ignore if exists */ }

      // Auto-migrate: create eventos_galeria table if it doesn't exist
      try { await pool.execute("CREATE TABLE IF NOT EXISTS eventos_galeria (id INT PRIMARY KEY DEFAULT 1, urls JSON) ENGINE=InnoDB"); } catch (e) { /* ignore */ }

      // Auto-migrate: create configuracion table if it doesn't exist
      try { await pool.execute("CREATE TABLE IF NOT EXISTS configuracion (id INT PRIMARY KEY DEFAULT 1, precio_shows INT DEFAULT 5500) ENGINE=InnoDB"); } catch (e) { /* ignore */ }

      // One-time migration: transfer existing event fotos to shared gallery
      try {
        const [egRows] = await pool.execute("SELECT urls FROM eventos_galeria WHERE id = 1");
        const existingGallery = (egRows as any[])[0];
        let currentUrls: string[] = [];
        if (existingGallery?.urls) {
          const parsed = typeof existingGallery.urls === "string" ? JSON.parse(existingGallery.urls) : existingGallery.urls;
          currentUrls = Array.isArray(parsed) ? parsed : [];
        }

        // Only migrate if gallery is empty (hasn't been populated yet)
        if (currentUrls.length === 0) {
          const [eventRows] = await pool.execute("SELECT fotos FROM eventos WHERE fotos IS NOT NULL");
          const allFotos: string[] = [];
          for (const row of (eventRows as any[])) {
            let fotos = row.fotos;
            if (typeof fotos === "string") {
              try { fotos = JSON.parse(fotos); } catch { continue; }
            }
            if (Array.isArray(fotos)) {
              for (const url of fotos) {
                if (url && typeof url === "string" && url.trim() !== "" && !allFotos.includes(url)) {
                  allFotos.push(url);
                }
              }
            }
          }
          if (allFotos.length > 0) {
            await pool.execute(
              "INSERT INTO eventos_galeria (id, urls) VALUES (1, ?) ON DUPLICATE KEY UPDATE urls = VALUES(urls)",
              [JSON.stringify(allFotos)]
            );
            console.log(`Migrated ${allFotos.length} photos from individual events to shared eventos_galeria.`);
          }
        }
      } catch (e) {
        console.warn("eventos_galeria migration skipped:", e);
      }

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
  db.paquetes_sociales = await loadArray("paquetes_sociales", "orden ASC");
  db.paquetes_infantiles = await loadArray("paquetes_infantiles", "orden ASC");
  db.shows = await loadArray("shows");
  db.servicios_adicionales = await loadArray("servicios_adicionales");
  db.testimonios = await loadArray("testimonios");
  db.galeria = await loadArray("galeria");
  db.usuarios = await loadArray("usuarios");

  // eventos_galeria: single-row JSON array of media URLs
  const egRow = await loadSingle("eventos_galeria");
  db.eventos_galeria = egRow?.urls || [];

  // master_servicios
  const masterRow = await loadSingle("master_servicios");
  db.master_servicios_sociales = masterRow?.sociales || [];
  db.master_servicios_infantiles = masterRow?.infantiles || [];

  // configuracion
  const configRow = await loadSingle("configuracion");
  db.precio_shows = configRow?.precio_shows || 5500;

  return db;
}

// Save ALL data back to MySQL (full sync)
export async function writeDB(data: any): Promise<boolean> {
  try {
    await saveSingle("banner", data.banner);
    await saveSingle("redes_sociales", data.redesSociales);
    await saveSingle("nosotros", data.nosotros);
    await saveSingle("reglamento", data.reglamento);

    await saveArray("eventos", data.eventos, ["id", "nombre", "descripcion", "icono"]);
    await saveArray("menus", data.menus, ["id", "nombre", "tipo", "numTiempos", "conCategorias", "items", "salseados", "fotos"]);
    await saveArray("paquetes_sociales", data.paquetes_sociales, ["id", "nombre", "precio", "horas", "servicios", "menus", "fotos", "orden"]);
    await saveArray("paquetes_infantiles", data.paquetes_infantiles, ["id", "nombre", "precio", "horas", "tipoServicio", "servicios", "menus", "fotos", "orden"]);
    await saveArray("shows", data.shows, ["id", "nombre", "precio", "duracion", "descripcion", "fotos", "videoUrl"]);
    await saveArray("servicios_adicionales", data.servicios_adicionales, ["id", "nombre", "precio", "tipoCobro", "descripcion", "sinPrecioFijo"]);
    await saveArray("testimonios", data.testimonios, ["id", "videoUrl"]);
    await saveArray("galeria", data.galeria, ["id", "url", "categoria"]);
    await saveArray("usuarios", data.usuarios, ["id", "username", "passwordHash"]);

    // eventos_galeria: save as single-row JSON
    await saveSingle("eventos_galeria", { urls: data.eventos_galeria || [] });

    // master_servicios
    await saveSingle("master_servicios", { 
      sociales: data.master_servicios_sociales || [], 
      infantiles: data.master_servicios_infantiles || [] 
    });

    // configuracion
    await saveSingle("configuracion", { precio_shows: data.precio_shows || 5500 });

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

async function loadArray(table: string, orderBy?: string): Promise<any[]> {
  const query = orderBy ? `SELECT * FROM \`${table}\` ORDER BY ${orderBy}` : `SELECT * FROM \`${table}\``;
  const [rows] = await pool.execute(query);
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
