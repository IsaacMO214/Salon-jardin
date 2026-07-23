import { Router } from "express";
import { readDB } from "../db";

const router = Router();

// Get full database state (public data only)
router.get("/api/data", async (req, res) => {
  const db = await readDB();
  // Exclude users list for security
  const { usuarios, ...publicData } = db;
  res.json(publicData);
});

export default router;
