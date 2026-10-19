import { list } from "@vercel/blob";
import { readJson, pinOk } from "./_lib.js";

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
      try { out.push(await (await fetch(b.url, { cache: "no-store" })).json()); } catch { /* buzilgan yozuvni o'tkazib yuboramiz */ }
    }
  };
  await Promise.all(Array.from({ length: Math.min(16, blobs.length) }, worker));
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
    const [metas, rsvps] = await Promise.all([listAll("meta/"), listAll("rsvp/")]);
    const [photos, answers] = await Promise.all([readAll(metas), readAll(rsvps)]);
    res.status(200).json({ photos, answers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "store_unavailable" });
  }
}
