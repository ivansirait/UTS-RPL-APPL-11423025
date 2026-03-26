# Microservices Mapping dari Monolith MediTrack

## Overview
Monolith dipecah menjadi 6 microservices independen: Auth, Appointment, EHR, Pharmacy, Analytics, Payment.

Setiap microservice memiliki:
- Database terpisah
- REST API untuk komunikasi sinkron
- Message queue untuk komunikasi asinkron
- Service discovery untuk lokasi dinamis

## Implementasi Kode
Struktur kode Spring Boot untuk setiap microservice dapat ditemukan di folder `../microservices/`.

### Struktur Folder:
```
microservices/
├── auth-service/
│   └── src/main/java/com/meditrack/auth/
│       ├── AuthApplication.java
│       └── AuthController.java
├── appointment-service/
│   └── src/main/java/com/meditrack/appointment/
│       ├── AppointmentApplication.java
│       └── AppointmentController.java
├── ehr-service/
├── pharmacy-service/
├── analytics-service/
└── payment-service/
```

## Mapping Detail

### 1. Auth Service (dari User Module)
- **Fungsi**: Manajemen pengguna, autentikasi
- **Database**: User DB (users table)
- **API Endpoints**:
  - POST /auth/register
  - POST /auth/login
  - GET /auth/users/{id}
- **Komunikasi**: Dipanggil oleh semua service lain untuk verifikasi user

### 2. Appointment Service
- **Fungsi**: Penjadwalan janji temu
- **Database**: Appointment DB (appointments table)
- **API Endpoints**:
  - POST /appointments/book
  - GET /appointments/{id}
  - PUT /appointments/{id}/status
- **Komunikasi**: 
  - Sinkron: Call Auth Service untuk verifikasi user
  - Asinkron: Publish event ke Message Queue saat appointment dibuat

### 3. EHR Service
- **Fungsi**: Electronic Health Records
- **Database**: EHR DB (medical_records table)
- **API Endpoints**:
  - POST /ehr/records
  - GET /ehr/records/{patientId}
- **Komunikasi**:
  - Sinkron: Call Auth Service untuk authorization
  - Asinkron: Subscribe ke appointment events untuk update records

### 4. Pharmacy Service
- **Fungsi**: Manajemen farmasi dan resep
- **Database**: Pharmacy DB (prescriptions, medications table)
- **API Endpoints**:
  - POST /pharmacy/prescriptions
  - GET /pharmacy/medications
- **Komunikasi**:
  - Sinkron: Call EHR Service untuk medical history
  - Asinkron: Publish prescription events

### 5. Analytics Service
- **Fungsi**: Analisis data kesehatan
- **Database**: Analytics DB (aggregated data)
- **API Endpoints**:
  - GET /analytics/appointments/count
  - GET /analytics/payments/total
- **Komunikasi**:
  - Subscribe ke semua events dari Message Queue
  - Sinkron: Call other services untuk real-time data

### 6. Payment Service
- **Fungsi**: Pemrosesan pembayaran
- **Database**: Payment DB (payments table)
- **API Endpoints**:
  - POST /payments/process
  - GET /payments/{id}
- **Komunikasi**:
  - Sinkron: Call Auth Service untuk user info
  - Asinkron: Publish payment events

## Komunikasi Pattern
- **Sinkron**: REST APIs dengan service discovery (Eureka/Consul)
- **Asinkron**: Message Queue (RabbitMQ/Kafka) untuk events
- **API Gateway**: Routing dan authentication untuk external requests
- **Circuit Breaker**: Resilience patterns untuk failure handling

## Database Migration
- Setiap service memiliki schema terpisah
- Data migration scripts untuk memindahkan data dari shared DB
- Eventual consistency untuk data yang saling terkait