# Panduan Pembayaran & Pengiriman
## Toko Baju Online di Indonesia

**Dibuat:** Mei 2026
**Untuk:** Pemilik Toko — bahan bacaan untuk memahami opsi yang tersedia

---

# BAGIAN 1: PEMBAYARAN

## Cara Orang Indonesia Bayar Online

Indonesia punya ekosistem pembayaran digital paling beragam di Asia Tenggara. Ini penting dipahami karena kalau kamu tidak menyediakan metode pembayaran yang tepat, calon pembeli batal checkout.

### Metode Pembayaran yang Umum

| Metode | Seberapa Populer | Siapa yang Pakai | Cocok untuk Pesanan |
|--------|-----------------|------------------|-------------------|
| **QRIS** | Paling populer (~35-40%) | Semua umur, kota & desa | Rp 50rb - 500rb |
| **Transfer Bank (VA)** | Sangat populer (~25-30%) | Semua umur | Rp 100rb - 5jt |
| **E-Wallet** | Populer (~20-25%) | Anak muda 18-35 | Rp 20rb - 1jt |
| **Kartu Kredit/Debit** | Niche (~5-8%) | Urban, mampu | Rp 200rb+ |
| **Bayar di Minimarket** | Kecil (~3-5%) | Tidak punya rekening | Rp 50rb - 500rb |
| **Paylater/Cicilan** | Naik terus (~5-8%) | Usia 20-35, impulsif | Rp 200rb - 2jt |

### Apa Itu QRIS?

QRIS (Quick Response Code Indonesian Standard) adalah standar QR payment dari Bank Indonesia.

**Yang perlu kamu tahu:**
- **Satu QR untuk semua aplikasi.** Pembeli bisa scan pakai GoPay, OVO, DANA, ShopeePay, LinkAja, atau aplikasi bank manapun
- **Wajib sejak Januari 2023** — semua penyedia pembayaran harus support
- **Biaya rendah:** Biaya merchant (MDR) maksimal 0.7% per transaksi. Artinya kalau ada pesanan Rp 200.000, kamu cuma bayar Rp 1.400 sebagai fee
- **Uang masuk cepat:** Biasanya masuk ke rekening hari yang sama atau besoknya
- **Dynamic QR:** Untuk toko online, setiap pesanan dapat QR unik dengan nominal yang sudah terisi otomatis. Pembeli tinggal scan dan konfirmasi

**Contoh pengalaman pembeli:**
1. Klik "Bayar" di website kamu
2. Muncul popup pembayaran
3. Pilih "QRIS"
4. Muncul QR code di layar
5. Buka GoPay/OVO/DANA di HP
6. Scan QR
7. Konfirmasi di aplikasi
8. Selesai — total waktu sekitar 30 detik

### E-Wallet di Indonesia

| Wallet | Pemilik | Pengguna | Catatan |
|--------|---------|----------|---------|
| GoPay | GoTo (Gojek+Tokopedia) | 40 juta+ | Paling kuat di transport & food |
| OVO | Grab + Bank Nobu | 35 juta+ | Populer di retail |
| DANA | Ant Group | 30 juta+ | Kuat di peer-to-peer |
| ShopeePay | Sea Group (Shopee) | 30 juta+ | Dominan di e-commerce |
| LinkAja | Bank BUMN | 15 juta+ | Pembayaran pemerintah |

**Penting:** Semua e-wallet di atas bisa scan QRIS. Jadi cukup support QRIS = otomatis support semua e-wallet.

### Transfer Bank / Virtual Account (VA)

Virtual Account = nomor rekening sementara yang dibuat khusus untuk satu transaksi. Pembeli transfer ke nomor itu, dan sistem otomatis konfirmasi.

Bank yang didukung: BCA, BNI, BRI, Mandiri, Permata, CIMB Niaga, dll.

Ini masih metode paling dipercaya untuk pembelian di atas Rp 500.000 — terutama oleh generasi yang lebih tua.

