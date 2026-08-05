import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { PORT, uploadDir } from "./config";
import { ensureDB, pool } from "./db";
import authRoutes from "./routes/auth";
import dataRoutes from "./routes/data";
import uploadRoutes from "./routes/upload";
import crudRoutes from "./routes/crud";

async function startServer() {
  await ensureDB();
  const app = express();

  // Trust the first proxy (Hostinger/Passenger/Render) so rate limiting works behind it
  app.set("trust proxy", 1);

  // CORS — allow frontend on Hostinger to call this API
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : ["http://localhost:5173", "http://localhost:3000"];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // In production, allow all for now — tighten later
      }
    },
    credentials: true,
  }));

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.ytimg.com"],
        frameSrc: ["'self'", "https://www.google.com", "https://www.youtube.com"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }));

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Global rate limiting for all API routes
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: "Demasiadas solicitudes. Intenta de nuevo en 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", globalLimiter);

  // Stricter rate limiting on login endpoint
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Demasiados intentos. Intenta de nuevo en 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/admin/login", loginLimiter);

  // Serve static files from the uploads directory
  app.use("/uploads", express.static(uploadDir));

  // API Routes
  app.use(uploadRoutes);
  app.use(authRoutes);
  app.use(dataRoutes);
  app.use(crudRoutes);

  // Error handling middleware for API routes
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Error interno del servidor",
    });
  });

  // Vite middleware integration for Hot Module Replacement in dev
  // In production, frontend is served from Hostinger — this server only handles API
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Health check endpoint for Render
    app.get("/", (req, res) => {
      res.json({ status: "ok", service: "salon-jardin-api" });
    });
  }

  // SSL support — use cert files if available, otherwise fall back to HTTP
  const sslKeyPath = process.env.SSL_KEY_PATH || "";
  const sslCertPath = process.env.SSL_CERT_PATH || "";

  let server;
  if (sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    const credentials = {
      key: fs.readFileSync(sslKeyPath, "utf-8"),
      cert: fs.readFileSync(sslCertPath, "utf-8"),
    };
    server = https.createServer(credentials, app).listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on https://0.0.0.0:${PORT}`);
    });
  } else {
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed.");
    });
    if (pool) {
      await pool.end().catch((err: Error) => console.error("Error closing pool:", err));
    }
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
