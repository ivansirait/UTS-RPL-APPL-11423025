// User Roles
export const USER_ROLES = ['patient', 'doctor', 'admin'] as const;

// Appointment Status
export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no-show'] as const;

// Prescription Status
export const PRESCRIPTION_STATUSES = ['active', 'completed', 'cancelled'] as const;

// Payment Status
export const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;

// Payment Methods
export const PAYMENT_METHODS = ['credit_card', 'debit_card', 'bank_transfer', 'cash'] as const;

// Gender Options
export const GENDERS = ['male', 'female', 'other'] as const;

// Medication Forms
export const MEDICATION_FORMS = ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'spray'] as const;

// Frequency Options
export const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
] as const;

// Duration Options (in days)
export const DURATIONS = [
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
] as const;

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Operation successful',
  ERROR: 'An error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Currency
export const CURRENCY = {
  DEFAULT: 'USD',
  SYMBOL: '$',
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
} as const;

// Dashboard Routes
export const DASHBOARD_ROUTES = {
  PATIENT: '/dashboard/patient',
  DOCTOR: '/dashboard/doctor',
  ADMIN: '/dashboard/admin',
} as const;

// Auth Routes
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
} as const;
