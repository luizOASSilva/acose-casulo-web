import { useNumberAnimation } from '@/hooks/useNumberAnimation';

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  start: boolean;
};

export default function StatCounter({
  value,
  prefix = '',
  suffix = '',
  label,
  duration,
  start,
}: Props) {
  const animatedValue = useNumberAnimation({
    to: value,
    duration,
    start,
  });

  return (
    <div
      className="flex flex-col items-center gap-3"
      role="group"
      aria-label={`${label}: ${prefix}${value}${suffix}`}
    >
      <dt
        className="text-6xl md:text-7xl font-extrabold tabular-nums leading-none text-white"
        aria-hidden="true"
      >
        {prefix}
        {animatedValue}
        {suffix}
      </dt>

      <dd
        className="text-sm md:text-base uppercase tracking-widest text-center text-white font-medium"
        aria-hidden="true"
      >
        {label}
      </dd>
    </div>
  );
}
