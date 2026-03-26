# Case Study 2: MediTrack Transformation

## 1. Use Case Berdasarkan Case Study

MediTrack adalah aplikasi kesehatan yang saat ini diimplementasikan sebagai aplikasi monolitik Java. Semua modul (User, Appointment, EHR, Pharmacy, Analytics, Payment) terintegrasi dalam satu codebase yang saling terikat erat. Perusahaan ingin mentransformasi ke arsitektur microservices untuk meningkatkan skalabilitas, maintainability, dan integrasi masa depan.

Use case utama:
- **Manajemen Pengguna**: Registrasi, login, dan manajemen profil pengguna (admin, dokter, pasien, apoteker).
- **Penjadwalan Janji Temu**: Pasien dapat memesan janji temu dengan dokter, dokter dapat mengelola jadwal.
- **EHR (Electronic Health Records)**: Penyimpanan dan akses rekam medis pasien.
- **Farmasi**: Manajemen obat, resep, dan inventori farmasi.
- **Pembayaran**: Pemrosesan pembayaran untuk layanan kesehatan.
- **Analytics**: Analisis data untuk wawasan kesehatan dan operasional.

Transformasi ini bertujuan untuk memisahkan modul-modul ini menjadi microservices independen yang dapat dikembangkan, di-deploy, dan diskalakan secara terpisah.

## 2. Architecture Diagram

### Monolithic Architecture
```mermaid
graph TD
    A[MediTrack Monolith] --> B[User Module]
    A --> C[Appointment Module]
    A --> D[EHR Module]
    A --> E[Pharmacy Module]
    A --> F[Analytics Module]
    A --> G[Payment Module]
    B --> H[Shared Database]
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
```

### Microservices Architecture
```mermaid
graph TD
    A[API Gateway] --> B[Auth Service]
    A --> C[Appointment Service]
    A --> D[EHR Service]
    A --> E[Pharmacy Service]
    A --> F[Analytics Service]
    A --> G[Payment Service]
    
    B --> H[User DB]
    C --> I[Appointment DB]
    D --> J[EHR DB]
    E --> K[Pharmacy DB]
    F --> L[Analytics DB]
    G --> M[Payment DB]
    
    C --> N[Message Queue]
    D --> N
    E --> N
    F --> N
    G --> N
    
    B --> O[Service Discovery]
    C --> O
    D --> O
    E --> O
    F --> O
    G --> O
```

Arsitektur baru mempertahankan fungsionalitas lama dengan memisahkan modul menjadi layanan independen, menggunakan API Gateway untuk routing, message queue untuk komunikasi asinkron, dan service discovery untuk lokasi layanan.

## 3. Reasoning & Trade-offs

### Reasoning
- **Skalabilitas**: Microservices memungkinkan penskalaan horizontal per modul berdasarkan beban.
- **Maintainability**: Kode terpisah memudahkan pengembangan dan debugging.
- **Integrasi Masa Depan**: Mudah menambahkan layanan baru tanpa mengganggu yang lain.
- **Technology Diversity**: Setiap microservice dapat menggunakan teknologi yang paling sesuai.

### Trade-offs
- **Deployment Complexity**: Lebih kompleks daripada monolith; memerlukan orchestration tools seperti Kubernetes.
- **Data Consistency**: Tantangan dalam konsistensi data lintas layanan; memerlukan patterns seperti saga atau event sourcing.
- **Network Latency**: Komunikasi antar layanan melalui jaringan lebih lambat daripada method calls internal.
- **Operational Overhead**: Monitoring, logging, dan debugging lebih rumit.

## 4. Migration Strategy

Menggunakan **Strangler Pattern** dengan pendekatan bertahap:

1. **Phase 1: Setup Infrastructure**
   - Buat API Gateway dan service discovery.
   - Siapkan database terpisah untuk setiap modul.

2. **Phase 2: Extract Independent Modules**
   - Mulai dengan modul yang paling sedikit dependensi (e.g., Auth, Payment).
   - Buat microservice baru dan proxy request dari monolith.

3. **Phase 3: Extract Interdependent Modules**
   - Ekstrak modul dengan dependensi (e.g., Appointment, EHR).
   - Gunakan message queue untuk komunikasi asinkron.

4. **Phase 4: Refactor and Optimize**
   - Hapus kode lama setelah semua modul diekstrak.
   - Implementasi circuit breaker dan retry mechanisms.

5. **Phase 5: Full Migration**
   - Deploy semua microservices dan decommission monolith.