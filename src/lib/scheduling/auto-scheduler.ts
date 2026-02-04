// src/lib/scheduling/auto-scheduler.ts
import { supabase } from '@/lib/supabase';
import { addDays, addMinutes, addHours, format, setHours, setMinutes, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export interface SchedulingRequest {
  contactId: string;
  agentId: string;
  preferredTimeframe?: 'morning' | 'afternoon' | 'evening';
  urgency?: 'urgent' | 'normal';
  duration?: number;
}

export interface TimeSlot {
  datetime: Date;
  formatted: string;
  isFree: boolean;
}

export class AutoScheduler {
  async findNextAvailableSlot(
    agentId: string,
    durationMinutes: number = 60,
    preferredTimeframe?: 'morning' | 'afternoon' | 'evening',
    searchFromDate?: Date
  ): Promise<Date | null> {
    if (!supabase) return null;

    const startDate = searchFromDate || new Date();

    // 1. Carica disponibilità
    const { data: availability, error: availError } = await supabase
      .from('agent_availability')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true });

    if (availError || !availability?.length) {
      console.error('No availability configured');
      return null;
    }

    // 2. Carica appuntamenti esistenti
    const endDate = addDays(startDate, 14);
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('scheduled_for, duration_minutes')
      .eq('agent_id', agentId)
      .in('status', ['scheduled', 'confirmed'])
      .gte('scheduled_for', startDate.toISOString())
      .lte('scheduled_for', endDate.toISOString());

    // 3. Cerca primo slot libero
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const checkDate = addDays(startDate, dayOffset);
      const dayOfWeek = checkDate.getDay();

      const dayAvailability = availability.filter(
        (a: any) => a.day_of_week === dayOfWeek && !a.is_exception
      );

      // Check eccezioni
      const { data: exceptions } = await supabase
        .from('agent_availability')
        .select('*')
        .eq('agent_id', agentId)
        .eq('is_exception', true)
        .eq('exception_date', format(checkDate, 'yyyy-MM-dd'));

      if (exceptions?.length) continue;

      for (const slot of dayAvailability) {
        if (preferredTimeframe) {
          const slotStartHour = parseInt(slot.start_time.split(':')[0]);
          if (preferredTimeframe === 'morning' && slotStartHour >= 12) continue;
          if (preferredTimeframe === 'afternoon' && (slotStartHour < 12 || slotStartHour >= 18)) continue;
          if (preferredTimeframe === 'evening' && slotStartHour < 18) continue;
        }

        const timeSlots = this.generateTimeSlots(
          checkDate,
          slot.start_time,
          slot.end_time,
          30
        );

        for (const potentialSlot of timeSlots) {
          if (potentialSlot < new Date()) continue;

          const slotEnd = addMinutes(potentialSlot, durationMinutes);
          const [endHour, endMin] = slot.end_time.split(':').map(Number);
          const availabilityEnd = setMinutes(setHours(checkDate, endHour), endMin);

          if (slotEnd > availabilityEnd) continue;

          const isFree = !existingAppointments?.some((appt: any) => {
            const apptStart = parseISO(appt.scheduled_for);
            const apptEnd = addMinutes(apptStart, appt.duration_minutes || 60);
            return (
              (potentialSlot >= apptStart && potentialSlot < apptEnd) ||
              (slotEnd > apptStart && slotEnd <= apptEnd) ||
              (potentialSlot <= apptStart && slotEnd >= apptEnd)
            );
          });

          if (isFree) return potentialSlot;
        }
      }
    }

    return null;
  }

  async findMultipleSlots(
    agentId: string,
    count: number = 3,
    durationMinutes: number = 60,
    preferredTimeframe?: 'morning' | 'afternoon' | 'evening'
  ): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    let searchDate = new Date();

    while (slots.length < count) {
      const slot = await this.findNextAvailableSlot(
        agentId,
        durationMinutes,
        preferredTimeframe,
        searchDate
      );

      if (!slot) break;

      slots.push({
        datetime: slot,
        formatted: format(slot, "EEEE d MMMM 'alle' HH:mm", { locale: it }),
        isFree: true,
      });

      searchDate = addHours(slot, 2);
    }

    return slots;
  }

  async bookAppointment(request: SchedulingRequest): Promise<any> {
    if (!supabase) throw new Error('Supabase not configured');

    const slot = await this.findNextAvailableSlot(
      request.agentId,
      request.duration || 60,
      request.preferredTimeframe
    );

    if (!slot) throw new Error('No available slot found');

    const { data: contact } = await supabase
      .from('contacts')
      .select('*, campaigns(organization_id)')
      .eq('id', request.contactId)
      .single();

    if (!contact) throw new Error('Contact not found');

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        organization_id: contact.campaigns.organization_id,
        contact_id: request.contactId,
        agent_id: request.agentId,
        booked_by: request.agentId,
        title: `Sopralluogo - ${contact.name || 'Venditore'}`,
        description: `Valutazione immobile in ${contact.address || ''}`,
        scheduled_for: slot.toISOString(),
        duration_minutes: request.duration || 60,
        location: contact.address,
        status: 'scheduled',
        booking_method: 'auto_ai',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('contacts')
      .update({
        call_status: 'appointment_booked',
        appointment_id: appointment.id,
      })
      .eq('id', request.contactId);

    return appointment;
  }

  private generateTimeSlots(
    date: Date,
    startTime: string,
    endTime: string,
    intervalMinutes: number
  ): Date[] {
    const slots: Date[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let current = setMinutes(setHours(new Date(date), startHour), startMin);
    const end = setMinutes(setHours(new Date(date), endHour), endMin);

    while (current < end) {
      slots.push(new Date(current));
      current = addMinutes(current, intervalMinutes);
    }

    return slots;
  }
}

export const autoScheduler = new AutoScheduler();
