import { createClient } from '@supabase/supabase-js';
import { supabaseServer } from './supabase-server';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export const db = {
  // Users table operations
  users: {
    getById: async (id: string) => {
      const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    getByEmail: async (email: string) => {
      const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },

    getAll: async (role?: string) => {
      let query = supabaseServer.from('users').select('*');
      if (role) {
        query = query.eq('role', role);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    getByRole: async (role: string) => {
      const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('role', role);
      if (error) throw error;
      return data;
    },

    create: async (user: any) => {
      const { data, error } = await supabaseServer
        .from('users')
        .insert([user])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseServer
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabaseServer
        .from('users')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Appointments table operations
  appointments: {
    getById: async (id: string) => {
      const { data, error } = await supabaseServer
        .from('appointments')
        .select('*, patient:users!patient_id(*), doctor:users!doctor_id(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    getByPatientId: async (patientId: string, limit = 10, offset = 0) => {
      const { data, error, count } = await supabaseServer
        .from('appointments')
        .select('*, patient:users!patient_id(*), doctor:users!doctor_id(*)', { count: 'exact' })
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    },

    getByDoctorId: async (doctorId: string, limit = 10, offset = 0) => {
      const { data, error, count } = await supabaseServer
        .from('appointments')
        .select('*, patient:users!patient_id(*), doctor:users!doctor_id(*)', { count: 'exact' })
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    },

    getAll: async (limit = 10, offset = 0) => {
      const { data, error, count } = await supabaseServer
        .from('appointments')
        .select('*, patient:users!patient_id(*), doctor:users!doctor_id(*)', { count: 'exact' })
        .order('appointment_date', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    },

    checkAvailability: async (doctorId: string, appointmentDate: string, excludeId?: string) => {
      let query = supabaseServer
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', appointmentDate)
        .neq('status', 'cancelled');

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.limit(1);
      if (error) throw error;
      return !data || data.length === 0;
    },

    create: async (appointment: any) => {
      const { data, error } = await supabaseServer
        .from('appointments')
        .insert([appointment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseServer
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabaseServer
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Medical Records table operations
  medicalRecords: {
    getById: async (id: string) => {
      const { data, error } = await supabaseServer
        .from('medical_records')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    getByPatientId: async (patientId: string, limit = 10, offset = 0) => {
      const { data, error, count } = await supabaseServer
        .from('medical_records')
        .select('*', { count: 'exact' })
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    },

    getByDoctorId: async (doctorId: string, limit = 10, offset = 0) => {
      const { data, error, count } = await supabaseServer
        .from('medical_records')
        .select('*', { count: 'exact' })
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    },

    getAll: async (limit = 10, offset = 0) => {
      const { data, error, count } = await supabaseServer
        .from('medical_records')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    },

    create: async (record: any) => {
      const { data, error } = await supabaseServer
        .from('medical_records')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseServer
        .from('medical_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  // Prescriptions table operations
  prescriptions: {
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*, medication(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    getByPatientId: async (patientId: string) => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*, medication(*)')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getAll: async (limit = 1000, offset = 0) => {
      const { data, error, count } = await supabase
        .from('prescriptions')
        .select('*, medication(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    },

    create: async (prescription: any) => {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([prescription])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('prescriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  // Medications table operations
  medications: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (medication: any) => {
      const { data, error } = await supabase
        .from('medications')
        .insert([medication])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  // Payments table operations
  payments: {
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    getAll: async (limit = 10, offset = 0) => {
      const { data, error, count } = await supabase
        .from('payments')
        .select('*, patient:users!patient_id(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    },

    getByPatientId: async (patientId: string, limit = 10, offset = 0) => {
      const { data, error, count } = await supabase
        .from('payments')
        .select('*', { count: 'exact' })
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    },

    create: async (payment: any) => {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  // Departments table operations
  departments: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (department: any) => {
      const { data, error } = await supabase
        .from('departments')
        .insert([department])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },
};
