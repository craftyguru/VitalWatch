import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing required Supabase URL: SUPABASE_URL');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase key: SUPABASE_ANON_KEY');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing required Supabase service key: SUPABASE_SERVICE_KEY');
}

// Client for frontend operations (with anon key)
export const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client for backend operations (with service key)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// File upload service
export class SupabaseStorageService {
  private admin = supabaseAdmin;

  // Upload user profile image
  async uploadProfileImage(userId: string, file: Buffer, fileName: string): Promise<string> {
    const filePath = `avatars/${userId}/${fileName}`;
    
    const { data, error } = await this.admin.storage
      .from('user-files')
      .upload(filePath, file, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload profile image: ${error.message}`);
    }

    return filePath;
  }

  // Upload emergency audio recording
  async uploadEmergencyAudio(userId: string, incidentId: string, file: Buffer): Promise<string> {
    const filePath = `emergency/${userId}/incident-${incidentId}/audio-${Date.now()}.mp3`;
    
    const { data, error } = await this.admin.storage
      .from('emergency-files')
      .upload(filePath, file, {
        contentType: 'audio/mpeg'
      });

    if (error) {
      throw new Error(`Failed to upload emergency audio: ${error.message}`);
    }

    return filePath;
  }

  // Upload emergency photo
  async uploadEmergencyPhoto(userId: string, incidentId: string, file: Buffer, fileName: string): Promise<string> {
    const filePath = `emergency/${userId}/incident-${incidentId}/photos/${fileName}`;
    
    const { data, error } = await this.admin.storage
      .from('emergency-files')
      .upload(filePath, file, {
        contentType: 'image/jpeg'
      });

    if (error) {
      throw new Error(`Failed to upload emergency photo: ${error.message}`);
    }

    return filePath;
  }

  // Upload health report
  async uploadHealthReport(userId: string, file: Buffer, fileName: string): Promise<string> {
    const filePath = `reports/${userId}/${fileName}`;
    
    const { data, error } = await this.admin.storage
      .from('user-files')
      .upload(filePath, file, {
        contentType: 'application/pdf'
      });

    if (error) {
      throw new Error(`Failed to upload health report: ${error.message}`);
    }

    return filePath;
  }

  // Get signed URL for private file access
  async getSignedUrl(bucket: string, filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.admin.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  // Delete file
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await this.admin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // List user files
  async listUserFiles(userId: string, folder: string = ''): Promise<any[]> {
    const path = folder ? `${folder}/${userId}` : userId;
    
    const { data, error } = await this.admin.storage
      .from('user-files')
      .list(path);

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data || [];
  }
}

export const storageService = new SupabaseStorageService();