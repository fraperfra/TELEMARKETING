import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Phone, Clock, CheckCircle, XCircle, PhoneForwarded } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface CallHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CallRecord {
  id: string;
  contact_id: string;
  outcome: string;
  duration_seconds: number;
  notes?: string;
  started_at: string;
  contact?: {
    name: string;
    phone: string;
  };
}

export function CallHistory({ open, onOpenChange }: CallHistoryProps) {
  const { profile } = useAuth();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && profile) {
      loadHistory();
    }
  }, [open, profile]);

  async function loadHistory() {
    if (!profile || !supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          id,
          contact_id,
          outcome,
          duration_seconds,
          notes,
          started_at,
          contact:contacts(name, phone)
        `)
        .eq('agent_id', profile.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCalls((data as CallRecord[]) || []);
    } catch (error) {
      console.error('Error loading call history:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'interested':
      case 'appointment':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'callback':
        return <PhoneForwarded className="w-4 h-4 text-amber-500" />;
      case 'not_interested':
      case 'wrong_number':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Phone className="w-4 h-4 text-gray-400" />;
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    const labels: Record<string, string> = {
      interested: 'Interessato',
      appointment: 'Appuntamento',
      callback: 'Richiama',
      not_interested: 'Non interessato',
      no_answer: 'Non risponde',
      busy: 'Occupato',
      wrong_number: 'Numero errato',
    };
    return labels[outcome] || outcome;
  };

  const getOutcomeColor = (outcome: string) => {
    const colors: Record<string, string> = {
      interested: 'bg-green-100 text-green-800',
      appointment: 'bg-blue-100 text-blue-800',
      callback: 'bg-amber-100 text-amber-800',
      not_interested: 'bg-red-100 text-red-800',
      no_answer: 'bg-gray-100 text-gray-800',
      busy: 'bg-orange-100 text-orange-800',
      wrong_number: 'bg-rose-100 text-rose-800',
    };
    return colors[outcome] || 'bg-gray-100 text-gray-800';
  };

  // Group calls by date
  const groupedCalls = calls.reduce((acc, call) => {
    const date = format(new Date(call.started_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(call);
    return acc;
  }, {} as Record<string, CallRecord[]>);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold">
                Storico Chiamate
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ultime {calls.length} chiamate effettuate
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : calls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessuna chiamata registrata</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedCalls).map(([date, dayCalls]: [string, CallRecord[]]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      {format(new Date(date), "EEEE d MMMM yyyy", { locale: it })}
                    </h3>
                    <div className="space-y-2">
                      {dayCalls.map((call) => (
                        <div
                          key={call.id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {/* Outcome Icon */}
                          <div className="flex-shrink-0">
                            {getOutcomeIcon(call.outcome)}
                          </div>

                          {/* Contact Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {call.contact?.name || 'Contatto sconosciuto'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {call.contact?.phone}
                            </p>
                          </div>

                          {/* Outcome Badge */}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getOutcomeColor(
                              call.outcome
                            )}`}
                          >
                            {getOutcomeLabel(call.outcome)}
                          </span>

                          {/* Duration & Time */}
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-3 h-3" />
                              {formatDuration(call.duration_seconds)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {format(new Date(call.started_at), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
