import { Router } from "express";
import fsSync from "fs";
import multer from "multer";
import { upload } from "../config";
import { isTokenValid } from "../auth";

const router = Router();

// File Upload Endpoint
router.post("/api/admin/upload", (req, res) => {
  const token = (req.headers.authorization?.split(" ")[1]) || (req.body?.token as string);
  if (!isTokenValid(token)) {
    return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });
  }

  upload.single("file")(req, res, (err) => {
    try {
      if (err) {
        console.error("Multer upload error:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, message: "El archivo es demasiado grande (máximo 50MB)" });
          }
          return res.status(400).json({ success: false, message: `Error al subir archivo: ${err.message}` });
        }
        return res.status(500).json({ success: false, message: "Error en el servidor al procesar el archivo" });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No se seleccionó ningún archivo" });
      }

      if (req.file.mimetype && req.file.mimetype.startsWith("image/") && req.file.size > 20 * 1024 * 1024) {
        fsSync.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, message: "Las imágenes no pueden superar los 20MB" });
      }

      if (req.file.mimetype && !req.file.mimetype.startsWith("image/") && req.file.size > 50 * 1024 * 1024) {
        fsSync.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, message: "Los videos no pueden superar los 50MB" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({ success: true, url: fileUrl });
    } catch (e) {
      console.error("Unexpected error in upload:", e);
      return res.status(500).json({ success: false, message: "Error interno al procesar el archivo." });
    }
  });
});

export default router;
