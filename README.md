# Prompt by Kenzz — Supabase version

## File project (semua harus berada di root repository)
- `index.html`
- `style.css`
- `script.js`
- `supabase-config.js`
- `supabase-auth-trigger.sql`
- `README.md`

## Yang sudah disambungkan
- Login email/password dan pendaftaran melalui Supabase Auth.
- Prompt pribadi baru disimpan ke tabel `public.prompts` setelah pengguna login.
- Prompt cloud milik pengguna dimuat saat login dan dapat dihapus oleh pemiliknya.
- Koleksi prompt bawaan dan generator tanpa AI API tetap tersedia.
- Publishable key digunakan pada frontend; tidak ada secret key dalam project.

## Yang harus dilakukan sekali di Supabase
1. Pastikan SQL schema awal yang membuat `profiles`, `prompts`, `prompt_favorites` dan RLS sudah berhasil dijalankan.
2. Buka SQL Editor dan jalankan isi `supabase-auth-trigger.sql` agar akun baru otomatis memiliki profil.
3. Buka Authentication → URL Configuration. Set Site URL ke URL GitHub Pages kamu dan tambahkan URL itu ke Redirect URLs. Contoh: `https://USERNAME.github.io/prompt-by-kenzz-v2/`.
4. Buka Authentication → Providers → Email. Tentukan apakah konfirmasi email diaktifkan. Jika aktif, konfirmasi email saat mendaftar.
5. Di Settings → API Keys, pastikan `supabase-config.js` berisi Project URL dan publishable key yang benar.

## Upload lewat Android
Upload/commit keenam file ini langsung ke root repository GitHub yang dipakai untuk website, bukan ZIP dan bukan folder bersarang. Jika diminta, pilih Replace untuk file lama dengan nama yang sama. Tunggu GitHub Pages selesai deploy lalu refresh website.

## Batasan saat ini
- Favorit prompt bawaan disimpan lokal. Favorit online saat ini hanya didukung untuk prompt database milik pengguna.
- Panel admin tidak menyediakan hak admin otomatis. Peran admin harus ditetapkan dan dibatasi secara manual di database sebelum membuat fungsi admin sensitif.
- Prompt buatan pengguna disimpan private (`is_public=false`). RLS dari schema awal wajib tetap aktif.
- Jangan pernah memasukkan `sb_secret_...`, `service_role`, atau password database ke file frontend. Publishable key boleh terlihat di browser, tetapi RLS tetap wajib.
