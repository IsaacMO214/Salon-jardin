import { Router } from "express";
import { readDB, writeDB } from "../db";
import { isTokenValid } from "../auth";
import { validateItem } from "../validation";

const router = Router();

// Generic Save Section (for nosotros, reglamento, etc.)
router.post("/api/admin/save-section", async (req, res) => {
  const { token, section, data } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });
  
  if (section === "nosotros" && data.telefonos) {
    for (const t of data.telefonos) {
      const cleanT = t.replace(/\D/g, "");
      if (cleanT.length !== 10) {
        return res.status(400).json({ success: false, message: "Cada teléfono debe tener exactamente 10 dígitos numéricos." });
      }
    }
  }

  try {
    if (Array.isArray(data)) {
      if (["shows", "servicios_adicionales", "eventos", "menus", "testimonios", "galeria"].includes(section)) {
        data.forEach(item => validateItem(item));
      } else if (["paquetes_sociales", "paquetes_infantiles"].includes(section)) {
        data.forEach(item => validateItem(item, "paquete"));
      }
    }
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }

  const db = await readDB();
  if (!db[section]) {
    db[section] = {};
  }
  db[section] = data;
  
  const success = await writeDB(db);
  res.json({ success });
});

// CRUD: Eventos
router.post("/api/admin/eventos/save", async (req, res) => {
  const { token, event } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  try {
    validateItem(event);
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }

  const db = await readDB();
  const index = db.eventos.findIndex((e: any) => e.id === event.id);
  if (index !== -1) {
    db.eventos[index] = event;
  } else {
    db.eventos.push(event);
  }

  const success = await writeDB(db);
  res.json({ success });
});

router.post("/api/admin/eventos/delete/:id", async (req, res) => {
  const { token } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  db.eventos = db.eventos.filter((e: any) => e.id !== req.params.id);

  const success = await writeDB(db);
  res.json({ success });
});

// CRUD: Eventos Galería (shared gallery for all events)
router.post("/api/admin/eventos-galeria/save", async (req, res) => {
  const { token, urls } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  db.eventos_galeria = urls || [];

  const success = await writeDB(db);
  res.json({ success });
});

// CRUD: Menús
router.post("/api/admin/menus/save", async (req, res) => {
  const { token, menu } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  try {
    validateItem(menu);
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }

  const db = await readDB();
  const index = db.menus.findIndex((m: any) => m.id === menu.id);
  if (index !== -1) {
    db.menus[index] = menu;
  } else {
    db.menus.push(menu);
  }

  const success = await writeDB(db);
  res.json({ success });
});

router.post("/api/admin/menus/delete/:id", async (req, res) => {
  const { token } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  db.menus = db.menus.filter((m: any) => m.id !== req.params.id);

  const success = await writeDB(db);
  res.json({ success });
});

// CRUD: Paquetes Sociales
router.post("/api/admin/paquetes-sociales/save", async (req, res) => {
  const { token, paquete } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  try {
    validateItem(paquete, "paquete");
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }

  const db = await readDB();
  const index = db.paquetes_sociales.findIndex((p: any) => p.id === paquete.id);
  if (index !== -1) {
    db.paquetes_sociales[index] = paquete;
  } else {
    db.paquetes_sociales.push(paquete);
  }

  const success = await writeDB(db);
  res.json({ success });
});

router.post("/api/admin/paquetes-sociales/delete/:id", async (req, res) => {
  const { token } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  db.paquetes_sociales = db.paquetes_sociales.filter((p: any) => p.id !== req.params.id);

  const success = await writeDB(db);
  res.json({ success });
});

// CRUD: Paquetes Infantiles
router.post("/api/admin/paquetes-infantiles/save", async (req, res) => {
  const { token, paquete } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  try {
    validateItem(paquete, "paquete");
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }

  const db = await readDB();
  const index = db.paquetes_infantiles.findIndex((p: any) => p.id === paquete.id);
  if (index !== -1) {
    db.paquetes_infantiles[index] = paquete;
  } else {
    db.paquetes_infantiles.push(paquete);
  }

  const success = await writeDB(db);
  res.json({ success });
});

router.post("/api/admin/paquetes-infantiles/delete/:id", async (req, res) => {
  const { token } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  db.paquetes_infantiles = db.paquetes_infantiles.filter((p: any) => p.id !== req.params.id);

  const success = await writeDB(db);
  res.json({ success });
});

// CRUD: Shows
router.post("/api/admin/shows/save", async (req, res) => {
  const { token, show } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  try {
    validateItem(show);
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }

  const db = await readDB();
  const index = db.shows.findIndex((s: any) => s.id === show.id);
  if (index !== -1) {
    db.shows[index] = show;
  } else {
    db.shows.push(show);
  }

  const success = await writeDB(db);
  res.json({ success });
});

router.post("/api/admin/shows/delete/:id", async (req, res) => {
  const { token } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  db.shows = db.shows.filter((s: any) => s.id !== req.params.id);

  const success = await writeDB(db);
  res.json({ success });
});

// CRUD: Testimonios
router.post("/api/admin/testimonios/save", async (req, res) => {
  const { token, testimonio } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  const index = db.testimonios.findIndex((t: any) => t.id === testimonio.id);
  if (index !== -1) {
    db.testimonios[index] = testimonio;
  } else {
    db.testimonios.push(testimonio);
  }

  const success = await writeDB(db);
  res.json({ success });
});

router.post("/api/admin/testimonios/delete/:id", async (req, res) => {
  const { token } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  db.testimonios = db.testimonios.filter((t: any) => t.id !== req.params.id);

  const success = await writeDB(db);
  res.json({ success });
});

// CRUD: Galería General
router.post("/api/admin/galeria/save", async (req, res) => {
  const { token, item } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  const index = db.galeria.findIndex((g: any) => g.id === item.id);
  if (index !== -1) {
    db.galeria[index] = item;
  } else {
    db.galeria.push(item);
  }

  const success = await writeDB(db);
  res.json({ success });
});

router.post("/api/admin/galeria/delete/:id", async (req, res) => {
  const { token } = req.body;
  if (!isTokenValid(token)) return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });

  const db = await readDB();
  db.galeria = db.galeria.filter((g: any) => g.id !== req.params.id);

  const success = await writeDB(db);
  res.json({ success });
});

export default router;
