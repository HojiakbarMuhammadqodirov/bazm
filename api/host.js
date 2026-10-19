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
    // O'chirish: { pin, del: { kind: "photo" | "rsvp", ids: [...] } }  (eski { id } ham ishlaydi)
    if (b.del) {
      const { kind } = b.del;
      const ids = [].concat(b.del.ids || b.del.id || []).map(String);
      if (!ids.length || ids.length > 300 || !ids.every(i => ID.test(i))) return res.status(400).json({ error: "invalid_request" });
      let paths;
      if (kind === "photo") {
        const photos = await Promise.all(ids.map(async id => {
          try { const f = await load(`meta/${id}.json`); return f ? JSON.parse(f.body.toString("utf8")).photo : null; } catch { return null; }
        }));
        paths = [...ids.map(id => `meta/${id}.json`), ...photos.filter(x => x && x.startsWith("moments/"))];
      } else if (kind === "rsvp") paths = ids.map(id => `rsvp/${id}.json`);
      else return res.status(400).json({ error: "invalid_request" });
      await remove(paths);
      return res.status(200).json({ ok: true, deleted: ids.length });
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
