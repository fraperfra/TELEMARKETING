import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell } from 'lucide-react';

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action_url?: string;
  created_at: string;
  read: boolean;
}

export function useAlerts() {
  const { profile, organization } = useAuth();
  const { addNotification } = useNotifications();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load alerts
  useEffect(() => {
    if (profile) {
      loadAlerts();
      subscribeToAlerts();
    }
  }, [profile]);

  const loadAlerts = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .or(`user_id.eq.${profile.id},organization_id.eq.${organization?.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setAlerts(data || []);
      setUnreadCount((data || []).filter((a) => !a.read).length);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAlerts = () => {
    const channel = supabase
      .channel(`alerts:${profile?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${profile?.id}`,
        },
        (payload) => {
          const newAlert = payload.new as Alert;
          setAlerts((prev) => [newAlert, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show notification
          addNotification({
            type: newAlert.type as 'warning' | 'error' | 'info',
            title: newAlert.title,
            message: newAlert.message,
            duration: 8000,
            action: newAlert.action_url
              ? {
                  label: 'Visualizza',
                  onClick: () => {
                    window.location.href = newAlert.action_url || '/';
                  },
                }
              : undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .or(`user_id.eq.${profile?.id},organization_id.eq.${organization?.id}`)
        .eq('read', false);

      if (error) throw error;

      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase.from('alerts').delete().eq('id', id);

      if (error) throw error;

      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    refresh: loadAlerts,
  };
}
