'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, Clock } from 'lucide-react';

import type {
  OccupiedActivitySchedule,
  Weekday,
} from '@/types/activity';

interface ActivityScheduleAgendaProps {
  occupiedSchedules: OccupiedActivitySchedule[];
  currentActivityId?: number;
  defaultOpen?: boolean;
}

const weekdayLabels: Record<Weekday, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const weekdays: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export default function ActivityScheduleAgenda({
  occupiedSchedules,
  currentActivityId,
  defaultOpen = false,
}: ActivityScheduleAgendaProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const visibleSchedules = useMemo(() => {
    return occupiedSchedules
      .filter((schedule) => schedule.activity_id !== currentActivityId)
      .sort((a, b) => {
        const dayDiff =
          weekdays.indexOf(a.weekday) - weekdays.indexOf(b.weekday);

        if (dayDiff !== 0) return dayDiff;

        return a.start_time.localeCompare(b.start_time);
      });
  }, [occupiedSchedules, currentActivityId]);

  const groupedSchedules = useMemo(() => {
    return weekdays.map((weekday) => ({
      weekday,
      schedules: visibleSchedules.filter(
        (schedule) => schedule.weekday === weekday
      ),
    }));
  }, [visibleSchedules]);

  const hasSchedules = visibleSchedules.length > 0;

  return (
    <section className="rounded-md border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Agenda ocupada da semana
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Consulte os horários já cadastrados antes de adicionar um novo.
            </p>
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50/70 p-5">
          {hasSchedules ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {groupedSchedules.map(({ weekday, schedules }) => (
                <div
                  key={weekday}
                  className="rounded-md border border-gray-200 bg-white p-4"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {weekdayLabels[weekday]}
                  </h4>

                  {schedules.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {schedules.map((schedule) => (
                        <li
                          key={schedule.id}
                          className="rounded-md border border-orange-100 bg-orange-50 px-3 py-2"
                        >
                          <p className="text-sm font-semibold text-gray-900">
                            {schedule.activity_title || 'Atividade sem título'}
                          </p>

                          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700">
                            <Clock className="h-3.5 w-3.5" />
                            {schedule.start_time} às {schedule.end_time}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs italic text-gray-400">
                      Nenhum horário ocupado.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center">
              <p className="text-sm font-semibold text-gray-800">
                Nenhum horário ocupado ainda.
              </p>

              <p className="mt-1 text-xs text-gray-500">
                A agenda aparecerá aqui quando existirem atividades cadastradas.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
