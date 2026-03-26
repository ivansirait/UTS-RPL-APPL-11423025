# MediTrack - Healthcare Management System

MediTrack adalah sistem manajemen kesehatan monolitik yang komprehensif yang dibangun dengan **Next.js 16** dan **Supabase PostgreSQL**. Platform ini menyediakan solusi lengkap untuk pasien, dokter, dan administrator dalam mengelola janji temu, catatan medis, resep, dan pembayaran.

## 🏥 Fitur Utama

### Untuk Pasien
- Penjadwalan dan manajemen janji temu
- Akses catatan medis lengkap
- Lihat resep aktif dan riwayat
- Kelola pembayaran dan tagihan
- Update profil pribadi

### Untuk Dokter
- Kelola jadwal janji temu
- Akses riwayat pasien lengkap
- Buat dan perbarui catatan medis
- Resepkan obat kepada pasien
- Kelola daftar pasien

### Untuk Administrator
- Manajemen pengguna sistem
- Pantau pembayaran dan pendapatan
- Kelola inventaris obat
- Kelola departemen
- Analitik dan laporan sistem

## 🛠️ Teknologi Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT + Bcrypt
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **Type Safety**: TypeScript

## 📦 Instalasi & Setup

### Prerequisites
- Node.js 18+
- npm atau pnpm
- Akun Supabase

### Langkah 1: Clone & Install Dependencies

```bash
# Clone project
git clone <repository-url>
cd meditrack

# Install dependencies
pnpm install
```

### Langkah 2: Setup Database

1. **Buat Supabase Project**:
   - Kunjungi [supabase.com](https://supabase.com)
   - Buat project baru
   - Copy URL dan API Key

2. **Jalankan Migration**:
   - Buka SQL Editor di Supabase
   - Copy dan paste isi file `scripts/01-init-schema.sql`
   - Jalankan query

3. **Setup Environment Variables**:
   Buat file `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Langkah 3: Jalankan Development Server

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Proyek

```
meditrack/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   ├── users/             # User management
│   │   ├── appointments/      # Appointment management
│   │   ├── medical-records/   # EHR system
│   │   ├── pharmacy/
│   │   │   ├── medications/   # Medication management
│   │   │   └── prescriptions/ # Prescription management
│   │   ├── payments/          # Payment processing
│   │   └── analytics/         # Analytics data
│   ├── auth/
│   │   ├── login/             # Login page
│   │   └── register/          # Registration page
│   ├── dashboard/
│   │   ├── patient/           # Patient dashboard
│   │   ├── doctor/            # Doctor dashboard
│   │   └── admin/             # Admin dashboard
│   ├── globals.css            # Global styles & theme
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── db.ts                  # Database utilities
│   ├── auth.ts                # Authentication utilities
│   ├── api.ts                 # API helpers
│   ├── validators.ts          # Zod validators
│   └── utils.ts               # General utilities
├── types/
│   └── index.ts               # TypeScript type definitions
├── scripts/
│   └── 01-init-schema.sql     # Database schema
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Create user (admin)
- `GET /api/users/[id]` - Get user profile
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (admin)

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/[id]` - Get appointment detail
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Delete appointment

### Medical Records
- `GET /api/medical-records` - Get medical records
- `POST /api/medical-records` - Create record
- `GET /api/medical-records/[id]` - Get record detail
- `PUT /api/medical-records/[id]` - Update record

### Pharmacy
- `GET /api/pharmacy/medications` - Get all medications
- `POST /api/pharmacy/medications` - Create medication
- `GET /api/pharmacy/medications/[id]` - Get medication detail
- `PUT /api/pharmacy/medications/[id]` - Update medication
- `GET /api/pharmacy/prescriptions` - Get prescriptions
- `POST /api/pharmacy/prescriptions` - Create prescription

### Payments
- `GET /api/payments` - Get payments
- `POST /api/payments` - Create payment
- `GET /api/payments/[id]` - Get payment detail
- `PUT /api/payments/[id]` - Update payment status

### Analytics
- `GET /api/analytics` - Get analytics data (admin)

## 🔑 Default Login Credentials

Untuk testing, Anda perlu membuat user terlebih dahulu melalui halaman `/auth/register`.

## 📝 Database Schema

Sistem menggunakan 7 tabel utama:
- **users** - User accounts (patients, doctors, admins)
- **departments** - Hospital departments
- **appointments** - Doctor-patient appointments
- **medical_records** - Electronic Health Records (EHR)
- **medications** - Medication inventory
- **prescriptions** - Medication prescriptions
- **payments** - Payment transactions

Setiap tabel dilengkapi dengan:
- Row Level Security (RLS) policies
- Proper foreign key constraints
- Timestamps (created_at, updated_at)
- Performance indices

## 🔒 Security Features

- Password hashing dengan bcrypt
- Secure HTTP-only cookies
- Row Level Security (RLS) pada semua tabel
- Input validation dengan Zod
- Role-based access control (RBAC)
- Parameterized queries untuk prevent SQL injection

## 🎨 Customization

### Theme Colors
Edit `app/globals.css` untuk mengubah warna tema:
- Primary: Warna utama sistem (default: blue)
- Secondary: Warna sekunder (default: teal)
- Destructive: Warna error/delete (default: red)

### Typography
Font dapat diatur di `app/layout.tsx` menggunakan Google Fonts.

## 📊 Development Status

- ✅ Database schema & migrations
- ✅ Authentication system
- ✅ User management
- ✅ Appointments module
- ✅ Medical records (EHR)
- ✅ Pharmacy system
- ✅ Payment system
- ✅ Dashboard UI (Patient/Doctor/Admin)
- ✅ Analytics API
- 🔄 Full CRUD pages for each module
- 🔄 Charts & visualizations
- 🔄 Email notifications
- 🔄 Advanced search & filters

## 📱 Responsive Design

Sistem dirancang mobile-first dan fully responsive:
- Smartphone (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

## 🚀 Deployment

### Deploy ke Vercel

1. Push code ke GitHub
2. Connect GitHub repository di [vercel.com](https://vercel.com)
3. Set environment variables di Vercel dashboard
4. Deploy automatically on push

```bash
# Deploy manually
npm run build
npm start
```

## 📞 Support & Documentation

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com

## 📄 License

MIT License - feel free to use this project for personal or commercial use.

## 🤝 Contributing

Contributions welcome! Please submit pull requests or issues.

---

**Built with 💙 using Next.js & Supabase**