### Bayar di Minimarket

Pembeli dapat kode pembayaran, lalu bayar tunai di:
- Alfamart
- Indomaret

Ini melayani orang yang belum punya rekening bank dan remaja.

### Paylater / Cicilan (BNPL)

Makin populer untuk fashion:
- **Kredivo** — BNPL mandiri terbesar
- **Akulaku** — populer untuk elektronik + fashion
- **GoPay Later** — terintegrasi Gojek
- **ShopeePay Later** — untuk pengguna Shopee

BNPL bisa meningkatkan nilai rata-rata pesanan 20-40% untuk toko baju. Orang lebih berani beli kalau bisa cicil.

---

## Payment Gateway: Perantara Pembayaran

Payment gateway adalah layanan yang menghubungkan website kamu dengan semua metode pembayaran di atas. Kamu hanya perlu integrasi ke SATU gateway, dan otomatis bisa terima pembayaran dari QRIS, transfer bank, e-wallet, kartu kredit, dll.

### Opsi 1: Midtrans (Rekomendasi)

**Pemilik:** GoTo Group (Gojek + Tokopedia)
**Website:** midtrans.com

**Kenapa Midtrans:**
- Payment gateway paling populer di Indonesia
- Satu integrasi = semua metode pembayaran
- Dokumentasi lengkap dalam Bahasa Indonesia
- Ada fitur "Snap" — popup pembayaran langsung di website kamu (pembeli tidak perlu pindah ke website lain)
- Ada sandbox (lingkungan testing) untuk mencoba tanpa uang sungguhan
- Berlisensi Bank Indonesia

**Metode yang didukung:**
- QRIS (semua wallet + bank)
- Kartu Kredit/Debit (Visa, Mastercard, JCB)
- Transfer Bank / VA (BCA, BNI, BRI, Mandiri, Permata, CIMB)
- E-Wallet (GoPay, ShopeePay)
- Minimarket (Alfamart, Indomaret)
- Paylater (Kredivo, Akulaku)

**Biaya Midtrans:**

| Metode | Biaya per Transaksi |
|--------|-------------------|
| QRIS | 0.7% |
| Transfer Bank / VA | Rp 4.000 flat |
| Kartu Kredit | 2.9% + Rp 2.000 |
| E-Wallet | 2% |
| Biaya bulanan | **Gratis** |
| Biaya setup | **Gratis** |

**Contoh:** Pesanan Rp 390.000 dibayar via QRIS → biaya Midtrans = Rp 2.730. Kamu terima Rp 387.270.

### Opsi 2: Xendit

**Website:** xendit.co
- API bagus untuk developer
- Kuat untuk B2B dan pembayaran berulang
- Multi-negara (Filipina, Vietnam, Thailand, Malaysia)
- Biaya sedikit lebih tinggi dari Midtrans untuk beberapa metode

### Opsi 3: Doku

**Website:** doku.com
- Payment gateway tertua di Indonesia (sejak 2007)
- Hubungan bank kuat
- Tapi dokumentasi kurang modern

### Rekomendasi

**Pakai Midtrans** karena:
1. Satu integrasi untuk SEMUA metode pembayaran
2. Popup Snap menjaga pembeli tetap di website kamu
3. Dokumentasi terbaik untuk developer Indonesia
4. Biaya QRIS paling rendah (0.7%)
5. Tidak ada biaya bulanan

---

## Cara Kerja Pembayaran (Dari Sisi Pembeli)

