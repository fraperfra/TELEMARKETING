import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/contexts/NotificationContext';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  scheduled_for: string;
  type: 'appointment' | 'callback' | 'follow_up' | 'task';
  status: 'pending' | 'completed' | 'dismissed';
  contact_id?: string;
  contact_name?: string;
  contact_phone?: string;
}

export function useReminders() {
  const { profile } = useAuth();
  const { addNotification } = useNotifications();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load reminders
  useEffect(() => {
    if (profile) {
      loadReminders();
      // Poll for reminders every minute
      const interval = setInterval(loadReminders, 60000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  const loadReminders = useCallback(async () => {
    if (!profile) return;

    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          contact:contacts(id, name, phone)
        `)
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .lte('scheduled_for', now)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      setReminders(
        data?.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          scheduled_for: r.scheduled_for,
          type: r.type,
          status: r.status,
          contact_id: r.contact?.id,
          contact_name: r.contact?.name,
          contact_phone: r.contact?.phone,
        })) || []
      );

      // Show notification for due reminders
      data?.forEach((reminder) => {
        addNotification({
          type: 'info',
          title: `Promemoria: ${reminder.title}`,
          message: reminder.description || '',
          duration: 8000,
          action: reminder.contact
            ? {
                label: 'Chiama',
                onClick: () => {
                  window.location.href = `/dialer?contact=${reminder.contact_id}`;
                },
              }
            : undefined,
        });
      });
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  }, [profile, addNotification]);

  const completeReminder = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from('reminders')
          .update({ status: 'completed' })
          .eq('id', id);

        if (error) throw error;

        setReminders((prev) => prev.filter((r) => r.id !== id));
        addNotification({
          type: 'success',
          title: 'Promemoria completato',
          message: 'Il promemoria è stato marcato come completato.',
          duration: 3000,
        });
      } catch (error) {
        console.error('Error completing reminder:', error);
        addNotification({
          type: 'error',
          title: 'Errore',
          message: 'Errore nel completare il promemoria.',
          duration: 5000,
        });
      }
    },
    [addNotification]
  );

  const dismissReminder = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from('reminders')
          .update({ status: 'dismissed' })
          .eq('id', id);

        if (error) throw error;

        setReminders((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error('Error dismissing reminder:', error);
      }
    },
    []
  );

  const createReminder = useCallback(
    async (reminder: Omit<Reminder, 'id' | 'status'> & { user_id?: string }) => {
      try {
        const { data, error } = await supabase
          .from('reminders')
          .insert([
            {
              ...reminder,
              user_id: reminder.user_id || profile?.id,
              status: 'pending',
            },
          ])
          .select()
          .single();

        if (error) throw error;

        addNotification({
          type: 'success',
          title: 'Promemoria creato',
          message: `Promemoria "${reminder.title}" creato con successo.`,
          duration: 3000,
        });

        return data;
      } catch (error) {
        console.error('Error creating reminder:', error);
        addNotification({
          type: 'error',
          title: 'Errore',
          message: 'Errore nella creazione del promemoria.',
          duration: 5000,
        });
        return null;
      }
    },
    [profile?.id, addNotification]
  );

  return {
    reminders,
    loading,
    completeReminder,
    dismissReminder,
    createReminder,
    refresh: loadReminders,
  };
}
