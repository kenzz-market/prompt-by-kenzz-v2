# Prompt by Kenzz

Website prompt library dan generator statis menggunakan HTML, CSS, dan JavaScript. Tidak memerlukan API atau proses build.

## Struktur file

```text
prompt-by-kenzz/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Fitur
- Koleksi prompt bawaan dan pencarian
- Filter kategori dan favorit
- Salin prompt
- Prompt generator lokal tanpa API
- Simpan prompt sendiri dan ekspor/impor backup JSON
- Login demo tanpa password
- Panel pengelolaan data lokal

## Penting soal login dan penyimpanan
GitHub Pages hanya meng-host file statis. Login pada versi ini hanya demo untuk personalisasi tampilan di browser, bukan autentikasi aman. Prompt buatan sendiri, favorit, dan sesi disimpan di `localStorage` browser/perangkat yang digunakan. Data tidak otomatis sinkron antarperangkat. Jangan menyimpan data rahasia. Untuk login sungguhan, sinkronisasi cloud, dan admin multi-pengguna diperlukan backend atau layanan autentikasi/database.

## Cara upload lewat HP Android
1. Ekstrak ZIP ini jika kamu mengunduh versi ZIP.
2. Buka GitHub di browser dan login ke akunmu.
3. Buat repository baru, misalnya `prompt-by-kenzz`.
4. Pilih **Public** (agar bisa dipublikasikan gratis lewat GitHub Pages) dan buat repository.
5. Di repository, tekan **Add file → Upload files**.
6. Upload `index.html`, `style.css`, `script.js`, dan `README.md` langsung ke root repository. Jangan upload ZIP sebagai pengganti file project.
7. Tekan **Commit changes**.
8. Buka **Settings → Pages**.
9. Pada **Build and deployment**, pilih **Deploy from a branch**; branch `main`, folder `/(root)`, lalu tekan **Save**.
10. Tunggu deployment selesai. Alamat situs biasanya `https://USERNAME.github.io/prompt-by-kenzz/`.
11. Jika belum muncul, tunggu beberapa menit lalu refresh. Pastikan `index.html` berada di root.

## Penggunaan
Buka `index.html` melalui website yang di-host untuk pengalaman terbaik. Generator membuat template prompt berdasarkan isian; karena tanpa API, ia tidak memanggil model AI eksternal.
