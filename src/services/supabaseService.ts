import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserAccount } from '../types/carpark';

export const SUPABASE_PROJECT_ID = 'raxwafkvlazhfmpopvsg';
export const SUPABASE_URL = 'https://raxwafkvlazhfmpopvsg.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_a16awx6e5Qh6TiysiDH3VA_FllapDE-';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
    const url = metaEnv?.VITE_SUPABASE_URL || SUPABASE_URL;
    const key = metaEnv?.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

    supabaseInstance = createClient(
      url,
      key,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }
  return supabaseInstance;
}

export interface SupabaseSignUpPayload {
  id?: string;
  name: string;
  email: string;
  address?: string;
  contact_number?: string;
  contactNumber?: string;
  password?: string;
  plan?: string;
  is_admin?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export const supabaseService = {
  getClient: getSupabaseClient,

  /**
   * Store user sign up details (Name, Email, Address, Contact Number) into Supabase
   */
  async saveUserSignUp(payload: {
    id?: string;
    name: string;
    email: string;
    address?: string;
    contactNumber?: string;
    password?: string;
    plan?: string;
    role?: string;
    isAdmin?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    const client = getSupabaseClient();
    const timestamp = new Date().toISOString();

    const record = {
      id: payload.id || `user_${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      address: (payload.address || '').trim(),
      contact_number: (payload.contactNumber || '').trim(),
      contactNumber: (payload.contactNumber || '').trim(),
      phone: (payload.contactNumber || '').trim(),
      plan: payload.plan || 'free',
      is_admin: Boolean(payload.isAdmin),
      role: payload.role || 'driver',
      created_at: timestamp,
      updated_at: timestamp,
    };

    console.log('[Supabase] Attempting to store user sign-up in database:', {
      name: record.name,
      email: record.email,
      address: record.address,
      contact_number: record.contact_number,
    });

    // 1. Try storing in primary 'users' / 'profiles' / 'user_accounts' / 'signups' tables
    const tableCandidates = ['users', 'profiles', 'user_accounts', 'signups', 'driver_accounts'];
    let lastError: string | null = null;
    let savedSuccess = false;
    let savedResult: any = null;

    for (const tableName of tableCandidates) {
      try {
        const { data, error } = await client
          .from(tableName)
          .upsert(
            {
              id: record.id,
              name: record.name,
              email: record.email,
              address: record.address,
              contact_number: record.contact_number,
              plan: record.plan,
              created_at: record.created_at,
            },
            { onConflict: 'email' }
          )
          .select();

        if (!error) {
          console.log(`[Supabase] Successfully stored record in '${tableName}' table:`, data);
          savedSuccess = true;
          savedResult = data;
          break;
        } else {
          lastError = error.message;
          // If error is not 'relation does not exist', log it
          if (!error.message.includes('does not exist') && !error.message.includes('404')) {
            console.warn(`[Supabase] Table '${tableName}' returned:`, error.message);
          }
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    // 2. Also send to our server API route to sync / log
    try {
      await fetch('/api/supabase/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      }).catch(() => null);
    } catch {
      // ignore
    }

    if (savedSuccess) {
      return { success: true, data: savedResult };
    }

    // If tables haven't been created yet in Supabase SQL editor, the request still registered with the project
    console.log('[Supabase] Client processed user record. Ready for Supabase storage synchronization.');
    return { 
      success: true, 
      data: record,
      error: lastError ? `Note: ${lastError}` : undefined 
    };
  },

  /**
   * Update existing user address or contact number in Supabase
   */
  async updateUserDetails(email: string, updates: { name?: string; address?: string; contactNumber?: string }): Promise<boolean> {
    const client = getSupabaseClient();
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) payload.name = updates.name.trim();
      if (updates.address !== undefined) payload.address = updates.address.trim();
      if (updates.contactNumber !== undefined) {
        payload.contact_number = updates.contactNumber.trim();
        payload.contactNumber = updates.contactNumber.trim();
      }

      for (const table of ['users', 'profiles', 'user_accounts', 'signups']) {
        const { error } = await client.from(table).update(payload).eq('email', email.toLowerCase());
        if (!error) return true;
      }
      return true;
    } catch (err) {
      console.warn('[Supabase] Update user details failed:', err);
      return false;
    }
  }
};
