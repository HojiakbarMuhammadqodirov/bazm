import { list } from "@vercel/blob";
import { readJson, pinOk, load, remove, fail } from "./_lib.js";

const ID = /^[0-9]+-[0-9a-f-]{36}$/;

async function listAll(prefix) {
  const out = []; let cursor;
  do {
    const r = await list({ prefix, cursor, limit: 1000 });
    out.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

async function readAll(blobs) {
  const out = []; let i = 0;
  const worker = async () => {
    while (i < blobs.length) {
      const b = blobs[i++];
      try { const f = await load(b.pathname); if (f) out.push(JSON.parse(f.body.toString("utf8"))); } catch { /* buzilgan yozuvni o'tkazib yuboramiz */ }
    }
  };
  await Promise.all(Array.from({ length: Math.min(12, blobs.length) }, worker));
  return out;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  let b;
  try { b = await readJson(req); } catch { return res.status(400).json({ error: "invalid_request" }); }
  if (!pinOk(b.pin)) {
    await new Promise(r => setTimeout(r, 600));
    return res.status(401).json({ error: "bad_pin" });
  }
  try {
    // O'chirish: { pin, del: { kind: "photo" | "rsvp", id } }
    if (b.del) {
      const { kind, id } = b.del;
      if (!ID.test(String(id))) return res.status(400).json({ error: "invalid_request" });
      if (kind === "photo") {
        const f = await load(`meta/${id}.json`);
        const photo = f ? JSON.parse(f.body.toString("utf8")).photo : null;
        await remove([`meta/${id}.json`, ...(photo && photo.startsWith("moments/") ? [photo] : [])]);
      } else if (kind === "rsvp") await remove([`rsvp/${id}.json`]);
      else return res.status(400).json({ error: "invalid_request" });
      return res.status(200).json({ ok: true });
    }
    const [metas, rsvps] = await Promise.all([listAll("meta/"), listAll("rsvp/")]);
    const [photos, answers] = await Promise.all([readAll(metas), readAll(rsvps)]);
    const k = encodeURIComponent(String(b.pin));
    res.status(200).json({
      photos: photos.filter(p => p.photo).map(p => ({ ...p, url: `/api/photo?p=${encodeURIComponent(p.photo)}&k=${k}` })),
      answers
    });
  } catch (e) { fail(res, e); }
}
