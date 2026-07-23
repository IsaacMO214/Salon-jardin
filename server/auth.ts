import fs from "fs";
import crypto from "crypto";
import { SESSIONS_FILE, SESSION_DURATION } from "./config";

export interface Session {
  username: string;
  expiresAt: number;
}

function loadSessionsSync(): Map<string, Session> {
  const map = new Map<string, Session>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      for (const [k, v] of Object.entries(parsed)) {
        if ((v as Session).expiresAt > Date.now()) {
          map.set(k, v as Session);
        }
      }
    }
  } catch (err) {
    console.error("Error loading persisted sessions:", err);
  }
  return map;
}

async function saveSessions(): Promise<void> {
  try {
    const obj: Record<string, Session> = {};
    for (const [k, v] of activeSessions.entries()) {
      if (v.expiresAt > Date.now()) {
        obj[k] = v;
      }
    }
    await fs.promises.writeFile(SESSIONS_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving sessions:", err);
  }
}

export const activeSessions = loadSessionsSync();

// Periodic cleanup of expired sessions
setInterval(() => {
  let changed = false;
  for (const [k, v] of activeSessions.entries()) {
    if (v.expiresAt <= Date.now()) {
      activeSessions.delete(k);
      changed = true;
    }
  }
  if (changed) saveSessions();
}, 60 * 1000);

export function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    saveSessions();
    return false;
  }
  session.expiresAt = Date.now() + SESSION_DURATION;
  return true;
}

export function createSession(username: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  activeSessions.set(token, {
    username,
    expiresAt: Date.now() + SESSION_DURATION
  });
  saveSessions();
  return token;
}

export function getSessionUsername(token: string): string {
  const session = activeSessions.get(token);
  return session?.username || "admin";
}