```
Pembeli klik "Bayar Sekarang"
    ↓
Muncul popup Midtrans Snap di layar
    ↓
Pembeli pilih metode: QRIS / Transfer Bank / E-Wallet / dll.
    ↓
┌─── Kalau QRIS: scan QR → konfirmasi di app → selesai (30 detik)
├─── Kalau VA: dapat nomor rekening → transfer via m-banking → selesai (2-5 menit)
├─── Kalau E-Wallet: redirect ke app → konfirmasi → selesai (30 detik)
└─── Kalau Minimarket: dapat kode → ke Alfamart/Indomaret → bayar → selesai (bisa kapan saja)
    ↓
Website otomatis update: "Pembayaran Berhasil!"
    ↓
Kamu (admin) terima email notifikasi: "Pesanan baru sudah dibayar!"
    ↓
Uang masuk ke rekening kamu (T+1 untuk QRIS, T+2 untuk VA)
```

## Cara Daftar Midtrans

1. Buka dashboard.midtrans.com
2. Daftar akun (gratis)
3. Kamu langsung dapat akses **Sandbox** untuk testing
4. Untuk terima pembayaran sungguhan, ajukan **akun Production**

**Syarat akun Production (KYC):**
- KTP pemilik usaha
- NIB / SIUP (kalau ada, tapi perorangan juga bisa)
- Nomor rekening bank untuk pencairan dana
- Website yang sudah live
- Proses approval biasanya 3-7 hari kerja

**Tips:** Kamu bisa mulai development dan testing dengan Sandbox sambil menunggu approval Production.

---

# BAGIAN 2: PENGIRIMAN

## Kurir di Indonesia

### Kurir Nasional (Reguler)

| Kurir | Kekuatan | Estimasi | Biaya (Jawa) | Biaya (Luar Jawa) |
|-------|----------|----------|-------------|-------------------|
| **JNE** | Paling dipercaya, jangkauan terluas | 2-7 hari | Rp 9rb - 25rb | Rp 20rb - 80rb |
| **J&T Express** | Cepat, fokus e-commerce | 2-5 hari | Rp 8rb - 22rb | Rp 18rb - 70rb |
| **SiCepat** | Sangat cepat, harga kompetitif | 1-4 hari | Rp 9rb - 24rb | Rp 19rb - 75rb |
| **Anteraja** | Kompetitif, backed by Tri | 2-5 hari | Rp 8rb - 22rb | Rp 18rb - 70rb |
| **TIKI** | Legacy, terpercaya | 2-7 hari | Rp 9rb - 25rb | Rp 20rb - 80rb |
| **Pos Indonesia** | Paling murah, milik negara | 5-14 hari | Rp 7rb - 15rb | Rp 12rb - 40rb |

*Biaya tergantung berat dan jarak. Angka di atas untuk paket ~500g.*

### Tipe Layanan

**Ekonomi (5-14 hari):**
- JNE OKE, Pos Indonesia Reguler
- Paling murah, untuk pembeli yang sabar
- Cocok untuk daerah terpencil

**Reguler (2-7 hari):**
- JNE REG, J&T EZ, SiCepat REG
- Standar untuk kebanyakan pesanan baju
- Keseimbangan harga dan kecepatan

**Express (1-2 hari):**
- JNE YES (Yakin Esok Sampai), J&T Express, SiCepat BEST
- 1.5-2x harga reguler
- Untuk pembeli yang mau bayar lebih

**Same-Day / Instan (hitungan jam):**
- GoSend Instant (1-2 jam), GoSend Same Day (6-8 jam)
- GrabExpress Instant, GrabExpress Same Day
- Hanya tersedia di kota yang sama
- Harga berdasarkan jarak (Rp 15rb - 50rb)

### Yang Diharapkan Pembeli Indonesia

Berdasarkan standar e-commerce Indonesia (Shopee, Tokopedia, dll.):

1. **Ongkir terlihat sebelum bayar** — pembeli ingin tahu total termasuk ongkir
2. **Pilihan kurir** — minimal JNE, J&T, SiCepat
3. **Nomor resi** — diberikan setelah kirim, bisa dilacak
4. **Gratis ongkir** — sangat umum dan jadi ekspektasi (contoh: "Gratis ongkir belanja di atas Rp 300.000")
5. **Estimasi waktu** — "sampai dalam 2-3 hari"

