import { useState, useEffect, type ChangeEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS = [
  { value: 1, label: 'Lunedi' },
  { value: 2, label: 'Martedi' },
  { value: 3, label: 'Mercoledi' },
  { value: 4, label: 'Giovedi' },
  { value: 5, label: 'Venerdi' },
  { value: 6, label: 'Sabato' },
  { value: 0, label: 'Domenica' },
];

interface AvailabilitySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvailabilitySettings({ open, onOpenChange }: AvailabilitySettingsProps) {
  const { profile } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && profile) {
      loadAvailability();
    }
  }, [open, profile]);

  async function loadAvailability() {
    if (!profile || !supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_availability')
        .select('*')
        .eq('agent_id', profile.id)
        .eq('is_exception', false)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSlots(data);
      } else {
        // Default availability: Mon-Fri 9-18
        setSlots([
          { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
          { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
          { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
          { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
          { day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true },
        ]);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }

  function addSlot() {
    setSlots([
      ...slots,
      { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
    ]);
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: keyof AvailabilitySlot, value: any) {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  }

  async function saveAvailability() {
    if (!profile || !supabase) return;

    setSaving(true);
    try {
      // Delete existing
      await supabase
        .from('agent_availability')
        .delete()
        .eq('agent_id', profile.id)
        .eq('is_exception', false);

      // Insert new
      const toInsert = slots.map((slot) => ({
        agent_id: profile.id,
        organization_id: profile.organization_id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_active: slot.is_active,
        is_exception: false,
      }));

      const { error } = await supabase.from('agent_availability').insert(toInsert);

      if (error) throw error;

      toast.success('Disponibilita salvata');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold">
                Imposta Disponibilita
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Configura gli orari in cui sei disponibile per gli appuntamenti.
                </p>

                {/* Slots */}
                <div className="space-y-3">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <select
                        value={slot.day_of_week}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          updateSlot(index, 'day_of_week', parseInt(e.target.value))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {DAYS.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>

                      <span className="text-gray-500">dalle</span>

                      <input
                        type="time"
                        value={slot.start_time}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateSlot(index, 'start_time', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />

                      <span className="text-gray-500">alle</span>

                      <input
                        type="time"
                        value={slot.end_time}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateSlot(index, 'end_time', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />

                      <label className="flex items-center gap-2 ml-auto">
                        <input
                          type="checkbox"
                          checked={slot.is_active}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => updateSlot(index, 'is_active', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">Attivo</span>
                      </label>

                      <button
                        onClick={() => removeSlot(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button type="button" variant="outline" onClick={addSlot}>
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Fascia Oraria
                </Button>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Annulla
                  </Button>
                  <Button onClick={saveAvailability} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Salva
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
