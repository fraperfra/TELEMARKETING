import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { autoScheduler } from '@/lib/scheduling/auto-scheduler';
import { toast } from 'sonner';

const bookingSchema = z.object({
  contactName: z.string().min(1, 'Nome richiesto'),
  contactPhone: z.string().min(1, 'Telefono richiesto'),
  address: z.string().min(1, 'Indirizzo richiesto'),
  date: z.string().min(1, 'Data richiesta'),
  time: z.string().min(1, 'Ora richiesta'),
  duration: z.number().min(15).max(480),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface AppointmentBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  prefilledDate?: Date;
  contactId?: string;
}

export function AppointmentBookingModal({
  open,
  onOpenChange,
  onSuccess,
  prefilledDate,
  contactId,
}: AppointmentBookingModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: prefilledDate ? format(prefilledDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: '10:00',
      duration: 60,
    },
  });

  const handleFindSlots = async () => {
    if (!profile) return;

    setLoadingSlots(true);
    try {
      const slots = await autoScheduler.findMultipleSlots(profile.id, 5, 60);
      setSuggestedSlots(slots);

      if (slots.length === 0) {
        toast.info('Nessuno slot disponibile trovato');
      }
    } catch (error) {
      console.error('Error finding slots:', error);
      toast.error('Errore nella ricerca slot');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectSlot = (slot: any) => {
    setValue('date', format(slot.datetime, 'yyyy-MM-dd'));
    setValue('time', format(slot.datetime, 'HH:mm'));
    setSuggestedSlots([]);
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!profile || !supabase) return;

    setLoading(true);
    try {
      const scheduledFor = new Date(`${data.date}T${data.time}`);

      const { error } = await supabase.from('appointments').insert({
        organization_id: profile.organization_id,
        agent_id: profile.id,
        booked_by: profile.id,
        title: `Appuntamento - ${data.contactName}`,
        description: data.notes,
        scheduled_for: scheduledFor.toISOString(),
        duration_minutes: data.duration,
        location: data.address,
        status: 'scheduled',
        booking_method: 'manual',
      });

      if (error) throw error;

      toast.success('Appuntamento creato con successo');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Errore nella creazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold">
                Nuovo Appuntamento
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Contatto *
                  </label>
                  <input
                    {...register('contactName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mario Rossi"
                  />
                  {errors.contactName && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono *
                  </label>
                  <input
                    {...register('contactPhone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+39 333 1234567"
                  />
                  {errors.contactPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactPhone.message}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indirizzo *
                </label>
                <input
                  {...register('address')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Via Roma 123, Milano"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              {/* AI Slot Finder */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Trova slot disponibili
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFindSlots}
                    disabled={loadingSlots}
                  >
                    {loadingSlots ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Cerca'
                    )}
                  </Button>
                </div>

                {suggestedSlots.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {suggestedSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        className="w-full text-left px-3 py-2 bg-white rounded border hover:border-purple-500 transition-colors text-sm"
                      >
                        {slot.formatted}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    {...register('date')}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    max={format(addDays(new Date(), 90), 'yyyy-MM-dd')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ora *
                  </label>
                  <input
                    type="time"
                    {...register('time')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durata (min)
                  </label>
                  <select
                    {...register('duration', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={30}>30 min</option>
                    <option value={60}>1 ora</option>
                    <option value={90}>1.5 ore</option>
                    <option value={120}>2 ore</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Note aggiuntive..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Crea Appuntamento
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
