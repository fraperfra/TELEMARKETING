import { addDays, addMinutes, format, isBefore, setHours, setMinutes } from 'date-fns';
import type { ScheduleSlot, Appointment } from '../../types';

// Re-export auto-scheduler
export { AutoScheduler, autoScheduler, type SchedulingRequest, type TimeSlot } from './auto-scheduler';

export interface SchedulerConfig {
  workDayStart: number; // Hour (e.g., 9 for 9:00 AM)
  workDayEnd: number; // Hour (e.g., 18 for 6:00 PM)
  slotDuration: number; // Minutes
  breakStart?: number; // Hour for lunch break start
  breakEnd?: number; // Hour for lunch break end
  workDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}

const DEFAULT_CONFIG: SchedulerConfig = {
  workDayStart: 9,
  workDayEnd: 18,
  slotDuration: 30,
  breakStart: 13,
  breakEnd: 14,
  workDays: [1, 2, 3, 4, 5], // Monday to Friday
};

/**
 * Generate available time slots for a date range
 */
export const generateTimeSlots = (
  startDate: Date,
  endDate: Date,
  existingAppointments: Appointment[],
  config: SchedulerConfig = DEFAULT_CONFIG
): ScheduleSlot[] => {
  const slots: ScheduleSlot[] = [];
  let currentDate = startDate;

  while (isBefore(currentDate, endDate) || format(currentDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
    const dayOfWeek = currentDate.getDay();

    // Skip non-work days
    if (!config.workDays.includes(dayOfWeek)) {
      currentDate = addDays(currentDate, 1);
      continue;
    }

    // Generate slots for this day
    let slotStart = setMinutes(setHours(currentDate, config.workDayStart), 0);
    const dayEnd = setMinutes(setHours(currentDate, config.workDayEnd), 0);

    while (isBefore(slotStart, dayEnd)) {
      const slotEnd = addMinutes(slotStart, config.slotDuration);
      const hour = slotStart.getHours();

      // Skip break time
      if (config.breakStart && config.breakEnd && hour >= config.breakStart && hour < config.breakEnd) {
        slotStart = slotEnd;
        continue;
      }

      // Check if slot conflicts with existing appointments
      const dateStr = format(slotStart, 'yyyy-MM-dd');
      const timeStr = format(slotStart, 'HH:mm');
      const isBooked = existingAppointments.some((apt) => {
        const aptDate = apt.date.split('T')[0];
        const aptTime = apt.date.includes('T') ? apt.date.split('T')[1].substring(0, 5) : '00:00';
        return aptDate === dateStr && aptTime === timeStr;
      });

      slots.push({
        id: `${dateStr}-${timeStr}`,
        agentId: '',
        date: dateStr,
        startTime: timeStr,
        endTime: format(slotEnd, 'HH:mm'),
        isAvailable: !isBooked,
        appointmentId: isBooked ? existingAppointments.find((apt) => apt.date.includes(dateStr))?.id : undefined,
      });

      slotStart = slotEnd;
    }

    currentDate = addDays(currentDate, 1);
  }

  return slots;
};

/**
 * Find the next available slot
 */
export const findNextAvailableSlot = (
  startFrom: Date,
  existingAppointments: Appointment[],
  config: SchedulerConfig = DEFAULT_CONFIG
): ScheduleSlot | null => {
  const endDate = addDays(startFrom, 30); // Search up to 30 days ahead
  const slots = generateTimeSlots(startFrom, endDate, existingAppointments, config);
  return slots.find((slot) => slot.isAvailable) || null;
};

/**
 * Check if a specific time slot is available
 */
export const isSlotAvailable = (
  date: string,
  time: string,
  existingAppointments: Appointment[]
): boolean => {
  return !existingAppointments.some((apt) => {
    const aptDate = apt.date.split('T')[0];
    const aptTime = apt.date.includes('T') ? apt.date.split('T')[1].substring(0, 5) : '00:00';
    return aptDate === date && aptTime === time;
  });
};

/**
 * Suggest optimal appointment times based on lead temperature
 */
export const suggestOptimalTimes = (
  leadTemperature: 'HOT' | 'WARM' | 'COLD',
  existingAppointments: Appointment[],
  config: SchedulerConfig = DEFAULT_CONFIG
): ScheduleSlot[] => {
  const now = new Date();
  let searchDays: number;

  // HOT leads should be scheduled ASAP, COLD leads can wait
  switch (leadTemperature) {
    case 'HOT':
      searchDays = 3;
      break;
    case 'WARM':
      searchDays = 7;
      break;
    case 'COLD':
      searchDays = 14;
      break;
  }

  const endDate = addDays(now, searchDays);
  const slots = generateTimeSlots(now, endDate, existingAppointments, config);

  // Return first 5 available slots
  return slots.filter((slot) => slot.isAvailable).slice(0, 5);
};
