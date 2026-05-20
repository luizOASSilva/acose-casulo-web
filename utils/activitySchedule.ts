import type { ActivitySchedule, Weekday } from '@/types/activity';

export const weekdayLabels: Record<Weekday, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const weekdayShortLabels: Record<Weekday, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const weekdayOptions: Array<{
  value: Weekday;
  label: string;
}> = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

export function formatTime(time?: string) {
  if (!time) return '';

  const [hour, minute] = time.split(':');

  if (!hour || !minute) return time;

  return `${hour}h${minute === '00' ? '' : minute}`;
}

export function formatSchedule(schedule: ActivitySchedule) {
  return {
    day: weekdayLabels[schedule.weekday] || schedule.weekday,
    shortDay: weekdayShortLabels[schedule.weekday] || schedule.weekday,
    time: `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`,
  };
}
