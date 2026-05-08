import { useNumberAnimation } from '@/hooks/useNumberAnimation';

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  start: boolean;
  color?: string;
};

export default function StatCounter({
  value,
  prefix = '',
  suffix = '',
  label,
  duration,
  start,
  color = 'text-white',
}: Props) {
  const animatedValue = useNumberAnimation({
    to: value,
    duration,
    start,
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <dt
        className={`text-6xl md:text-7xl font-extrabold tabular-nums leading-none ${color}`}
        aria-hidden="true"
      >
        {prefix}{animatedValue}{suffix}
      </dt>
      <dd
        className={`text-sm md:text-base uppercase tracking-widest text-center font-medium ${color}`}
        aria-hidden="true"
      >
        {label}
      </dd>
    </div>
  );
}
