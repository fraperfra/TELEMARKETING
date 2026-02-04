import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useAppointments() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadAppointments();
      subscribeToChanges();
    }
  }, [profile]);

  async function loadAppointments() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          contact:contacts(id, name, phone, address),
          agent:users!agent_id(id, name)
        `)
        .eq('agent_id', profile.id)
        .in('status', ['scheduled', 'confirmed'])
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToChanges() {
    if (!profile) return;

    const channel = supabase
      .channel(`appointments:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `agent_id=eq.${profile.id}`,
        },
        () => {
          loadAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  return {
    appointments,
    loading,
    refresh: loadAppointments,
  };
}
