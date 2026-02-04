import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Home,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AppointmentDetailModalProps {
  appointment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function AppointmentDetailModal({
  appointment,
  open,
  onOpenChange,
  onUpdate,
}: AppointmentDetailModalProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!supabase) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id);

      if (error) throw error;

      toast.success(`Stato aggiornato a "${getStatusLabel(newStatus)}"`);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Errore nell\'aggiornamento');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Programmato',
      confirmed: 'Confermato',
      rescheduled: 'Riprogrammato',
      completed: 'Completato',
      cancelled: 'Cancellato',
      no_show: 'Non presentato',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      rescheduled: 'bg-amber-100 text-amber-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!appointment) return null;

  const scheduledDate = parseISO(appointment.scheduled_for);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Dialog.Title className="text-xl font-semibold">
                  {appointment.title || 'Dettaglio Appuntamento'}
                </Dialog.Title>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {getStatusLabel(appointment.status)}
                </span>
              </div>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {format(scheduledDate, "EEEE d MMMM yyyy", { locale: it })}
                  </p>
                  <p className="text-gray-600">
                    {format(scheduledDate, "HH:mm")} - {appointment.duration_minutes} minuti
                  </p>
                </div>
              </div>

              {/* Contact */}
              {appointment.contact && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{appointment.contact.name}</p>
                    {appointment.contact.phone && (
                      <a
                        href={`tel:${appointment.contact.phone}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-4 h-4" />
                        {appointment.contact.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {appointment.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{appointment.location}</p>
                    {appointment.contact?.property_type && (
                      <p className="text-gray-600 flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        {appointment.contact.property_type}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {appointment.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{appointment.description}</p>
                </div>
              )}

              {/* Booking Info */}
              {appointment.bookedBy && (
                <div className="text-sm text-gray-500 border-t pt-4">
                  <p>
                    Prenotato da: {appointment.bookedBy.name}
                    {appointment.booking_method === 'auto_ai' && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                        Auto AI
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <div className="mt-6 pt-4 border-t flex flex-wrap gap-2">
                {appointment.status === 'scheduled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={loading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Conferma
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('completed')}
                  disabled={loading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completato
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('no_show')}
                  disabled={loading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Non presentato
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancella
                </Button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
