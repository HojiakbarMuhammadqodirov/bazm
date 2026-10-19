import { put } from "@vercel/blob";
import { newId, header } from "./_lib.js";

// Rasm brauzerda siqiladi (~0.5–2 MB), shuning uchun Vercel'ning 4.5 MB chegarasiga sig'adi
export const config = { api: { bodyParser: false } };
const MAX = 4.4 * 1024 * 1024;
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const type = String(req.headers["content-type"] || "").split(";")[0].trim();
  if (!TYPES[type]) return res.status(415).json({ error: "unsupported_type" });

  const chunks = []; let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX) return res.status(413).json({ error: "too_large" });
    chunks.push(c);
  }
  if (!size) return res.status(400).json({ error: "empty" });

  const id = newId();
  const name = header(req, "x-name").slice(0, 60);
  const note = header(req, "x-note").slice(0, 400);
  try {
    const photo = await put(`moments/${id}.${TYPES[type]}`, Buffer.concat(chunks), { access: "public", contentType: type, addRandomSuffix: false });
    await put(`meta/${id}.json`, JSON.stringify({ id, url: photo.url, name, note, ts: Date.now() }), { access: "public", contentType: "application/json", addRandomSuffix: false });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "store_unavailable" });
  }
}
