# MediTrack Setup Guide - Step by Step

Panduan lengkap untuk setup dan menjalankan MediTrack Healthcare Management System.

## Langkah 1: Persiapan Awal

### Sistem Requirements
- Node.js 18 atau lebih baru
- npm, yarn, atau pnpm package manager
- Git
- Akun Supabase (gratis di supabase.com)

### Verifikasi Instalasi
```bash
node --version    # Harus v18+
npm --version     # atau yarn/pnpm
```

## Langkah 2: Setup Database (Supabase)

### 2.1 Buat Supabase Project
1. Kunjungi https://supabase.com
2. Sign up atau login
3. Klik "New Project"
4. Isi detail:
   - Project Name: `meditrack`
   - Database Password: (copy untuk nanti)
   - Region: Pilih yang terdekat
5. Tunggu project selesai dibuat (±2 menit)

### 2.2 Dapatkan Credentials
1. Di dashboard Supabase, buka "Settings" → "API"
2. Copy:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2.3 Setup Database Schema
1. Di Supabase dashboard, buka "SQL Editor"
2. Klik "New Query"
3. Copy seluruh isi file `/scripts/01-init-schema.sql`
4. Paste ke editor
5. Klik "Run"
6. Tunggu sampai selesai

**Apa yang dibuat:**
- 7 tables: users, departments, appointments, medical_records, medications, prescriptions, payments
- Row Level Security (RLS) policies untuk keamanan
- Proper foreign keys dan constraints
- Performance indices untuk query cepat

## Langkah 3: Setup Project Lokal

### 3.1 Clone Repository
```bash
# Clone dari GitHub
git clone <repository-url> meditrack
cd meditrack
```

### 3.2 Install Dependencies
```bash
# Menggunakan pnpm (recommended)
pnpm install

# Atau menggunakan npm
npm install

# Atau menggunakan yarn
yarn install
```

### 3.3 Setup Environment Variables
Buat file `.env.local` di root directory:

```env
# Supabase Config
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ganti dengan values dari Langkah 2.2**

## Langkah 4: Jalankan Development Server

```bash
pnpm dev
```

Output akan seperti:
```
> next dev

  ▲ Next.js 16.2.0
  - Local:        http://localhost:3000
```

Buka http://localhost:3000 di browser.

## Langkah 5: Buat Akun Test

### Membuat User Pertama (Patient)
1. Klik "Register" di homepage
2. Isi form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Role: `Patient`
   - Password: `password123`
3. Klik "Create Account"
4. Anda akan di-redirect ke Patient Dashboard

### Membuat User Doctor
1. Logout terlebih dahulu
2. Klik "Register" lagi
3. Isi dengan:
   - Full Name: `Dr. Jane Smith`
   - Email: `jane@example.com`
   - Role: `Doctor`
   - Password: `password123`

### Membuat Admin User (via Supabase)
Untuk membuat admin, harus edit database secara langsung:

1. Buka Supabase → "SQL Editor" → "New Query"
2. Jalankan query ini:
```sql
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@example.com',
  '$2b$10$abc123...',  -- bcrypt hash dari "password123"
  'Admin User',
  'admin',
  true
);
```

**Cara generate bcrypt hash:**
- Gunakan online tool: https://bcrypt-generator.com/ (hanya untuk testing!)
- Hash: password123 → $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36qhvFm2

## Langkah 6: Explore Aplikasi

### Dashboard Pasien (Patient)
- URL: `http://localhost:3000/dashboard/patient`
- Fitur:
  - Lihat janji temu
  - Akses catatan medis
  - Lihat resep aktif
  - Kelola pembayaran

### Dashboard Dokter (Doctor)
- URL: `http://localhost:3000/dashboard/doctor`
- Fitur:
  - Kelola janji temu
  - Akses data pasien
  - Buat catatan medis
  - Berikan resep

### Dashboard Admin (Admin)
- URL: `http://localhost:3000/dashboard/admin`
- Fitur:
  - Kelola semua user
  - Pantau pembayaran
  - Kelola obat
  - Lihat analytics

## Langkah 7: API Testing

### Test Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test Get Appointments
```bash
curl -X GET http://localhost:3000/api/appointments \
  -H "Authorization: Bearer {user_id}"
```

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan file `.env.local` ada di root directory
- Periksa kembali NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
- Restart development server (`Ctrl+C` lalu `pnpm dev` lagi)

### Error: "Unable to connect to Supabase"
- Pastikan project Supabase sudah fully initialized
- Cek koneksi internet
- Verifikasi URL Supabase benar (harus include `.supabase.co`)

### Database Schema Errors
- Buka Supabase SQL Editor
- Jalankan query: `SELECT table_name FROM information_schema.tables;`
- Harusnya muncul 7 tables (users, appointments, dll)
- Jika tidak ada, jalankan kembali `01-init-schema.sql`

### Port 3000 sudah digunakan
```bash
# Gunakan port lain
pnpm dev -- -p 3001
```

## Langkah 8: Deploy ke Production

### Deploy ke Vercel (Recommended)

```bash
# Pastikan git repo ready
git add .
git commit -m "Initial MediTrack setup"
git push origin main

# Buka https://vercel.com
# Connect GitHub repo
# Set environment variables di Vercel dashboard
# Deploy!
```

### Environment Variables di Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Struktur Database

### Tabel Users
```sql
- id (UUID Primary Key)
- email (Unique)
- password_hash
- full_name
- role (patient, doctor, admin)
- phone, date_of_birth, gender
- is_active
- created_at, updated_at
```

### Tabel Appointments
```sql
- id (UUID)
- patient_id → users
- doctor_id → users
- appointment_date
- status (scheduled, completed, cancelled, no-show)
- reason_for_visit
```

### Tabel Medical_Records
```sql
- id (UUID)
- patient_id → users
- doctor_id → users
- chief_complaint, diagnosis, treatment_plan
- created_at, updated_at
```

### Tabel Medications
```sql
- id (UUID)
- name, strength, form
- stock_quantity, price
- created_at, updated_at
```

### Tabel Prescriptions
```sql
- id (UUID)
- medication_id → medications
- patient_id → users
- doctor_id → users
- dosage, frequency, duration_days
- status (active, completed, cancelled)
```

### Tabel Payments
```sql
- id (UUID)
- patient_id → users
- appointment_id → appointments (optional)
- amount, currency
- payment_method, payment_status
- created_at, updated_at
```

### Tabel Departments
```sql
- id (UUID)
- name, description
- head_doctor_id → users
- location
```

## Next Steps

1. **Customize**: Edit warna tema di `app/globals.css`
2. **Add Features**: Tambah halaman baru di `app/dashboard/*`
3. **Connect API**: Hubungkan frontend dengan API endpoints
4. **Add Validations**: Tingkatkan validasi form
5. **Email Integration**: Setup email untuk notifikasi

## Support

- Dokumentasi Next.js: https://nextjs.org/docs
- Dokumentasi Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com

## Tips & Best Practices

✅ **DO:**
- Backup database secara regular
- Gunakan git untuk version control
- Test di local sebelum deploy
- Gunakan environment variables untuk sensitive data
- Update dependencies secara berkala

❌ **DON'T:**
- Commit `.env.local` ke git
- Hardcode secrets dalam kode
- Deploy langsung ke production tanpa testing
- Ubah database schema manual di production
- Expose Supabase anon key ke public

---

**Selamat! MediTrack sudah siap digunakan!**

Untuk pertanyaan atau issues, buka GitHub issues atau hubungi support.
