import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['patient', 'doctor', 'admin', 'pharmacist']).default('patient'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Appointment validators
export const appointmentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID').optional(),
  doctor_id: z.string().uuid('Invalid doctor ID'),
  appointment_date: z.string().datetime('Invalid date'),
  duration_minutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  reason_for_visit: z.string().min(3, 'Reason for visit must be at least 3 characters'),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  appointment_date: z.string().datetime('Invalid date').optional(),
  status: z.enum(['pending', 'scheduled', 'completed', 'cancelled', 'no-show']).optional(),
  notes: z.string().optional(),
});

// Medical Record validators
export const medicalRecordSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  doctor_id: z.string().uuid('Invalid doctor ID'),
  appointment_id: z.string().uuid('Invalid appointment ID').optional(),
  chief_complaint: z.string().min(5, 'Chief complaint must be at least 5 characters'),
  history_of_present_illness: z.string().optional(),
  past_medical_history: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  physical_examination: z.string().optional(),
  lab_results: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  notes: z.string().optional(),
});

// Prescription validators
export const prescriptionSchema = z.object({
  medical_record_id: z.string().uuid('Invalid medical record ID'),
  medication_id: z.string().uuid('Invalid medication ID'),
  doctor_id: z.string().uuid('Invalid doctor ID'),
  patient_id: z.string().uuid('Invalid patient ID'),
  dosage: z.string().min(2, 'Dosage is required'),
  frequency: z.string().min(2, 'Frequency is required'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day').optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
  refills_allowed: z.number().min(0, 'Refills cannot be negative').optional(),
  instructions: z.string().optional(),
});

export const prescriptionUpdateSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled', 'dispensed']).optional(),
  refills_used: z.number().min(0, 'Refills used cannot be negative').optional(),
  instructions: z.string().optional(),
});

// Medication validators
export const medicationSchema = z.object({
  name: z.string().min(2, 'Medication name is required'),
  generic_name: z.string().optional(),
  strength: z.string().optional(),
  unit: z.string().optional(),
  form: z.string().optional(),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').optional(),
  stock_quantity: z.number().min(0, 'Stock cannot be negative').optional(),
  reorder_level: z.number().min(0, 'Reorder level cannot be negative').optional(),
});

// Payment validators
export const paymentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  appointment_id: z.string().uuid('Invalid appointment ID').optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  payment_method: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'cash', 'insurance_claim']),
  description: z.string().optional(),
});

// User creation validators (for admin)
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters').optional(),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['patient', 'doctor', 'admin', 'pharmacist']),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  specialization: z.string().optional(),
  license_number: z.string().optional(),
  department_id: z.string().uuid('Invalid department ID').optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

// User update validators
export const userUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  specialization: z.string().optional(),
  license_number: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>;
export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
export type MedicationInput = z.infer<typeof medicationSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
