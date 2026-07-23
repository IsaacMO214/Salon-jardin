import path from "path";
import fsSync from "fs";
import crypto from "crypto";
import multer from "multer";

// Ensure required directories exist synchronously at startup
export const uploadDir = path.join(process.cwd(), "uploads");
export const dataDir = path.join(process.cwd(), "data");
if (!fsSync.existsSync(uploadDir)) {
  fsSync.mkdirSync(uploadDir, { recursive: true });
}
if (!fsSync.existsSync(dataDir)) {
  fsSync.mkdirSync(dataDir, { recursive: true });
}

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".mov"];
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error("Tipo de archivo no permitido. Solo imágenes (jpg, png, webp, gif) y videos (mp4, webm, mov)."));
    }
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error("Tipo MIME no permitido."));
    }
    if (file.mimetype.startsWith("image/") && file.size > 5 * 1024 * 1024) {
      return cb(new Error("Las imágenes no pueden superar los 5MB."));
    }
    cb(null, true);
  }
});

export const PORT = parseInt(process.env.PORT || "3000", 10);
export const DB_FILE = path.join(process.cwd(), "data", "db.json");
export const SESSIONS_FILE = path.join(process.cwd(), "data", "sessions.json");
export const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
