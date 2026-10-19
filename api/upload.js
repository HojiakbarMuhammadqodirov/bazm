import { newId, header, save, fail } from "./_lib.js";

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

  const id = newId(), photo = `moments/${id}.${TYPES[type]}`;
  const meta = { id, photo, name: header(req, "x-name").slice(0, 60), note: header(req, "x-note").slice(0, 400), ts: Date.now() };
  try {
    await save(photo, Buffer.concat(chunks), type);
    await save(`meta/${id}.json`, JSON.stringify(meta), "application/json");
    res.status(200).json({ ok: true });
  } catch (e) { fail(res, e); }
}