---

## RajaOngkir: API Cek Ongkir

### Apa Itu RajaOngkir?

RajaOngkir (rajaongkir.com) adalah layanan API paling populer di Indonesia untuk mengecek tarif pengiriman. Semua developer e-commerce Indonesia pakai ini.

**Cara kerja:**
1. Pembeli pilih kota tujuan
2. Website kirim data: kota asal + kota tujuan + berat paket
3. RajaOngkir balikin: daftar kurir beserta harga dan estimasi waktu
4. Pembeli pilih kurir yang diinginkan
5. Ongkir ditambahkan ke total pesanan

### Harga RajaOngkir

| Paket | Harga | Kurir | Fitur |
|-------|-------|-------|-------|
| Starter | **Gratis** | JNE, POS, TIKI saja | Cek ongkir dasar |
| Basic | **Rp 50.000/bulan** | + J&T, SiCepat, Anteraja, dll. | Level kecamatan, lacak resi |
| Pro | **Rp 150.000/bulan** | Semua kurir + internasional | Fitur lengkap |

**Rekomendasi:** Pakai **Basic** (Rp 50rb/bulan) karena J&T dan SiCepat itu wajib ada untuk toko online.

### Sistem Alamat Indonesia

Alamat di Indonesia punya hierarki:
```
Provinsi (34 provinsi)
  └── Kabupaten/Kota (~514)
      └── Kecamatan (~7.000)
          └── Kelurahan/Desa
```

RajaOngkir menghitung ongkir berdasarkan **Kota/Kabupaten**. Jadi yang perlu dipilih pembeli minimal adalah Provinsi dan Kota.

---

## Strategi Gratis Ongkir

Gratis ongkir adalah salah satu strategi marketing paling efektif di e-commerce Indonesia.

### Opsi 1: Gratis Ongkir dengan Minimum Pembelian
```
Belanja ≥ Rp 300.000 → Gratis ongkir
Belanja < Rp 300.000 → Bayar ongkir sendiri
```

**Pro:** Mendorong pembeli menambah barang untuk mencapai threshold.
**Con:** Kamu yang menanggung biaya ongkir.

### Opsi 2: Subsidi Ongkir (Hybrid)
```
Belanja ≥ Rp 200.000 → Kamu bayar ongkir sampai Rp 20.000
Sisanya ditanggung pembeli
```

**Pro:** Lebih terjangkau untuk kamu.
**Con:** Lebih rumit untuk dipahami pembeli.

### Opsi 3: Ongkir Flat Rate
```
Semua pengiriman = Rp 15.000
(Kamu tanggung selisihnya jika ongkir asli lebih mahal)
```

**Pro:** Sederhana, mudah dipahami.
**Con:** Rugi untuk pengiriman ke luar Jawa.

### Rekomendasi untuk Toko Baju

**Opsi 1** dengan threshold **Rp 300.000**. Karena:
- Rata-rata harga baju kamu Rp 165.000 - 225.000
- Pembeli butuh beli 2 item untuk dapat gratis ongkir
- Ini mendorong average order value naik
- Biasa dilakukan oleh brand fashion Indonesia

### Berapa Biaya Gratis Ongkir yang Kamu Tanggung?

Misalnya pembeli di Jakarta belanja Rp 390.000 (2 item), kirim ke Surabaya via JNE REG:
- Ongkir sebenarnya: ~Rp 18.000
- Kamu tanggung: Rp 18.000
- Revenue produk: Rp 390.000
- Net setelah ongkir: Rp 372.000

Itu masih margin yang sehat untuk fashion.

Tapi kalau kirim ke Papua:
- Ongkir sebenarnya: ~Rp 65.000
- Kamu tanggung: Rp 65.000
- Net setelah ongkir: Rp 325.000

Masih OK tapi perlu diperhitungkan. Beberapa toko membatasi gratis ongkir hanya untuk Jawa.

