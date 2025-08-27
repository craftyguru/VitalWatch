import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase config from server
let supabaseConfig: { supabaseUrl: string; supabaseAnonKey: string } | null = null;

async function getSupabaseConfig() {
  if (!supabaseConfig) {
    try {
      const response = await fetch('/api/config');
      supabaseConfig = await response.json();
    } catch (error) {
      console.error('Failed to load Supabase config:', error);
      throw new Error('Failed to load Supabase configuration');
    }
  }
  return supabaseConfig;
}

// Frontend Supabase client - initialized lazily
let supabaseClient: SupabaseClient | null = null;

export async function getSupabase(): Promise<SupabaseClient> {
  if (!supabaseClient) {
    const config = await getSupabaseConfig();
    if (!config) {
      throw new Error('Failed to get Supabase configuration');
    }
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }
  return supabaseClient;
}

// File upload utilities for frontend
export class ClientStorageService {
  // Upload profile image from frontend
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    const client = await getSupabase();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `avatars/${userId}/${fileName}`;
    
    const { data, error } = await client.storage
      .from('user-files')
      .upload(filePath, file, {
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload profile image: ${error.message}`);
    }

    return filePath;
  }

  // Upload document from frontend
  async uploadDocument(userId: string, file: File, category: string = 'documents'): Promise<string> {
    const client = await getSupabase();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${category}/${userId}/${fileName}`;
    
    const { data, error } = await client.storage
      .from('user-files')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    return filePath;
  }

  // Get public URL for file
  async getPublicUrl(bucket: string, filePath: string): Promise<string> {
    const client = await getSupabase();
    const { data } = client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Delete file from frontend
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const client = await getSupabase();
    const { error } = await client.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}

export const clientStorageService = new ClientStorageService();

// Real-time subscription helpers
export const subscribeToEmergencyAlerts = async (userId: string, callback: (payload: any) => void) => {
  const client = await getSupabase();
  return client
    .channel('emergency-alerts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'emergency_incidents',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};

export const subscribeToMoodUpdates = async (userId: string, callback: (payload: any) => void) => {
  const client = await getSupabase();
  return client
    .channel('mood-updates')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'mood_entries',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};