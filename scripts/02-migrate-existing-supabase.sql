-- MediTrack migration for existing Supabase databases
-- Adds appointment approval flow and keeps existing data intact

-- Add pending status to appointments if the constraint does not already allow it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.check_constraints
    WHERE constraint_name = 'appointments_status_check'
  ) THEN
    ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
  END IF;

  ALTER TABLE appointments
    ADD CONSTRAINT appointments_status_check
    CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'no-show'));
END $$;

-- Ensure the medical records table stays aligned with the current schema
ALTER TABLE medical_records
  ADD COLUMN IF NOT EXISTS lab_results TEXT;

-- Keep track of the new appointment workflow in existing projects
COMMENT ON TABLE appointments IS 'Appointment requests start as pending and can be accepted by doctors.';