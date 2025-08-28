import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SupabaseRecording {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl?: string;
    contentLength?: number;
    httpStatusCode?: number;
  };
}

interface ProcessedRecording {
  id: string;
  title: string;
  type: 'audio' | 'video' | 'emergency';
  size: string;
  duration: string;
  timestamp: Date;
  url?: string;
  isEmergency: boolean;
  bucket: string;
  path: string;
}

export function useSupabaseRecordings(userId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Fetch recordings from Supabase
  const { data: recordings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['supabase-recordings', userId],
    queryFn: async (): Promise<ProcessedRecording[]> => {
      const response = await fetch(`/api/recordings/list/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }
      return await response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get storage statistics
  const { data: storageStats } = useQuery({
    queryKey: ['storage-stats', userId],
    queryFn: async () => {
      const response = await fetch(`/api/recordings/stats/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch storage stats');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Download recording
  const downloadMutation = useMutation({
    mutationFn: async ({ recording }: { recording: ProcessedRecording }) => {
      setLoadingStates(prev => ({ ...prev, [`download-${recording.id}`]: true }));
      
      const response = await fetch(`/api/recordings/download/${userId}/${recording.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket: recording.bucket, path: recording.path })
      });

      if (!response.ok) {
        throw new Error('Failed to download recording');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = recording.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return recording.id;
    },
    onSuccess: (recordingId) => {
      setLoadingStates(prev => ({ ...prev, [`download-${recordingId}`]: false }));
      toast({
        title: "Download Started",
        description: "Recording is being downloaded to your device",
      });
    },
    onError: (error, { recording }) => {
      setLoadingStates(prev => ({ ...prev, [`download-${recording.id}`]: false }));
      toast({
        title: "Download Failed",
        description: "Unable to download recording. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete recording
  const deleteMutation = useMutation({
    mutationFn: async ({ recording }: { recording: ProcessedRecording }) => {
      setLoadingStates(prev => ({ ...prev, [`delete-${recording.id}`]: true }));
      
      const response = await fetch(`/api/recordings/delete/${userId}/${recording.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket: recording.bucket, path: recording.path })
      });

      if (!response.ok) {
        throw new Error('Failed to delete recording');
      }

      return recording.id;
    },
    onSuccess: (recordingId) => {
      setLoadingStates(prev => ({ ...prev, [`delete-${recordingId}`]: false }));
      queryClient.invalidateQueries({ queryKey: ['supabase-recordings', userId] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats', userId] });
      toast({
        title: "Recording Deleted",
        description: "Recording has been permanently removed from cloud storage",
      });
    },
    onError: (error, { recording }) => {
      setLoadingStates(prev => ({ ...prev, [`delete-${recording.id}`]: false }));
      toast({
        title: "Delete Failed",
        description: "Unable to delete recording. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Upload recording to Supabase
  const uploadMutation = useMutation({
    mutationFn: async ({ file, type, isEmergency = false }: { 
      file: Blob; 
      type: 'audio' | 'video' | 'emergency';
      isEmergency?: boolean;
    }) => {
      const formData = new FormData();
      const fileName = `${type}-${Date.now()}.${type === 'audio' ? 'webm' : 'mp4'}`;
      formData.append('file', file, fileName);
      formData.append('type', type);
      formData.append('isEmergency', isEmergency.toString());

      const response = await fetch(`/api/recordings/upload/${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-recordings', userId] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats', userId] });
      toast({
        title: "Upload Complete",
        description: "Recording has been securely stored in the cloud",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Unable to upload recording to cloud storage",
        variant: "destructive",
      });
    }
  });

  return {
    recordings,
    storageStats: storageStats || {
      totalFiles: 0,
      totalSize: 0,
      usedStorage: 0,
      availableStorage: 5 * 1024 * 1024 * 1024, // 5GB
      totalDuration: '0h 0m'
    },
    isLoading,
    error,
    loadingStates,
    downloadRecording: downloadMutation.mutate,
    deleteRecording: deleteMutation.mutate,
    uploadRecording: uploadMutation.mutate,
    refreshRecordings: refetch,
    isDownloading: (id: string) => loadingStates[`download-${id}`] || false,
    isDeleting: (id: string) => loadingStates[`delete-${id}`] || false,
    isUploading: uploadMutation.isPending,
  };
}