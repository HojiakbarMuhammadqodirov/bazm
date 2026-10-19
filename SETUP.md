# Qiz bazmi taklifnomasi: sozlash

## Asosiy ma'lumotlar
`index.html` ichidagi `CONFIG` blokida:
- `date`: bazm sanasi va vaqti (hozir `2026-10-25 18:00`, Toshkent vaqti). Vaqt boshqacha bo'lsa, shu yerni o'zgartiring.
- `pinHash`: to'y egalari paneli PIN kodi. Hozirgi PIN: **2510**.
  Yangi PIN qo'yish: `echo -n 1234 | sha256sum` va chiqqan qatorni `pinHash` ga yozing.

## Rasm yuklash qayerda ishlaydi
1. **claude.ai artifact** sifatida: suratlar va javoblar artifactning o'z xotirasida saqlanadi, ularni faqat artifact egasi ko'radi.
   Cheklov: mehmon claude.ai'ga kirgan bo'lishi va tashkilotingiz a'zosi bo'lishi kerak. Oddiy mehmonlar uchun 2-variant kerak.
2. **Mustaqil sayt (Supabase bilan)**: istalgan mehmon login qilmasdan surat yuklaydi. Quyidagi qadamlar.
3. Hech narsa ulanmagan bo'lsa, sahifa "namuna rejimi"da ishlaydi (suratlar faqat shu brauzerda qoladi).

## Supabase ulash (bepul tarif yetadi)
1. supabase.com da yangi loyiha oching.
2. **Storage** bo'limida `moments` nomli **public** bucket yarating.
3. **SQL Editor** da quyidagini ishga tushiring (`2510` o'rniga o'z PIN kodingiz):

```sql
create table moments (id bigserial primary key, file text not null, name text, note text, created_at timestamptz default now());
create table rsvp (id bigserial primary key, name text, going boolean, guests int, wish text, created_at timestamptz default now());
create table host_pin (pin text primary key);
insert into host_pin values ('2510');

alter table moments enable row level security;
alter table rsvp enable row level security;
alter table host_pin enable row level security;
create policy "mehmon yozadi" on moments for insert to anon with check (true);
create policy "mehmon yozadi" on rsvp for insert to anon with check (true);

-- Mehmonlar faqat fayl yuklay oladi, ro'yxatni ko'ra olmaydi
create policy "mehmon yuklaydi" on storage.objects for insert to anon with check (bucket_id = 'moments');

create or replace function host_moments(p_pin text) returns setof moments
language sql security definer set search_path = public as $$
  select * from moments where exists (select 1 from host_pin where pin = p_pin) order by created_at desc $$;
create or replace function host_rsvp(p_pin text) returns setof rsvp
language sql security definer set search_path = public as $$
  select * from rsvp where exists (select 1 from host_pin where pin = p_pin) order by created_at desc $$;
grant execute on function host_moments(text), host_rsvp(text) to anon;
```

4. **Project Settings → API** dan `Project URL` va `anon public` kalitni olib, `CONFIG.supabase` ga yozing.
5. `dist/index.html` ni Netlify Drop, Vercel yoki GitHub Pages'ga yuklang va havolani mehmonlarga yuboring.

Fayl nomlari tasodifiy (UUID), ro'yxatni esa faqat to'g'ri PIN bilan olish mumkin, shuning uchun suratlarni begona odam topa olmaydi.
