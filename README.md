# Rustamjon & Madinabonu — Qiz bazmi taklifnomasi

25-oktabr 2026, «Asr» to'yxonasi, Toshkent.

- Gullar bilan bezatilgan darvoza intro: muhr sinadi, eshiklar ochiladi, barglar uchadi
- Kalendar, taymer, xarita (Yandex, Google Maps)
- **Lahzalar:** mehmonlar bazmdan suratlarni yuklaydi, suratlarni faqat to'y egalari PIN bilan ko'radi
- **Kelasizmi?** anketasi, javoblar ham faqat to'y egalariga ko'rinadi

Rasmlar va javoblar **Vercel Blob** da saqlanadi. Supabase ham, boshqa server ham kerak emas.

## Vercel'ga joylash (5 daqiqa)

1. https://vercel.com/new sahifasida shu `bazm` repo'sini **Import** qiling. Framework: **Other**, boshqa hech narsani o'zgartirmang va **Deploy** ni bosing.
2. Loyiha ichida **Storage** bo'limida **Create Database** → **Blob** ni tanlang, keyin **Create** va **Connect** ni bosing. `BLOB_READ_WRITE_TOKEN` o'zi qo'shiladi.
3. **Settings → Environment Variables** bo'limida `HOST_PIN` qo'shing va to'y egalari PIN kodini yozing. Qo'shmasangiz, PIN `2510` bo'ladi.
4. **Deployments** bo'limida oxirgi deploy'ni **Redeploy** qiling, shunda yangi sozlamalar kuchga kiradi.

Tayyor bo'lgach, mehmonlarga `https://<loyiha>.vercel.app` havolasini yuborasiz.

**Suratlarni ko'rish:** sahifaning eng pastida **"To'y egalari uchun"** tugmasini bosing va PIN'ni kiriting.

## Tuzilishi
- `index.html`: butun sayt (dizayn, animatsiya, formalar)
- `api/upload.js`: suratni Vercel Blob'ga saqlaydi
- `api/rsvp.js`: "Kelasizmi?" javobini saqlaydi
- `api/host.js`: PIN'ni tekshiradi va suratlar bilan javoblarni qaytaradi
- `api/ping.js`: sahifa xotira ulanganini tekshirishi uchun

Sana va vaqt `index.html` ichidagi `CONFIG` blokida.
