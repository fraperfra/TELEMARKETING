// src/pages/CalendarPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import itLocale from '@fullcalendar/core/locales/it';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { addMinutes, parseISO, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { AppointmentDetailModal } from '@/components/calendar/AppointmentDetailModal';
import { AppointmentBookingModal } from '@/components/scheduling/AppointmentBookingModal';
import { AvailabilitySettings } from '@/components/scheduling/AvailabilitySettings';
import { toast } from 'sonner';
import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: any;
}

export default function CalendarPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAvailabilitySettings, setShowAvailabilitySettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      loadAppointments();
      const unsubscribe = subscribeToChanges();
      return () => {
        unsubscribe?.();
      };
    }
  }, [profile]);

  // Auto-open appointment from URL param
  useEffect(() => {
    const appointmentId = searchParams.get('appointment');
    if (appointmentId && events.length > 0) {
      const appt = events.find(e => e.id === appointmentId);
      if (appt) {
        setSelectedAppointment(appt.extendedProps);
      }
    }
  }, [searchParams, events]);

  async function loadAppointments() {
    if (!profile || !supabase) return;

    setLoading(true);
    try {
      const start = startOfMonth(new Date());
      const end = endOfMonth(addMonths(new Date(), 1));

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          contact:contacts(id, name, phone, address, property_type),
          agent:users!agent_id(id, name, avatar_url),
          booked_by_user:users!booked_by(id, name)
        `)
        .eq('agent_id', profile.id)
        .gte('scheduled_for', start.toISOString())
        .lte('scheduled_for', end.toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      const formattedEvents: CalendarEvent[] = (data || []).map((appt: any) => {
        const startTime = parseISO(appt.scheduled_for);
        const endTime = addMinutes(startTime, appt.duration_minutes || 60);

        return {
          id: appt.id,
          title: appt.contact?.name || appt.title || 'Appuntamento',
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          backgroundColor: getStatusColor(appt.status),
          borderColor: getStatusColor(appt.status),
          extendedProps: {
            ...appt,
            contact: appt.contact,
            agent: appt.agent,
            bookedBy: appt.booked_by_user,
          },
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Errore nel caricamento appuntamenti');
    } finally {
      setLoading(false);
    }
  }

  function subscribeToChanges() {
    if (!profile || !supabase) return;

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

  function handleEventClick(info: EventClickArg) {
    setSelectedAppointment(info.event.extendedProps);
  }

  function handleDateSelect(info: DateSelectArg) {
    setSelectedDate(info.start);
    setShowBookingModal(true);
  }

  async function handleEventDrop(info: EventDropArg) {
    if (!supabase) return;

    const newStart = info.event.start;
    if (!newStart) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          scheduled_for: newStart.toISOString(),
        })
        .eq('id', info.event.id);

      if (error) throw error;

      toast.success('Appuntamento spostato');
      loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Errore nello spostamento');
      info.revert();
    }
  }

  async function handleEventResize(info: any) {
    if (!supabase) return;

    const newEnd = info.event.end;
    if (!newEnd) return;

    const durationMinutes = Math.round(
      (newEnd.getTime() - info.event.start.getTime()) / 60000
    );

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          duration_minutes: durationMinutes,
        })
        .eq('id', info.event.id);

      if (error) throw error;

      toast.success('Durata aggiornata');
      loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Errore nell\'aggiornamento');
      info.revert();
    }
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      scheduled: '#3b82f6',
      confirmed: '#10b981',
      rescheduled: '#f59e0b',
      completed: '#6b7280',
      cancelled: '#ef4444',
      no_show: '#dc2626',
    };
    return colors[status] || '#3b82f6';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario Appuntamenti</h1>
          <p className="text-gray-600 mt-1">
            {events.length} appuntamenti nei prossimi 2 mesi
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAvailabilitySettings(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Disponibilita
          </Button>
          <Button onClick={() => setShowBookingModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Appuntamento
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm flex-wrap">
            <span className="font-medium">Legenda:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span>Programmato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Confermato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span>Riprogrammato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-500" />
              <span>Completato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>Cancellato</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          {/* @ts-expect-error FullCalendar types incompatible with React 19 */}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={itLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            buttonText={{
              today: 'Oggi',
              month: 'Mese',
              week: 'Settimana',
              day: 'Giorno',
            }}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            slotDuration="00:30:00"
            allDaySlot={false}
            weekends={true}
            events={events}
            eventClick={handleEventClick}
            select={handleDateSelect}
            selectable={true}
            selectMirror={true}
            editable={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="auto"
            nowIndicator={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: '09:00',
              endTime: '18:00',
            }}
            eventContent={renderEventContent}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          open={!!selectedAppointment}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedAppointment(null);
              setSearchParams({});
            }
          }}
          onUpdate={loadAppointments}
        />
      )}

      <AppointmentBookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        onSuccess={loadAppointments}
        prefilledDate={selectedDate}
      />

      <AvailabilitySettings
        open={showAvailabilitySettings}
        onOpenChange={setShowAvailabilitySettings}
      />
    </div>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <div className="p-1 overflow-hidden">
      <div className="font-semibold text-xs truncate">
        {eventInfo.event.title}
      </div>
      <div className="text-xs opacity-90 truncate">
        {eventInfo.event.extendedProps.location || eventInfo.event.extendedProps.contact?.address}
      </div>
    </div>
  );
}
