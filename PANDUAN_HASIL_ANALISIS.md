# Panduan Hasil Analisis Audit

Dokumen ini merangkum dan menstrukturkan **hasil audit** agar mudah dibaca, ditindaklanjuti, dan dipantau. Lengkapi setiap bagian dengan temuan audit terbaru.

## 1. Informasi Audit
- **Tanggal Audit**: _[isi tanggal]_
- **Tim/Penanggung Jawab**: _[isi nama/tim]_
- **Ruang Lingkup**:
  - **api-gateway** (Port 8000)
  - **commerce-service** (Port 3001)
  - **admin-service** (Port 4001)
  - **customer-service**
  - **storefront-web** (Port 3000)
  - **admin-web** (Port 4000)
- **Metode Audit**: _[contoh: code review, dependency check, config review, runtime probing]_
- **Sumber Data**: _[link laporan atau lokasi file audit]_

## 2. Cara Membaca Tingkat Risiko
| Level | Makna | SLA Tindak Lanjut |
|---|---|---|
| **Critical** | Dampak sangat tinggi, eksploitasi mudah/aktif | 24–48 jam |
| **High** | Dampak tinggi, butuh perbaikan cepat | 3–7 hari |
| **Medium** | Dampak sedang, perlu dijadwalkan | 1–4 minggu |
| **Low** | Dampak rendah, perbaiki saat ada waktu | Backlog |

## 3. Ringkasan Eksekutif
_Tulis ringkasan singkat (3–6 poin) mengenai kondisi umum dan temuan utama._

- _[temuan utama #1]_
- _[temuan utama #2]_
- _[temuan utama #3]_

## 4. Rekap Temuan (Ringkas)
| Kategori | Critical | High | Medium | Low | Catatan |
|---|---:|---:|---:|---:|---|
| Security | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |
| Reliability | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |
| Performance | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |
| Data Integrity | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |
| UX/Operational | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |

## 5. Temuan Detail per Layanan
Gunakan format konsisten agar mudah ditindaklanjuti.

### 5.1 api-gateway
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.2 commerce-service
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.3 admin-service
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.4 customer-service
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.5 storefront-web
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.6 admin-web
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

## 6. Rencana Tindak Lanjut
| Aksi | Prioritas | Owner | Target | Status |
|---|---|---|---|---|
| _[aksi #1]_ | _[Critical/High/Medium/Low]_ | _[nama/tim]_ | _[tanggal]_ | _[Open/In Progress/Done]_ |
| _[aksi #2]_ | _[Critical/High/Medium/Low]_ | _[nama/tim]_ | _[tanggal]_ | _[Open/In Progress/Done]_ |

## 7. Catatan & Risiko Residual
_Catat risiko yang belum bisa ditangani, dependensi eksternal, atau keputusan bisnis._

- _[catatan #1]_
- _[catatan #2]_

## 8. Lampiran (Opsional)
- Link ke laporan audit, bukti, atau hasil scanning.