---

## Same-Day Delivery (GoSend / GrabExpress)

Kalau toko kamu di Jakarta dan pembeli juga di Jakarta, same-day delivery bisa jadi keunggulan kompetitif besar.

**Cara kerja:**
1. Pembeli pilih "Kirim Hari Ini" saat checkout
2. Setelah pembayaran, driver GoSend/Grab otomatis dikirim ke lokasi toko kamu
3. Driver ambil paket
4. Kirim ke alamat pembeli (1-3 jam)

**Biaya:** Rp 15.000 - 50.000 tergantung jarak.

**Syarat:**
- Toko dan pembeli harus di kota yang sama
- Hanya tersedia jam operasional (biasanya 07:00 - 21:00)
- Paket tidak boleh terlalu besar (< 5kg)

**Rekomendasi:** Tambahkan ini setelah kurir reguler sudah jalan lancar.

---

# BAGIAN 3: ALUR LENGKAP

## Perjalanan Pesanan dari Awal sampai Selesai

```
PEMBELI                              KAMU (ADMIN)
───────                              ────────────

1. Lihat-lihat produk di website
2. Tambah ke keranjang
3. Buka checkout
4. Isi nama, HP, email, alamat
5. Pilih provinsi & kota
6. Lihat opsi kurir & harga ongkir
7. Pilih kurir (misal JNE REG Rp 18.000)
8. Lihat total: Rp 390.000 + Rp 18.000 = Rp 408.000
   (atau Rp 390.000 kalau gratis ongkir)
9. Klik "Bayar Sekarang"
10. Popup Midtrans muncul
11. Pilih QRIS → scan → bayar
12. "Pembayaran Berhasil!"
13. Terima email konfirmasi              Terima email: "Pesanan baru #1234, sudah dibayar!"
                                     
                                     14. Buka admin panel → lihat pesanan baru
                                     15. Siapkan barang, packing
                                     16. Klik "Konfirmasi" → status jadi Dikonfirmasi
17. Terima email: "Pesanan dikonfirmasi"
                                     
                                     18. Kirim via JNE, dapat nomor resi
                                     19. Input resi di admin panel
                                     20. Klik "Kirim" → status jadi Dikirim
21. Terima email: "Pesanan dikirim"
    + nomor resi + link tracking
22. Lacak paket di website JNE
23. Paket sampai!
                                     24. Tandai "Selesai" di admin panel

SELESAI ✓
```

---

## Alur Uang

### Skenario 1: Pembeli Bayar Ongkir

```
Pembeli bayar: Rp 408.000 (produk Rp 390.000 + ongkir Rp 18.000)

Masuk ke rekening kamu dari Midtrans:
  Rp 408.000 - Rp 2.856 (biaya QRIS 0.7%) = Rp 405.144

Kamu bayar ke JNE:
  - Rp 18.000 (ongkir)

Keuntungan bersih dari produk:
  Rp 405.144 - Rp 18.000 = Rp 387.144
```

### Skenario 2: Gratis Ongkir

```
Pembeli bayar: Rp 390.000 (gratis ongkir)

Masuk ke rekening kamu dari Midtrans:
  Rp 390.000 - Rp 2.730 (biaya QRIS 0.7%) = Rp 387.270

Kamu bayar ke JNE:
  - Rp 18.000 (ongkir, dari kantong sendiri)

Keuntungan bersih dari produk:
  Rp 387.270 - Rp 18.000 = Rp 369.270
```

### Skenario 3: Transfer Bank

```
Pembeli bayar via BCA VA: Rp 408.000

Masuk ke rekening kamu dari Midtrans:
  Rp 408.000 - Rp 4.000 (biaya VA flat) = Rp 404.000

Kamu bayar ke JNE:
  - Rp 18.000

Keuntungan bersih: Rp 386.000
```

---

## Total Biaya Operasional Bulanan

