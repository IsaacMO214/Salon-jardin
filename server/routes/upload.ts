import { Router } from "express";
import fsSync from "fs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { upload } from "../config";
import { isTokenValid } from "../auth";

const router = Router();

// Configure Cloudinary if credentials are available (production)
const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured for file uploads.");
}

// File Upload Endpoint
router.post("/api/admin/upload", (req, res) => {
  const token = (req.headers.authorization?.split(" ")[1]) || (req.body?.token as string);
  if (!isTokenValid(token)) {
    return res.status(401).json({ success: false, message: "No autorizado o sesión expirada" });
  }

  upload.single("file")(req, res, async (err) => {
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

      // If Cloudinary is configured, upload there; otherwise use local path
      if (useCloudinary) {
        try {
          const isVideo = req.file.mimetype?.startsWith("video/");
          const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: isVideo ? "video" : "image",
            folder: "salon-jardin",
            quality: "auto",
          });

          // Delete temp local file after Cloudinary upload
          fsSync.unlink(req.file.path, () => {});

          return res.json({ success: true, url: result.secure_url });
        } catch (cloudErr: any) {
          console.error("Cloudinary upload error:", cloudErr);
          fsSync.unlink(req.file.path, () => {});
          return res.status(500).json({ success: false, message: "Error al subir archivo a la nube." });
        }
      }

      // Local fallback (development)
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({ success: true, url: fileUrl });
    } catch (e) {
      console.error("Unexpected error in upload:", e);
      return res.status(500).json({ success: false, message: "Error interno al procesar el archivo." });
    }
  });
});

export default router;
