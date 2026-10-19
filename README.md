# Rustamjon & Madinabonu — Qiz bazmi taklifnomasi

25-oktabr 2026, «Asr» to'yxonasi, Toshkent.

- **Kirish:** gulli darvoza va "Taklifnomani ochish" tugmasi. Bosilganda darvoza ochilib, bog'ga kiriladi va musiqa yoqiladi
- "Assalomu alaykum!" bog' manzarasi: gulli ramka ichida ismlar va taklif matni
- "Sevgi lahzalari" karuseli (kelin-kuyov suratlari)
- Kalendar: kunlar to'lqin bo'lib belgilanadi, to'y kuni yulduzcha konfetti bilan ochiladi
- Taymer, manzil kartasi, sahifa ichidagi Yandex xarita va Yandex / Google Maps tugmalari
- **Lahzalar:** mehmonlar bazmdan suratlarni yuklaydi, suratlarni faqat to'y egalari PIN bilan ko'radi
- O'ng pastda ikki tugma: avtomatik aylantirish va musiqa

Rasmlar va javoblar **Vercel Blob** da saqlanadi. Supabase ham, boshqa server ham kerak emas.

## Vercel'ga joylash (5 daqiqa)

1. https://vercel.com/new sahifasida shu `bazm` repo'sini **Import** qiling. Framework: **Other**, boshqa hech narsani o'zgartirmang va **Deploy** ni bosing.
2. Loyiha ichida **Storage** bo'limida **Create Database** → **Blob** ni tanlang, keyin **Create** va **Connect** ni bosing. `BLOB_READ_WRITE_TOKEN` o'zi qo'shiladi.
3. **Settings → Environment Variables** bo'limida `HOST_PIN` qo'shing va to'y egalari PIN kodini yozing. Qo'shmasangiz, PIN `2510` bo'ladi.
4. **Deployments** bo'limida oxirgi deploy'ni **Redeploy** qiling, shunda yangi sozlamalar kuchga kiradi.

Tayyor bo'lgach, mehmonlarga `https://<loyiha>.vercel.app` havolasini yuborasiz.

**Suratlarni ko'rish:** `https://<loyiha>.vercel.app/#/mezbon` havolasini oching (yoki sahifa pastidagi **"To'y egalari uchun"** tugmasini bosing) va PIN'ni kiriting. Keraksiz surat yoki javobni shu yerdan o'chirish mumkin.

## Tuzilishi
- `index.html`: butun sayt (dizayn, animatsiya, sozlamalar)
- `api/upload.js`: suratni Vercel Blob'ga saqlaydi
- `api/rsvp.js`: (hozir ishlatilmaydi, anketa olib tashlangan)
- `api/host.js`: PIN'ni tekshiradi va suratlar bilan javoblarni qaytaradi
- `api/photo.js`: private suratlarni faqat PIN bilan beradi
- `api/ping.js`: sahifa xotira ulanganini tekshirishi uchun
- `music.m4a`: fon musiqasi (darvoza ochilganda chalinadi)

**Rasmlar (`img/`)**
- `gate-closed.webp`, `gate-open.webp`: kirish darvozasi va bog' manzarasi (videodagi yangi darvoza/saroy rasmlari kelganda shu nomlar bilan almashtiriladi)
- `gate-arch-hd.webp`, `gate-leaf-l-hd.webp`, `gate-leaf-r-hd.webp`, `gate-open-hd.webp`: ochiladigan darvoza va bog' manzarasi uchun `gate-closed.webp` / `gate-open.webp` dan tayyorlangan 2x o'tkir qatlamlar (darvoza rasmi almashsa, bular ham qaytadan tayyorlanadi)
- `frame-v.webp`: ismlar turadigan tik gulli ramka
- `divider.webp`: bo'limlar orasidagi gul chiziq
- `couple.webp`: ramkadan keyingi kelin-kuyov rasmi
- `photo-1.webp`, `photo-2.webp`, `photo-3.webp`: "Sevgi lahzalari" karuseli
- `rings.webp`: kalendardan keyingi uzuklar
- `doves.webp`: xaritadan keyingi kaptarlar
- `wreath.webp`: pastdagi gulchambar (ichida ismlar)

## Sozlamalar

`index.html` ichidagi `CONFIG` blokida:
- sana va vaqt (`date`), manzil koordinatalari (`lat`, `lng`) va Yandex havolasi (`yandex`)
- karusel suratlari (`storyPhotos`)
- `art: { rings, doves, wreath }`: bezak rasmlarining yo'li. Bo'sh qoldirilsa (`""`), o'sha joyda gul chiziq chiqadi
