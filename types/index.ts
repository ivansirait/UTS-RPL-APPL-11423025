// User Types
export type UserRole = 'patient' | 'doctor' | 'admin' | 'pharmacist';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  profile_image_url?: string;
  specialization?: string; // For doctors
  license_number?: string; // For doctors
  department_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  description?: string;
  head_doctor_id?: string;
  phone?: string;
  email?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Appointment Types
export type AppointmentStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  duration_minutes: number;
  status: AppointmentStatus;
  reason_for_visit?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  patient?: User;
  doctor?: User;
}

// Medical Record Types
export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  past_medical_history?: string;
  medications?: string;
  allergies?: string;
  physical_examination?: string;
  lab_results?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  patient?: User;
  doctor?: User;
  appointment?: Appointment;
}

// Medication Types
export interface Medication {
  id: string;
  name: string;
  generic_name?: string;
  strength?: string;
  unit?: string; // mg, ml, etc.
  form?: string; // tablet, capsule, liquid, etc.
  manufacturer?: string;
  description?: string;
  price?: number;
  stock_quantity: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
}

// Prescription Types
export type PrescriptionStatus = 'active' | 'completed' | 'cancelled' | 'dispensed';

export interface Prescription {
  id: string;
  medical_record_id: string;
  medication_id: string;
  doctor_id: string;
  patient_id: string;
  dosage: string;
  frequency: string;
  duration_days?: number;
  quantity?: number;
  refills_allowed: number;
  refills_used: number;
  instructions?: string;
  status: PrescriptionStatus;
  created_at: string;
  updated_at: string;
  // Relations
  medication?: Medication;
  medical_record?: MedicalRecord;
  doctor?: User;
  patient?: User;
}

// Payment Types
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'insurance_claim';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  patient_id: string;
  appointment_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  transaction_id?: string;
  status: PaymentStatus;
  description?: string;
  created_at: string;
  updated_at: string;
  // Relations
  patient?: User;
  appointment?: Appointment;
}

// Authentication Types
export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  error?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  total_appointments: number;
  completed_appointments: number;
  pending_appointments: number;
  total_patients?: number; // For doctor
  total_revenue?: number; // For admin
  pending_payments?: number; // For admin
}
