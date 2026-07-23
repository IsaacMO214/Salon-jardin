import { Router } from "express";
import bcrypt from "bcrypt";
import { readDB, writeDB } from "../db";
import { isTokenValid, createSession, getSessionUsername } from "../auth";

const router = Router();

const BCRYPT_ROUNDS = 12;

// Admin Authentication
router.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Faltan credenciales" });
  }

  const db = await readDB();
  const user = db.usuarios?.find((u: any) => u.username === username);

  if (!user) {
    return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
  }

  let passwordOk = false;

  // Try bcrypt first, fall back to legacy SHA-256 for migration
  if (user.passwordHash?.startsWith("$2b$") || user.passwordHash?.startsWith("$2a$")) {
    passwordOk = await bcrypt.compare(password, user.passwordHash);
  } else {
    // Legacy SHA-256 — verify, then re-hash with bcrypt
    const crypto = await import("crypto");
    const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
    if (legacyHash === user.passwordHash) {
      passwordOk = true;
      user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await writeDB(db);
    }
  }

  if (passwordOk) {
    const token = createSession(user.username);
    res.json({ success: true, token, username: user.username });
  } else {
    res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
  }
});

// Change Admin Password
router.post("/api/admin/change-password", async (req, res) => {
  const { token, currentPassword, newPassword } = req.body;
  if (!isTokenValid(token)) {
    return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });
  }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Campos incompletos" });
  }

  const username = getSessionUsername(token);

  const db = await readDB();

  let userIndex = db.usuarios?.findIndex((u: any) => u.username === username);
  if (userIndex === -1 || userIndex === undefined) {
    userIndex = db.usuarios?.findIndex((u: any) => u.username === "admin");
  }

  if (userIndex === -1 || userIndex === undefined || !db.usuarios[userIndex]) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado" });
  }

  const storedHash = db.usuarios[userIndex].passwordHash;
  let currentOk = false;

  if (storedHash?.startsWith("$2b$") || storedHash?.startsWith("$2a$")) {
    currentOk = await bcrypt.compare(currentPassword, storedHash);
  } else {
    const crypto = await import("crypto");
    const legacyHash = crypto.createHash("sha256").update(currentPassword).digest("hex");
    currentOk = legacyHash === storedHash;
  }

  if (!currentOk) {
    return res.status(400).json({ success: false, message: "La contraseña actual es incorrecta" });
  }

  db.usuarios[userIndex].passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  const success = await writeDB(db);
  if (success) {
    res.json({ success: true, message: "Contraseña actualizada exitosamente" });
  } else {
    res.status(500).json({ success: false, message: "Error al guardar los datos" });
  }
});

export default router;
