import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useRealtimeRefetch } from './useRealtimeRefetch';

export interface StudentCertificate {
  id: string;
  studentName: string;
  level: string;
  fileUrl: string;
  createdAt: string;
}

export function useCertificates(studentName?: string | null) {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // Loading spinner only for the first load; realtime refetches stay silent.
  const initialised = useRef(false);

  const fetchCertificates = useCallback(async () => {
    try {
      if (!initialised.current) setLoading(true);
      let query = supabase
        .from('student_certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentName) {
        query = query.eq('student_name', studentName);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedCerts: StudentCertificate[] = data.map((cert) => ({
          id: cert.id,
          studentName: cert.student_name,
          level: cert.level,
          fileUrl: cert.file_url,
          createdAt: cert.created_at,
        }));
        setCertificates(formattedCerts);
      }
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching certificates:', err.message);
      toast({
        title: 'Gagal Memuat',
        description: 'Tidak dapat mengambil daftar sertifikat.',
        variant: 'destructive',
      });
    } finally {
      initialised.current = true;
      setLoading(false);
    }
  }, [studentName, toast]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useRealtimeRefetch('student_certificates', fetchCertificates, studentName || 'all');

  const addCertificate = async (cert: Omit<StudentCertificate, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('student_certificates')
        .insert({
          student_name: cert.studentName,
          level: cert.level,
          file_url: cert.fileUrl,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCert: StudentCertificate = {
          id: data.id,
          studentName: data.student_name,
          level: data.level,
          fileUrl: data.file_url,
          createdAt: data.created_at,
        };
        setCertificates([newCert, ...certificates]);
      }
      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error('Error adding certificate:', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteCertificate = async (id: string, fileName?: string) => {
    try {
      // Delete from DB
      const { error: dbError } = await supabase
        .from('student_certificates')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Delete from Storage if fileName exists
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('certificates')
          .remove([fileName]);
          
        if (storageError) {
           console.error('Note: File storage deletion failed but DB entry removed.', storageError);
        }
      }

      setCertificates(certificates.filter((c) => c.id !== id));
      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error('Error deleting certificate:', err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    certificates,
    loading,
    addCertificate,
    deleteCertificate,
    refresh: fetchCertificates,
  };
}
