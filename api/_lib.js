import { randomUUID, timingSafeEqual } from "node:crypto";

export const newId = () => `${Date.now()}-${randomUUID()}`;

export const header = (req, name) => {
  try { return decodeURIComponent(String(req.headers[name] || "")).trim(); } catch { return ""; }
};

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

export function pinOk(pin) {
  const a = Buffer.from(String(pin || "")), b = Buffer.from(String(process.env.HOST_PIN || "2510"));
  return a.length === b.length && timingSafeEqual(a, b);
}

export const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