| Layanan | Biaya Bulanan | Biaya per Transaksi |
|---------|--------------|-------------------|
| Vercel (hosting) | Gratis (Hobby plan) | — |
| Supabase (database) | Gratis (Free tier) | — |
| Resend (email) | Gratis (3.000 email/bulan) | — |
| RajaOngkir Basic | Rp 50.000 | — |
| Midtrans | Gratis | 0.7% (QRIS), Rp 4.000 (VA) |
| **Total biaya tetap** | **Rp 50.000/bulan** | **~0.7% per penjualan** |

**Ini sangat murah.** Biaya tetap hanya Rp 50.000/bulan, sisanya persentase kecil dari setiap penjualan.

Sebagai perbandingan:
- Jualan di Shopee: biaya admin 2-6% per transaksi
- Jualan di Tokopedia: biaya layanan 1-5% per transaksi
- Website sendiri (kamu): hanya ~0.7% per transaksi

---

# BAGIAN 4: LANGKAH-LANGKAH YANG PERLU KAMU LAKUKAN

## Yang Perlu Kamu Daftar

### 1. Midtrans (Pembayaran)
- **Buka:** dashboard.midtrans.com
- **Daftar:** Gratis, langsung dapat sandbox
- **Untuk Production:** Siapkan KTP + NIB/SIUP (opsional) + nomor rekening
- **Waktu approval:** 3-7 hari kerja
- **Tips:** Daftar sekarang karena ada waktu tunggu approval

### 2. RajaOngkir (Cek Ongkir)
- **Buka:** rajaongkir.com
- **Daftar:** Gratis (Starter) atau Rp 50.000/bulan (Basic)
- **Langsung aktif** setelah bayar
- **Tips:** Mulai dengan Starter (gratis) untuk testing, upgrade ke Basic saat go live

### 3. Resend — Domain Verification (Email)
- **Sudah punya akun** (yang sekarang dipakai)
- **Yang perlu dilakukan:** Verify domain custom supaya email bisa dikirim ke siapa saja (bukan hanya ke email kamu sendiri)
- **Caranya:** Resend Dashboard → Domains → Add Domain → Ikuti petunjuk DNS
- **Butuh:** Akses ke DNS settings domain kamu

## Urutan Implementasi yang Disarankan

### Fase 1: Pembayaran Dulu (Prioritas Tertinggi)
**Kenapa duluan:** Saat ini pesanan masuk tanpa pembayaran — admin harus konfirmasi manual via WhatsApp. Ini tidak scalable.

Yang dilakukan:
- Daftar Midtrans
- Integrasi Midtrans Snap ke checkout
- QRIS + Transfer Bank + E-Wallet langsung aktif
- Pengiriman masih manual (admin kirim sendiri, input resi manual)

**Hasil:** Pembeli bisa bayar langsung di website. Uang masuk otomatis.

### Fase 2: Ongkir Otomatis
**Kenapa kedua:** Menampilkan ongkir yang akurat meningkatkan kepercayaan dan mengurangi pertanyaan via WhatsApp.

Yang dilakukan:
- Daftar RajaOngkir
- Tambah pilihan provinsi/kota di checkout
- Tampilkan opsi kurir dan harga
- Gratis ongkir untuk pembelian di atas Rp 300.000

**Hasil:** Pembeli tahu total biaya sebelum bayar. Pengalaman seperti Shopee/Tokopedia.

### Fase 3: Resi & Tracking
Yang dilakukan:
- Admin bisa input nomor resi di panel
- Email otomatis kirim resi + link tracking ke pembeli

**Hasil:** Pembeli bisa lacak paket sendiri tanpa tanya via WhatsApp.

### Fase 4: Polish (Opsional, Setelah Stabil)
- Tambah opsi Paylater/Cicilan (Kredivo)
- Same-day delivery (GoSend/GrabExpress)
- Halaman tracking pesanan di website
- Notifikasi WhatsApp otomatis

