import { pinOk, load, fail } from "./_lib.js";

// Private suratlarni faqat to'g'ri PIN bilan beradi
export default async function handler(req, res) {
  const u = new URL(req.url, "http://x");
  const p = u.searchParams.get("p") || "", k = u.searchParams.get("k") || "";
  if (!pinOk(k)) return res.status(401).json({ error: "bad_pin" });
  if (!/^moments\/[0-9]+-[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.test(p)) return res.status(400).json({ error: "invalid_request" });
  try {
    const f = await load(p);
    if (!f) return res.status(404).json({ error: "not_found" });
    res.setHeader("Content-Type", f.type || "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=86400");
    res.status(200).end(f.body);
  } catch (e) { fail(res, e); }
}
