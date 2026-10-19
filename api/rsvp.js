import { put } from "@vercel/blob";
import { newId, readJson } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  let b;
  try { b = await readJson(req); } catch { return res.status(400).json({ error: "invalid_request" }); }
  const name = String(b.name || "").trim().slice(0, 80);
  if (!name) return res.status(400).json({ error: "invalid_request" });
  const answer = {
    name,
    going: !!b.going,
    guests: Math.max(1, Math.min(20, parseInt(b.guests, 10) || 1)),
    wish: String(b.wish || "").trim().slice(0, 600),
    ts: Date.now()
  };
  try {
    await put(`rsvp/${newId()}.json`, JSON.stringify(answer), { access: "public", contentType: "application/json", addRandomSuffix: false });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "store_unavailable" });
  }
}