---

# BAGIAN 5: PERTANYAAN YANG SERING MUNCUL

### "Berapa lama uang sampai ke rekening saya?"
- **QRIS:** T+1 (besok)
- **Transfer Bank/VA:** T+2 (2 hari kerja)
- **Kartu Kredit:** T+2
- Midtrans mencairkan ke rekening bank yang kamu daftarkan saat KYC.

### "Bagaimana kalau pembeli tidak bayar?"
- Untuk QRIS: QR code expired setelah 15 menit
- Untuk VA: nomor expired setelah 24 jam (bisa diatur)
- Pesanan otomatis dibatalkan, stok dikembalikan

### "Bagaimana kalau ada refund?"
- Kamu bisa proses refund melalui Midtrans Dashboard
- Untuk QRIS dan e-wallet: refund masuk dalam 1-3 hari
- Untuk transfer bank: refund manual ke rekening pembeli

### "Apakah perlu badan usaha (PT/CV)?"
- **Tidak wajib.** Midtrans menerima pendaftaran perorangan dengan KTP.
- Tapi kalau punya NIB/SIUP, proses approval lebih cepat.

### "Berapa minimal transaksi?"
- Midtrans: minimal Rp 10.000 per transaksi untuk QRIS
- Tidak ada minimal untuk VA/transfer bank

### "Bisa terima pembayaran dari luar negeri?"
- Kartu kredit Visa/Mastercard internasional sudah didukung
- Tapi fokus utama kamu adalah pasar lokal

### "Bagaimana dengan COD (Bayar di Tempat)?"
- Bisa ditambahkan, tapi **tidak direkomendasikan** untuk awal:
  - Risiko paket ditolak pembeli (kamu tetap bayar ongkir)
  - Rate penolakan COD di Indonesia cukup tinggi (10-20%)
  - Lebih baik dorong pembeli bayar online dulu

### "Kalau saya baru mulai dan pesanan masih sedikit, perlu semua ini?"
- **Fase 1 (Midtrans) sudah cukup untuk mulai.**
- Ongkir bisa manual dulu (WhatsApp ke pembeli berapa ongkirnya)
- Upgrade ke RajaOngkir saat pesanan mulai banyak dan kamu kewalahan hitung ongkir manual

---

# LAMPIRAN

## Link Penting

| Layanan | URL | Untuk Apa |
|---------|-----|-----------|
| Midtrans Dashboard | dashboard.midtrans.com | Kelola pembayaran |
| Midtrans Docs | docs.midtrans.com | Dokumentasi teknis |
| RajaOngkir | rajaongkir.com | API ongkir |
| Resend | resend.com | Email notifikasi |
| Supabase | supabase.com/dashboard | Database |
| Vercel | vercel.com/dashboard | Hosting |
| JNE Tracking | jne.co.id | Lacak paket JNE |
| J&T Tracking | jet.co.id | Lacak paket J&T |
| SiCepat Tracking | sicepat.com | Lacak paket SiCepat |

## Istilah

| Istilah | Arti |
|---------|------|
| QRIS | Standar QR payment dari Bank Indonesia |
| VA | Virtual Account — rekening sementara untuk pembayaran |
| MDR | Merchant Discount Rate — biaya per transaksi |
| Resi | Nomor tracking pengiriman |
| Ongkir | Ongkos Kirim |
| COD | Cash on Delivery — bayar di tempat |
| BNPL | Buy Now Pay Later — cicilan |
| Snap | Popup pembayaran Midtrans |
| KYC | Know Your Customer — verifikasi identitas |
| T+1 | Uang masuk 1 hari kerja setelah transaksi |
| Sandbox | Lingkungan testing (uang tidak sungguhan) |

---

*Dokumen ini adalah referensi perencanaan. Detail implementasi teknis akan disesuaikan saat development. Semua biaya dan harga bersifat perkiraan per Mei 2026.*
