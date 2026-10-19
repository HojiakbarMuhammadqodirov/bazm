import { put, get, del } from "@vercel/blob";
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
  const a = Buffer.from(String(pin || "")), b = Buffer.from(String(process.env.HOST_PIN || "2510").trim());
  return a.length === b.length && timingSafeEqual(a, b);
}

export const hasBlob = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

// Yangi Blob xotiralar odatda "private", eskilari "public". Qaysi biri ishlasa, o'shani eslab qolamiz.
let ACCESS = process.env.BLOB_ACCESS || null;
const order = () => ACCESS ? [ACCESS] : ["private", "public"];

export async function save(pathname, body, contentType) {
  let last;
  for (const access of order()) {
    try {
      const r = await put(pathname, body, { access, contentType, addRandomSuffix: false, allowOverwrite: true });
      ACCESS = access;
      return r;
    } catch (e) { last = e; }
  }
  throw last;
}

export async function load(pathname) {
  let last;
  for (const access of order()) {
    try {
      const r = await get(pathname, { access, useCache: false });
      if (!r || !r.stream) return null;
      ACCESS = access;
      return { body: Buffer.from(await new Response(r.stream).arrayBuffer()), type: r.blob.contentType };
    } catch (e) { last = e; }
  }
  throw last;
}

export const remove = paths => del(paths);

export function fail(res, e) {
  console.error(e);
  res.status(500).json({ error: "store_unavailable", detail: String(e && e.message || e).slice(0, 300) });
}
